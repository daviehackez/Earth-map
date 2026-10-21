import React, { useState } from 'react';
import { LayerVisibility } from '../types/weather';
import { soundFx } from '../services/soundFx';
import {
  Radio,
  Wind,
  Layers,
  CloudRain,
  SunMoon,
  ChevronDown,
  ChevronUp,
  FastForward,
} from 'lucide-react';

interface BottomControlDockProps {
  layers: LayerVisibility;
  onToggleLayer: (layerKey: keyof LayerVisibility) => void;
  simulationSpeed: number;
  onSetSimulationSpeed: (speed: number) => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  layers,
  onToggleLayer,
  simulationSpeed,
  onSetSimulationSpeed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleLayerWithSound = (key: keyof LayerVisibility) => {
    soundFx.playClick();
    onToggleLayer(key);
  };

  const cycleSpeed = () => {
    soundFx.playClick();
    const nextSpeed = simulationSpeed === 1 ? 5 : simulationSpeed === 5 ? 10 : 1;
    onSetSimulationSpeed(nextSpeed);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[min(940px,94vw)] w-full select-none pointer-events-auto">
      {/* Collapsible Zen Mode Toggle Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsCollapsed(!isCollapsed);
        }}
        className="mb-1 py-1 px-3 rounded-full bg-[#0a1226] border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
        title={isCollapsed ? 'Show Tactical HUD' : 'Collapse HUD for full view'}
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>SHOW CONTROLS</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>CINEMA MODE</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="w-full bg-[#070e22]/95 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Layer Selector Switches */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-400 px-2 uppercase shrink-0 hidden lg:inline">
              LAYERS:
            </span>

            {/* Radar Sweeps */}
            <button
              onClick={() => toggleLayerWithSound('radar')}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                layers.radar
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Radar</span>
            </button>

            {/* Wind Vectors */}
            <button
              onClick={() => toggleLayerWithSound('windVectors')}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                layers.windVectors
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Wind Flow</span>
            </button>

            {/* Forecast Cones */}
            <button
              onClick={() => toggleLayerWithSound('forecastCones')}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                layers.forecastCones
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>5-Day Cones</span>
            </button>

            {/* Cloud Vortex */}
            <button
              onClick={() => toggleLayerWithSound('cloudVortex')}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                layers.cloudVortex
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Clouds</span>
            </button>

            {/* Day / Night Terminator */}
            <button
              onClick={() => toggleLayerWithSound('dayNight')}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                layers.dayNight
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <SunMoon className="w-3.5 h-3.5" />
              <span>Day / Night</span>
            </button>
          </div>

          {/* Speed & Sim Rate Multiplier */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={cycleSpeed}
              className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
              title="Change simulation time warp"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIM {simulationSpeed}x</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
