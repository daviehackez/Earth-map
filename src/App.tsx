/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StormSystem, LayerVisibility } from './types/weather';
import { INITIAL_STORMS } from './services/stormData';
import { TacticalGlobe3D } from './components/TacticalGlobe3D';
import { TopBar } from './components/TopBar';
import { BottomControlDock } from './components/BottomControlDock';
import { StormDetailDrawer } from './components/StormDetailDrawer';
import { StormListModal } from './components/StormListModal';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingTour } from './components/OnboardingTour';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [showStormList, setShowStormList] = useState(false);

  const [storms, setStorms] = useState<StormSystem[]>(INITIAL_STORMS);
  const [selectedStorm, setSelectedStorm] = useState<StormSystem | null>(null);

  const [layers, setLayers] = useState<LayerVisibility>({
    radar: true,
    windVectors: true,
    forecastCones: true,
    cloudVortex: true,
    dayNight: true,
    gridLines: true,
  });

  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Check if first-time visitor to open tour after splash
  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenTour = localStorage.getItem('vortex_tour_completed');
    if (!hasSeenTour) {
      setShowTour(true);
      localStorage.setItem('vortex_tour_completed', 'true');
    }
  };

  const handleToggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectStorm = useCallback((storm: StormSystem | null) => {
    setSelectedStorm(storm);
  }, []);

  const handleResetView = () => {
    setSelectedStorm(null);
  };

  // Simulated live meteorological drift / radar refresh updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStorms((prev) =>
        prev.map((st) => {
          // Micro gust fluctuations
          const gustDelta = (Math.random() - 0.5) * 1.5;
          const newGusts = Math.max(st.windSpeedKnots + 10, Math.round(st.gustsKnots + gustDelta));
          return {
            ...st,
            gustsKnots: newGusts,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050811] text-slate-100 font-sans select-none">
      {/* 1. Cinematic Radar Boot Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* 2. Interactive 3-Step Walkthrough Tour */}
      {showTour && (
        <OnboardingTour
          storms={storms}
          onSelectStorm={(st) => setSelectedStorm(st)}
          onDismiss={() => setShowTour(false)}
        />
      )}

      {/* 3. Full-Bleed 3D WebGL Three.js Planetary Scene */}
      <TacticalGlobe3D
        storms={storms}
        selectedStorm={selectedStorm}
        onSelectStorm={handleSelectStorm}
        layers={layers}
        simulationSpeed={simulationSpeed}
      />

      {/* 4. Top Navigation Bar (Contract Compliant) */}
      <TopBar
        stormCount={storms.length}
        onOpenStormList={() => setShowStormList(true)}
        onOpenTour={() => setShowTour(true)}
        onResetView={handleResetView}
      />

      {/* 5. Collapsible Bottom Control Dock */}
      <BottomControlDock
        layers={layers}
        onToggleLayer={handleToggleLayer}
        simulationSpeed={simulationSpeed}
        onSetSimulationSpeed={setSimulationSpeed}
      />

      {/* 6. Storm Telemetry Deep Dive Drawer */}
      <StormDetailDrawer
        storm={selectedStorm}
        onClose={() => setSelectedStorm(null)}
        onFocusStorm={(st) => setSelectedStorm(st)}
      />

      {/* 7. Storms List & Basin Filter Modal */}
      {showStormList && (
        <StormListModal
          storms={storms}
          selectedStorm={selectedStorm}
          onSelectStorm={(st) => setSelectedStorm(st)}
          onClose={() => setShowStormList(false)}
        />
      )}
    </div>
  );
}
