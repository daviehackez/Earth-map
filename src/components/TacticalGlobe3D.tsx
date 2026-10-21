import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LayerVisibility, StormSystem } from '../types/weather';
import {
  createTacticalEarthTexture,
  createCloudTurbulenceTexture,
  createAtmosphereMaterial,
  buildCompositeStormGroup,
} from '../services/proceduralGlobe';
import { soundFx } from '../services/soundFx';
import { latLonToVector3 } from '../services/stormData';

interface TacticalGlobe3DProps {
  storms: StormSystem[];
  selectedStorm: StormSystem | null;
  onSelectStorm: (storm: StormSystem | null) => void;
  layers: LayerVisibility;
  simulationSpeed: number; // 1, 5, 10
}

// Module-level pre-allocated scratch objects to prevent GC churn in render loop
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _stormPos = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const TacticalGlobe3D: React.FC<TacticalGlobe3DProps> = ({
  storms,
  selectedStorm,
  onSelectStorm,
  layers,
  simulationSpeed,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedStormRef = useRef<StormSystem | null>(selectedStorm);
  const layersRef = useRef<LayerVisibility>(layers);
  const speedRef = useRef<number>(simulationSpeed);

  // Sync refs so loop never needs to be torn down
  useEffect(() => {
    selectedStormRef.current = selectedStorm;
  }, [selectedStorm]);

  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  useEffect(() => {
    speedRef.current = simulationSpeed;
  }, [simulationSpeed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL as per Three.js skill directive
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.038);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(8, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x00f0ff, 0x070b14, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    // 5. Controls with exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3.6;
    controls.maxDistance = 14.0;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.9;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.4;

    // 6. Deep Starfield
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 25 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const colorVal = 0.6 + Math.random() * 0.4;
      starColors[i * 3] = colorVal * 0.8;
      starColors[i * 3 + 1] = colorVal * 0.9;
      starColors[i * 3 + 2] = colorVal;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 7. Earth Globe
    const globeRadius = 3.0;
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 48);
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthTexture = createTacticalEarthTexture(maxAnisotropy);

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.2,
      bumpScale: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 8. Atmospheric Inverted Fresnel Glow Rim
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMat = createAtmosphereMaterial();
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 9. Procedural Cloud & Vortex Flow Sphere
    const cloudGeo = new THREE.SphereGeometry(globeRadius * 1.018, 48, 36);
    const cloudTexture = createCloudTurbulenceTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      roughness: 0.9,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // 10. Composite Storm Subjects Mount
    const stormGroups: {
      storm: StormSystem;
      group: THREE.Group;
      spiralArms: THREE.Points[];
      radarDisk: THREE.Mesh;
      coneMesh: THREE.Mesh | null;
      trackLine: THREE.Line | null;
      hitboxName: string;
    }[] = [];

    storms.forEach((st) => {
      const stormObj = buildCompositeStormGroup(st, globeRadius);
      scene.add(stormObj.group);
      if (stormObj.coneMesh) scene.add(stormObj.coneMesh);
      if (stormObj.trackLine) scene.add(stormObj.trackLine);

      stormGroups.push({
        storm: st,
        group: stormObj.group,
        spiralArms: stormObj.spiralArms,
        radarDisk: stormObj.radarDisk,
        coneMesh: stormObj.coneMesh,
        trackLine: stormObj.trackLine,
        hitboxName: `hitbox_${st.id}`,
      });
    });

    // 11. Camera Smooth Transition State
    let isTransitioningCamera = false;
    let cameraTargetPos = new THREE.Vector3();
    let controlsTargetPos = new THREE.Vector3();

    controls.addEventListener('start', () => {
      // User manual touch/drag halts programmatic transition
      isTransitioningCamera = false;
    });

    // 12. Pointer Raycasting for Storm Selection
    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        const found = stormGroups.find(
          (sg) => sg.hitboxName === hit.object.name || hit.object.name.includes(sg.storm.id)
        );
        if (found) {
          soundFx.playCameraLock();
          onSelectStorm(found.storm);
          return;
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 13. Handle Window Resizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 14. Animation & Simulation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = clock.getDelta();
      const speed = speedRef.current;
      const activeLayers = layersRef.current;
      const activeStorm = selectedStormRef.current;

      // Rotate cloud vortex layer slowly
      if (activeLayers.cloudVortex) {
        cloudMesh.visible = true;
        cloudMesh.rotation.y += 0.015 * delta * speed;
      } else {
        cloudMesh.visible = false;
      }

      // Day / Night Sun position simulation
      if (activeLayers.dayNight) {
        const sunAngle = Date.now() * 0.0001 * speed;
        keyLight.position.x = Math.cos(sunAngle) * 9;
        keyLight.position.z = Math.sin(sunAngle) * 9;
      }

      // Update storm dynamic animations
      stormGroups.forEach(({ storm, spiralArms, radarDisk, coneMesh, trackLine }) => {
        // Toggle forecast cone visibility
        if (coneMesh) {
          coneMesh.visible = activeLayers.forecastCones;
        }
        if (trackLine) {
          trackLine.visible = activeLayers.forecastCones;
        }

        // Radar sweep rotation
        if (activeLayers.radar) {
          radarDisk.visible = true;
          radarDisk.rotation.z += 1.8 * delta * speed;
        } else {
          radarDisk.visible = false;
        }

        // Swirling spiral arms (rotation rate scaled to wind speed)
        if (activeLayers.windVectors) {
          const rotSpeed = (storm.windSpeedKnots / 80) * delta * speed;
          // Northern hemisphere counter-clockwise, southern clockwise
          const dir = storm.center.lat >= 0 ? 1 : -1;
          spiralArms.forEach((arms, idx) => {
            arms.visible = true;
            arms.rotation.y += dir * rotSpeed * (1 + idx * 0.35);
          });
        } else {
          spiralArms.forEach((arms) => {
            arms.visible = false;
          });
        }
      });

      // Camera smooth focusing on selected storm
      if (activeStorm) {
        const [sx, sy, sz] = latLonToVector3(activeStorm.center.lat, activeStorm.center.lon, globeRadius);
        _stormPos.set(sx, sy, sz);

        // Desired camera position hovering above the storm
        const normal = _stormPos.clone().normalize();
        cameraTargetPos.copy(_stormPos).add(normal.multiplyScalar(2.6));
        controlsTargetPos.copy(_stormPos);

        if (!isTransitioningCamera) {
          isTransitioningCamera = true;
        }

        if (isTransitioningCamera) {
          const smoothFactor = 1 - Math.exp(-4.5 * delta);
          camera.position.lerp(cameraTargetPos, smoothFactor);
          controls.target.lerp(controlsTargetPos, smoothFactor);

          if (camera.position.distanceTo(cameraTargetPos) < 0.08) {
            isTransitioningCamera = false;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // 15. Safe Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();

      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      cloudTexture.dispose();
      starGeo.dispose();
      starMat.dispose();

      stormGroups.forEach(({ group, coneMesh, trackLine }) => {
        scene.remove(group);
        if (coneMesh) {
          scene.remove(coneMesh);
          coneMesh.geometry.dispose();
        }
        if (trackLine) {
          scene.remove(trackLine);
          trackLine.geometry.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [storms, onSelectStorm]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#050811] touch-none cursor-grab active:cursor-grabbing select-none"
    />
  );
};
