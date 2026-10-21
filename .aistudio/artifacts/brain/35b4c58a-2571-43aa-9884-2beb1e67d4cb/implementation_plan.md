# VortexGlobe — 3D Global Weather & Real-Time Storm Tracking

VortexGlobe is an immersive, high-performance 3D planetary weather visualization tool built with Three.js and React. It empowers users to track active tropical storms, typhoons, and hurricanes globally in real time with category wind radii, dynamic forecast cones, animated radar sweeps, atmospheric glow, and a tactical HUD designed for mobile and desktop.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed from your answers:

- **Confirmed — Storm Data & Visual Layers**: Active global storms tracked with Saffir-Simpson category ratings (Cat 1–5, Tropical Storm, Super Typhoon), sustained wind speeds, central barometric pressure, forward motion vectors, and 3-to-5-day cone of uncertainty forecasts.
- **Confirmed — Visual Aesthetic**: Tactical dark sci-fi aesthetic featuring an obsidian globe, glowing cyan atmospheric Fresnel rim, procedural illuminated coastlines, dynamic swirling storm vortex particles, and sweeping radar rings.
- **Confirmed — Onboarding & Mobile Shell**: Cinematic radar boot splash screen with audio-visual ambiance, followed by a 3-step interactive feature tour (Globe Navigation, Storm Telemetry & Cones, Layer Controls) with quick-jump storm presets and mobile-optimized collapsible dock.
- **Confirmed — Packaging & APK**: Packaged with PWA manifest and mobile touch gestures, plus generating a deployable Android debug APK in `APP/OUTPUT/App-debug.apk`.

---

## 1. Overview & Core Concept

- **What It Does**: Renders a photorealistic, tactical 3D interactive Earth globe running at 60 FPS. Displays live active storms across the Atlantic, Pacific, and Indian Oceans with multi-ring eyewalls, spiral rain bands, category color-coding, interactive storm inspection, forecast cones, wind field vectors, and real-time radar simulation sweeps.
- **Target Audience / Persona**: Weather enthusiasts, maritime operators, emergency preparedness monitors, and users seeking a breathtaking, touch-friendly 3D planetary tracking tool on their phone or desktop.
- **Key Value**: Delivers complex meteorological phenomena (typhoon tracks, wind radii, pressure anomalies, isobaric lines) in an intuitive, responsive 3D spatial interface with zero external file dependencies or fragile 404s.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Cinematic Splash Screen**: Upon app launch, an atmospheric tactical radar sweep initializes with a status check, telemetry boot sequence, and animated sound toggle, smoothly fading into the main interface.
2. **Interactive Onboarding (3-Step Tour)**:
   - *Step 1: Planetary Exploration* — Introduces 3D touch orbit, pinch-to-zoom, and auto-rotation.
   - *Step 2: Storm Diagnostics* — Shows how tapping any storm pin locks the camera to the vortex, revealing sustained winds, category rating, central pressure, and 5-day forecast cone.
   - *Step 3: Atmospheric & Radar Layers* — Demonstrates switching wind vectors, precipitation radar sweeps, isobaric pressure contours, and day/night sunlight.
   - *Quick Start*: Offers instant jump to active major storms (e.g., Cat 4 Super Typhoon or Atlantic Hurricane) or direct globe exploration.
3. **Primary Tactical Globe View**:
   - 100% full-bleed Three.js WebGL canvas.
   - Top Bar Contract: Wordmark `VORTEX GLOBE`, active storm counter, live UTC clock, search/filter, and layer switch button.
   - Collapsible Bottom Control Dock: Compact horizontal dock (`<= 15%` viewport height) with layer toggles (Radar, Wind, Cones, Cloud Vortex, Day/Night), playback time controls, and camera reset.
4. **Storm Deep Dive Drawer**:
   - Tapping a storm smoothly glides the camera using exponential damping (`THREE.MathUtils.damp`) to center the storm vortex.
   - Displays real-time telemetry: Name, Ocean Basin, Category badge (Cat 1–5), Wind Speed (knots/mph/kmh toggle), Central Pressure (hPa), Track Coordinates, and Future Path Waypoints with uncertainty cone.

### Visual Identity & Theme Tokens
- **Canvas Base**: Deep Tactical Obsidian (`#050811`) with starfield depth and horizon fog fade-off.
- **Globe Surface**: Dark slate bathymetric oceans with high specular roughness, neon cyan coastlines (`#00f0ff`), and subtle continent topography.
- **Atmospheric Glow**: Dual-layer Fresnel atmospheric rim with cyan and deep royal blue scattering.
- **Storm Vortex Colors**:
  - Super Typhoon / Cat 5: Magenta & Bright Crimson (`#ef4444` / `#f43f5e`)
  - Cat 4 / Cat 3 Hurricane: Solar Amber & Bright Orange (`#f59e0b` / `#fb923c`)
  - Cat 1–2 Tropical Cyclone: Electric Gold & Cyan (`#eab308` / `#06b6d4`)
  - Tropical Storm / Depression: Emerald Mint (`#10b981`)
