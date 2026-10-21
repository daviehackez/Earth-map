import React, { useState, useEffect } from 'react';
import { soundFx } from '../services/soundFx';
import { Compass, Volume2, VolumeX, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState('CALIBRATING SATELLITE ORBITS...');
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());

  useEffect(() => {
    soundFx.playRadarPing();

    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusMessage('INGESTING JTWC & NHC CYCLONE TELEMETRY...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(78);
      setStatusMessage('COMPUTING 3D WIND RADII & FORECAST CONES...');
      soundFx.playRadarPing();
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusMessage('GLOBAL VORTEX TRACKER SYNCHRONIZED');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleStart = () => {
    soundFx.playClick();
    soundFx.startAmbientHum();
    onComplete();
  };

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.playRadarPing();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#040711] text-slate-100 select-none overflow-hidden">
      {/* Background Tactical Grid & Radar Rings */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="w-full max-w-md flex items-center justify-between pt-4 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>VORTEX GLOBE // SECURE FEED</span>
        </div>
        <button
          onClick={handleToggleSound}
          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono"
          title="Toggle audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO ACTIVE'}</span>
        </button>
      </div>

      {/* Hero Center Display */}
      <div className="flex flex-col items-center text-center my-auto relative z-10 max-w-sm px-4">
        {/* Animated Radar Sweep Graphic */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/40" />
          
          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/30" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/30" />

          {/* Rotating radar line */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(0,240,255,0.45)_0deg,transparent_60deg,transparent_360deg)] animate-[spin_3s_linear_infinite]" />

          {/* Core icon */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#070e1e] border border-cyan-400/60 flex items-center justify-center shadow-[0_0_24px_rgba(0,240,255,0.3)]">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          VORTEX <span className="text-cyan-400">GLOBE</span>
        </h1>
        <p className="text-sm text-slate-400 font-normal leading-relaxed mb-8 max-w-xs">
          Real-time 3D planetary storm tracking, category wind fields, and forecast cones.
        </p>

        {/* Boot Status Bar */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-6 text-left">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="truncate pr-2">{statusMessage}</span>
            <span className="font-semibold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleStart}
          disabled={progress < 100}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
            progress === 100
              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.35)] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>ENTER TRACKER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer Trust Markers */}
      <div className="w-full max-w-md pb-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2 relative z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
        <span>NOAA · JTWC · METEOROLOGICAL 3D PBR ENGINE</span>
      </div>
    </div>
  );
};
