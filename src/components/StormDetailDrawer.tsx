import React, { useState } from 'react';
import { StormSystem, SpeedUnit } from '../types/weather';
import { convertSpeed } from '../services/stormData';
import { soundFx } from '../services/soundFx';
import {
  X,
  Gauge,
  Navigation,
  Wind,
  Clock,
  Compass,
  FileText,
  MapPin,
  Maximize2,
} from 'lucide-react';

interface StormDetailDrawerProps {
  storm: StormSystem | null;
  onClose: () => void;
  onFocusStorm: (storm: StormSystem) => void;
}

export const StormDetailDrawer: React.FC<StormDetailDrawerProps> = ({
  storm,
  onClose,
  onFocusStorm,
}) => {
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('knots');

  if (!storm) return null;

  const sustainedWind = convertSpeed(storm.windSpeedKnots, speedUnit);
  const gustWind = convertSpeed(storm.gustsKnots, speedUnit);
  const forwardSpeed = convertSpeed(storm.movementSpeedKnots, speedUnit);

  const cycleSpeedUnit = () => {
    soundFx.playClick();
    setSpeedUnit((prev) => (prev === 'knots' ? 'mph' : prev === 'mph' ? 'kmh' : 'knots'));
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-6.5rem)] bg-[#070e24]/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase"
              style={{
                backgroundColor: `${storm.color}25`,
                color: storm.color,
                border: `1px solid ${storm.color}60`,
              }}
            >
              {storm.category === 0 ? 'TROPICAL STORM' : `CAT ${storm.category}`}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {storm.basin}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {storm.name}
          </h2>
          <div className="text-[11px] text-slate-400 font-mono">
            {storm.advisoryNumber} · {storm.formationDate}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundFx.playCameraLock();
              onFocusStorm(storm);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Center Camera on Vortex"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Telemetry Body */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Sustained Winds */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>SUSTAINED</span>
              </span>
              <button
                onClick={cycleSpeedUnit}
                className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                [{speedUnit.toUpperCase()}]
              </button>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {sustainedWind.value} <span className="text-xs font-normal text-slate-400">{sustainedWind.unitLabel}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Gusts: {gustWind.value} {gustWind.unitLabel}
            </div>
          </div>

          {/* Central Pressure */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>MIN PRESSURE</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {storm.pressureHpa} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Radial Drop: -{1013 - storm.pressureHpa} hPa
            </div>
          </div>
        </div>

        {/* Position & Motion Card */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>CURRENT CENTER</span>
            </span>
            <span className="font-mono text-white tabular-nums">
              {storm.center.lat.toFixed(1)}°N, {Math.abs(storm.center.lon).toFixed(1)}°{storm.center.lon >= 0 ? 'E' : 'W'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>FORWARD MOTION</span>
            </span>
            <span className="font-mono text-white tabular-nums">
              {storm.movementHeadingDeg}° at {forwardSpeed.value} {forwardSpeed.unitLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>EYEWALL RADIUS</span>
            </span>
            <span className="font-mono text-white tabular-nums">
              {storm.radiusKm} km ({Math.round(storm.radiusKm * 0.539957)} nm)
            </span>
          </div>
        </div>

        {/* Forecast Cone Waypoints */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>5-DAY FORECAST TRACK WAYPOINTS</span>
          </div>
          <div className="space-y-1.5">
            {storm.forecast.map((wp, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-cyan-400">
                    {wp.timestamp}
                  </span>
                  <span className="text-slate-300">
                    {wp.lat.toFixed(1)}°N, {Math.abs(wp.lon).toFixed(1)}°{wp.lon >= 0 ? 'E' : 'W'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-mono text-slate-200">
                    {wp.windSpeedKnots} kt
                  </span>
                  <span className="text-slate-500 font-mono">
                    ±{wp.uncertaintyRadiusKm}km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Synoptic Summary */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
          <div className="flex items-center gap-1 text-slate-400 font-mono mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>METEOROLOGICAL ANALYSIS</span>
          </div>
          {storm.summary}
        </div>
      </div>
    </div>
  );
};
