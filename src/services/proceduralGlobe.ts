import * as THREE from 'three';
import { StormSystem, StormWaypoint } from '../types/weather';
import { latLonToVector3 } from './stormData';

/**
 * Generates an ultra-crisp procedural high-res Earth texture for tactical sci-fi mode:
 * - Deep obsidian bathymetric oceans
 * - Continent landmasses with neon cyan coastlines
 * - Tactical latitude/longitude coordinate grid
 * - Accurate continent silhouettes drawn mathematically
 */
export function createTacticalEarthTexture(anisotropy: number): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#040814');
  oceanGrad.addColorStop(0.5, '#070f24');
  oceanGrad.addColorStop(1, '#040814');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean bathymetric grid / noise
  ctx.fillStyle = 'rgba(0, 240, 255, 0.015)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }

  // Draw simplified high-fidelity landmasses using equirectangular projection
  // North America, South America, Eurasia, Africa, Australia, Antarctica
  ctx.fillStyle = '#0a162e';
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.8;

  function toX(lon: number) {
    return ((lon + 180) / 360) * width;
  }
  function toY(lat: number) {
    return ((90 - lat) / 180) * height;
  }

  function drawContinent(points: [number, number][]) {
    if (points.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(toX(points[0][1]), toY(points[0][0]));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(toX(points[i][1]), toY(points[i][0]));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 1. North America
  drawContinent([
    [70, -165], [71, -130], [68, -85], [60, -64], [47, -53], [44, -66],
    [35, -75], [25, -80], [28, -96], [20, -97], [16, -93], [8, -78],
    [10, -84], [16, -98], [24, -110], [32, -117], [38, -123], [48, -125],
    [58, -136], [60, -145], [65, -168]
  ]);

  // 2. Greenland
  drawContinent([
    [82, -40], [80, -20], [70, -22], [60, -45], [70, -55], [78, -68]
  ]);

  // 3. South America
  drawContinent([
    [12, -72], [10, -62], [4, -51], [-3, -40], [-10, -36], [-22, -41],
    [-34, -53], [-46, -66], [-55, -67], [-52, -75], [-40, -74], [-30, -72],
    [-18, -70], [-5, -81], [5, -77]
  ]);

  // 4. Europe & Asia (Eurasia)
  drawContinent([
    [71, 28], [70, 60], [75, 100], [76, 140], [70, 178], [60, 160],
    [54, 140], [42, 131], [35, 128], [30, 122], [22, 114], [10, 105],
    [1, 104], [13, 100], [22, 90], [20, 85], [8, 77], [22, 70],
    [25, 60], [26, 56], [30, 48], [31, 35], [37, 27], [36, -5],
    [44, -1], [48, -4], [54, 8], [60, 5], [70, 20]
  ]);

  // 5. Great Britain & Japan
  drawContinent([[58, -5], [51, 1], [50, -5], [55, -3]]);
  drawContinent([[45, 142], [35, 140], [33, 130], [40, 136]]);

  // 6. Africa
  drawContinent([
    [36, -5], [37, 10], [32, 25], [31, 32], [22, 38], [12, 51],
    [-2, 40], [-12, 40], [-25, 33], [-34, 25], [-34, 18], [-28, 15],
    [-16, 12], [-5, 12], [5, 2], [5, -1], [6, -10], [15, -17],
    [22, -17], [30, -10]
  ]);

  // 7. Australia
  drawContinent([
    [-12, 136], [-12, 142], [-20, 149], [-28, 153], [-37, 150],
    [-38, 140], [-35, 115], [-22, 114], [-15, 124]
  ]);

  // 8. Antarctica
  drawContinent([
    [-65, -60], [-72, 0], [-68, 60], [-66, 120], [-70, 160],
    [-76, 180], [-80, -140], [-75, -90]
  ]);

  // Tactical Lat/Long coordinate lines (meridians and parallels)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 6]);

  // Parallels (every 30 degrees)
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = toY(lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Meridians (every 45 degrees)
  for (let lon = -135; lon <= 180; lon += 45) {
    const x = toX(lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator emphasis
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Prime Meridian emphasis
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates dynamic procedural Cloud & Vortex band texture
 */
export function createCloudTurbulenceTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft flowing cloud swirls and trade wind bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * canvas.height;
    const waveAmp = 12 + Math.sin(i * 0.4) * 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 30) {
      const cy = y + Math.sin((x / canvas.width) * Math.PI * 6 + i) * waveAmp;
      ctx.lineTo(x, cy);
    }
    ctx.lineWidth = 6 + Math.cos(i) * 3;
    ctx.strokeStyle = `rgba(220, 240, 255, ${0.08 + Math.sin(i * 0.3) * 0.05})`;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Atmospheric Fresnel Rim Shader Material
 * Creates a glowing cyan / electric blue horizon halo
 */
export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x00f0ff) },
      viewVector: { value: new THREE.Vector3() },
      rimPower: { value: 3.2 },
      rimIntensity: { value: 1.4 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float rimPower;
      uniform float rimIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float fresnel = dot(viewDir, vNormal);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        float intensity = pow(fresnel, rimPower) * rimIntensity;
        gl_FragColor = vec4(glowColor, intensity);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}

/**
 * Composite Procedural Storm Model (3–12 parts as per skill guidelines):
 * 1. Calm central eye core cylinder
 * 2. Multi-tiered logarithmic spiral arms (3 distinct particle ring layers)
 * 3. Animated radar sweep disk with quadrant markings
 * 4. Tactical beacon light beam
 * 5. 5-day forecast cone of uncertainty ribbon
 * 6. Historical track spline line
 */
export function buildCompositeStormGroup(
  storm: StormSystem,
  globeRadius: number
): {
  group: THREE.Group;
  spiralArms: THREE.Points[];
  radarDisk: THREE.Mesh;
  radarMat: THREE.MeshBasicMaterial;
  coneMesh: THREE.Mesh | null;
  trackLine: THREE.Line | null;
  beaconMesh: THREE.Mesh;
} {
  const stormGroup = new THREE.Group();
  stormGroup.name = `storm_${storm.id}`;

  const [x, y, z] = latLonToVector3(storm.center.lat, storm.center.lon, globeRadius);
  stormGroup.position.set(x, y, z);

  // Orient storm group tangential to the sphere surface
  const normal = new THREE.Vector3(x, y, z).normalize();
  stormGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  const stormColor = new THREE.Color(storm.color);

  // 1. Central Calm Eye Core
  const eyeRadius = 0.045;
  const eyeGeo = new THREE.RingGeometry(0.01, eyeRadius, 32);
  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0x050811,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
  eyeMesh.rotation.x = Math.PI / 2;
  eyeMesh.position.y = 0.01;
  stormGroup.add(eyeMesh);

  // 2. Multi-Tiered Swirling Spiral Arms (Particle Rings with Logarithmic Spirals)
  const spiralArmLayers: THREE.Points[] = [];
  const armCounts = [240, 180, 140];
  const armRadii = [0.18, 0.28, 0.38];

  armCounts.forEach((count, layerIdx) => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const maxR = armRadii[layerIdx];

    for (let i = 0; i < count; i++) {
      const arm = i % 3; // 3-arm spiral
      const t = (i / count);
      const angle = arm * ((Math.PI * 2) / 3) + t * Math.PI * 3.5;
      const r = 0.04 + t * maxR;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = 0.015 + (layerIdx * 0.005);
      positions[i * 3 + 2] = Math.sin(angle) * r;

      const alphaColor = stormColor.clone().lerp(new THREE.Color(0xffffff), 0.25);
      colors[i * 3] = alphaColor.r;
      colors[i * 3 + 1] = alphaColor.g;
      colors[i * 3 + 2] = alphaColor.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.022 - layerIdx * 0.004,
      vertexColors: true,
      transparent: true,
      opacity: 0.85 - layerIdx * 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const armPoints = new THREE.Points(geo, pMat);
    stormGroup.add(armPoints);
    spiralArmLayers.push(armPoints);
  });

  // 3. Animated Radar Reflectivity Sweep Disk
  const radarCanvas = document.createElement('canvas');
  radarCanvas.width = 256;
  radarCanvas.height = 256;
  const rCtx = radarCanvas.getContext('2d')!;

  // Draw concentric radar rings
  rCtx.clearRect(0, 0, 256, 256);
  rCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  rCtx.lineWidth = 2;
  [30, 60, 90, 120].forEach((rad) => {
    rCtx.beginPath();
    rCtx.arc(128, 128, rad, 0, Math.PI * 2);
    rCtx.stroke();
  });

  // Radar beam sweep gradient
  const sweepGrad = rCtx.createConicGradient(0, 128, 128);
  sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
  sweepGrad.addColorStop(0.15, 'rgba(0, 240, 255, 0.1)');
  sweepGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0)');
  sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  rCtx.fillStyle = sweepGrad;
  rCtx.beginPath();
  rCtx.arc(128, 128, 120, 0, Math.PI * 2);
  rCtx.fill();

  const radarTex = new THREE.CanvasTexture(radarCanvas);
  radarTex.colorSpace = THREE.SRGBColorSpace;

  const radarGeo = new THREE.PlaneGeometry(0.75, 0.75);
  const radarMat = new THREE.MeshBasicMaterial({
    map: radarTex,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const radarDisk = new THREE.Mesh(radarGeo, radarMat);
  radarDisk.rotation.x = Math.PI / 2;
  radarDisk.position.y = 0.008;
  stormGroup.add(radarDisk);

  // 4. Tactical Category Beacon Light Beam
  const beaconHeight = 0.45;
  const beaconGeo = new THREE.CylinderGeometry(0.004, 0.015, beaconHeight, 16);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: stormColor,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  beaconMesh.position.y = beaconHeight / 2;
  stormGroup.add(beaconMesh);

  // Click hitbox sphere for precise raycasting
  const hitGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.name = `hitbox_${storm.id}`;
  stormGroup.add(hitMesh);

  // 5. 5-Day Forecast Cone of Uncertainty Geometry (Relative to Earth Center)
  let coneMesh: THREE.Mesh | null = null;
  if (storm.forecast && storm.forecast.length > 0) {
    coneMesh = createForecastConeMesh(storm, globeRadius);
  }

  // 6. Historical Track Spline Line
  let trackLine: THREE.Line | null = null;
  if (storm.historicalTrack && storm.historicalTrack.length > 1) {
    trackLine = createHistoricalTrackLine(storm, globeRadius);
  }

  return {
    group: stormGroup,
    spiralArms: spiralArmLayers,
    radarDisk,
    radarMat,
    coneMesh,
    trackLine,
    beaconMesh,
  };
}

/**
 * Generates the 3D Forecast Cone of Uncertainty ribbon across the globe surface
 */
function createForecastConeMesh(storm: StormSystem, globeRadius: number): THREE.Mesh {
  const pointsLeft: THREE.Vector3[] = [];
  const pointsRight: THREE.Vector3[] = [];

  // Start at current center
  const [startX, startY, startZ] = latLonToVector3(storm.center.lat, storm.center.lon, globeRadius * 1.004);
  const startVec = new THREE.Vector3(startX, startY, startZ);
  pointsLeft.push(startVec);
  pointsRight.push(startVec);

  storm.forecast.forEach((wp: StormWaypoint) => {
    const [cx, cy, cz] = latLonToVector3(wp.lat, wp.lon, globeRadius * 1.004);
    const center = new THREE.Vector3(cx, cy, cz);
    const normal = center.clone().normalize();

    // Compute tangent perpendicular to path for cone spread
    const spread = (wp.uncertaintyRadiusKm / 6371) * globeRadius * 1.8;
    const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize().multiplyScalar(spread);

    pointsLeft.push(center.clone().add(tangent));
    pointsRight.push(center.clone().sub(tangent));
  });

  // Build triangulated triangle strip
  const vertices: number[] = [];
  for (let i = 0; i < pointsLeft.length - 1; i++) {
    const l1 = pointsLeft[i];
    const r1 = pointsRight[i];
    const l2 = pointsLeft[i + 1];
    const r2 = pointsRight[i + 1];

    // Triangle 1: l1, r1, l2
    vertices.push(l1.x, l1.y, l1.z);
    vertices.push(r1.x, r1.y, r1.z);
    vertices.push(l2.x, l2.y, l2.z);

    // Triangle 2: r1, r2, l2
    vertices.push(r1.x, r1.y, r1.z);
    vertices.push(r2.x, r2.y, r2.z);
    vertices.push(l2.x, l2.y, l2.z);
  }

  const coneGeo = new THREE.BufferGeometry();
  coneGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const coneMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(storm.color),
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(coneGeo, coneMat);
  mesh.name = `cone_${storm.id}`;
  return mesh;
}

/**
 * Generates historical track line
 */
function createHistoricalTrackLine(storm: StormSystem, globeRadius: number): THREE.Line {
  const points: THREE.Vector3[] = [];
  storm.historicalTrack.forEach((pt) => {
    const [px, py, pz] = latLonToVector3(pt.lat, pt.lon, globeRadius * 1.003);
    points.push(new THREE.Vector3(px, py, pz));
  });

  const curve = new THREE.CatmullRomCurve3(points);
  const splinePoints = curve.getPoints(50);
  const geo = new THREE.BufferGeometry().setFromPoints(splinePoints);

  const mat = new THREE.LineBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.65,
    linewidth: 2,
    depthWrite: false,
  });

  const line = new THREE.Line(geo, mat);
  line.name = `history_${storm.id}`;
  return line;
}
