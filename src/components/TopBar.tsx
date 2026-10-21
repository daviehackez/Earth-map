import React, { useState, useEffect } from 'react';
import { soundFx } from '../services/soundFx';
import { Volume2, VolumeX, HelpCircle, ListFilter, RotateCcw, Smartphone } from 'lucide-react';

interface TopBarProps {
  stormCount: number;
  onOpenStormList: () => void;
  onOpenTour: () => void;
  onResetView: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  stormCount,
  onOpenStormList,
  onOpenTour,
  onResetView,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.playClick();
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-[#050811]/90 border-b border-slate-800/80 backdrop-blur-none select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
          VORTEX<span className="text-cyan-400">GLOBE</span>
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text links / metadata with unboxed typographic separators */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 whitespace-nowrap overflow-hidden">
        <span className="text-slate-300 font-medium">
          {stormCount} ACTIVE SYSTEMS
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-400">
          JTWC / NHC REAL-TIME FEED
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-cyan-400 font-mono tabular-nums">
          {utcTime}
        </span>
      </div>

      {/* Zone 3: Primary action & utilities */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            onResetView();
          }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reset Global View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenTour();
          }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Guide & Presets"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'Unmute procedural sound' : 'Mute procedural sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <a
          href="/App-debug.apk"
          download="App-debug.apk"
          onClick={() => soundFx.playClick()}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-400 font-mono text-xs transition-colors whitespace-nowrap"
          title="Download Debug APK (APP/OUTPUT/App-debug.apk)"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>APK</span>
        </a>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenStormList();
          }}
          className="py-1.5 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Active Storms ({stormCount})</span>
        </button>
      </div>
    </header>
  );
};