- **Typography**: Display headlines in `Plus Jakarta Sans`, data and telemetry in `IBM Plex Mono` / `tabular-nums` for rock-solid number alignment.
- **Anti-Slop Discipline**: No decorative pulsing dots, no code-comment titles, clean unboxed metadata with `·` separators, and single-elevation glassmorphic surfaces.

---

## 3. Key Product Decisions & Trade-Offs

- **Procedural Textures & Shaders vs External Image Downloads**:
  - *Decision*: Procedurally generate the high-resolution planetary texture, coastline contours, cloud band vortexes, and radar sweep patterns directly in WebGL shaders and HTML5 2D Canvas textures.
  - *Why*: Eliminates broken 404 network assets, ensures instant offline startup on mobile devices, and enables dynamic real-time shader animations (clouds swirling into storm eyewalls).
- **3D Storm Geometry Composition**:
  - *Decision*: Build each storm as a composite 4-layer `THREE.Group`: (1) Calm central eye core with low pressure marker, (2) Multi-layered swirling spiral arms using logarithmic particle rings, (3) Glowing animated radar ring sweep, and (4) Saffir-Simpson category beacon with track cone spline.
  - *Why*: Satisfies the Three.js skill directive (composite 3–12 part procedural models) and gives tangible physical presence to weather systems.
- **Camera & Touch Interaction Choreography**:
  - *Decision*: OrbitControls with frame-rate independent exponential damping (`1 - Math.exp(-k * dt)`) and smooth focus lerping when selecting storms.
  - *Why*: Prevents jarring camera cuts, provides tactile weight on mobile touchscreens, and auto-disables transition fighting when the user drags the globe.
- **Mobile First & APK Packaging**:
  - *Decision*: Ensure full mobile PWA compliance with manifest, touch-friendly touch targets ($\ge 44\text{px}$), safe-area insets, and package the release/debug artifact to `APP/OUTPUT/App-debug.apk`.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│    (State: Active Screen, Selected Storm, Layers, Units, Audio)        │
└───────────────┬───────────────────────────────────────┬────────────────┘
                │                                       │
      ┌─────────┴─────────┐                   ┌─────────┴──────────┐
      ▼                   ▼                   ▼                    ▼
┌─────────────┐   ┌───────────────┐   ┌─────────────────┐   ┌────────────┐
│ SplashScreen│   │ OnboardingTour│   │ TacticalGlobe3D │   │ StormDrawer│
│ (Radar Boot │   │ (3-Step Tour, │   │ (Three.js Scene,│   │ (Telemetry,│
│  Diagnostics│   │  Presets,     │   │  Procedural PBR │   │  Wind Radii│
│  Sound FX)  │   │  Touch Hints) │   │  Atmosphere,    │   │  Forecasts)│
└─────────────┘   └───────────────┘   │  Storm Groups,  │   └────────────┘
                                      │  OrbitControls) │
                                      └────────┬────────┘
                                               │
                                      ┌────────┴────────┐
                                      ▼                 ▼
                              ┌───────────────┐ ┌───────────────┐
                              │ Procedural    │ │ BottomDock    │
                              │ Earth Shader  │ │ (Radar, Wind, │
                              │ & Cloud Bands │ │  Cones, Time) │
                              └───────────────┘ └───────────────┘
```

### Meteorological Data Model
- **Storm Entity**:
  - `id`: Unique identifier (e.g. `TY-2026-04`, `HUR-BERYL`)
  - `name`: Official meteorological name
  - `basin`: Western Pacific, North Atlantic, Eastern Pacific, North Indian, South Pacific
  - `category`: 0 (Depression), 1–5 (Saffir-Simpson)
  - `center`: `{ lat: number, lon: number }`
  - `windSpeed`: knots, with mph and km/h conversions
  - `gusts`: peak gusts in knots
  - `pressure`: central barometric pressure (hPa/mb)
  - `movement`: `{ heading: number, speedKnots: number }`
  - `radii`: wind radii quadrants (34kt, 50kt, 64kt)
  - `forecast`: array of waypoint predictions (+12h, +24h, +48h, +72h, +96h, +120h) with expanding uncertainty radii for the cone polygon.

### Performance & WebGL Safeguards
- Pre-allocated scratch vectors (`_v1`, `_v2`, `_quat`, `_mat`) outside render tick to prevent GC pauses.
- Raycasting limited strictly to storm anchor hitboxes with throttled pointer events.
- Device pixel ratio capped at 2.0 (`Math.min(window.devicePixelRatio, 2)`).
- Full cleanup of Three.js geometries, materials, and textures on unmount.
