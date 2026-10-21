import React, { useState } from 'react';
import { StormSystem } from '../types/weather';
import { soundFx } from '../services/soundFx';
import { Globe, Wind, Radio, ChevronRight, Check, Zap, Smartphone } from 'lucide-react';

interface OnboardingTourProps {
  onDismiss: () => void;
  onSelectStorm: (storm: StormSystem) => void;
  storms: StormSystem[];
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  onDismiss,
  onSelectStorm,
  storms,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Global 3D Navigation',
      subtitle: 'Inspect Weather Systems in Full Orbit',
      description:
        'Touch and drag to rotate the tactical globe across all ocean basins. Pinch to zoom in on active hurricane eyewalls and outer spiral bands.',
      icon: Globe,
      accent: 'text-cyan-400',
    },
    {
      title: 'Storm Intelligence & Cones',
      subtitle: 'Real-Time Saffir-Simpson Telemetry',
      description:
        'Tap any storm beacon to lock your camera onto the vortex. Analyze sustained wind speeds, central barometric pressure, and 5-day forecast cones.',
      icon: Wind,
      accent: 'text-amber-400',
    },
    {
      title: 'Tactical Atmospheric Layers',
      subtitle: 'Doppler Radar & Wind Vectors',
      description:
        'Use the collapsible bottom dock to toggle Doppler radar reflectivity sweeps, cloud bands, wind vector particles, and day/night sunlight.',
      icon: Radio,
      accent: 'text-blue-400',
    },
  ];

  const handleNext = () => {
    soundFx.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss();
    }
  };

  const handleSelectFeatured = (storm: StormSystem) => {
    soundFx.playCameraLock();
    onSelectStorm(storm);
    onDismiss();
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-[#070d1d] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-cyan-500/60 blur-[2px]" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-7 bg-cyan-400'
                    : idx < currentStep
                    ? 'w-3 bg-cyan-700'
                    : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onDismiss();
            }}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            SKIP TOUR
          </button>
        </div>

        {/* Step Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <StepIcon className={`w-6 h-6 ${steps[currentStep].accent}`} />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              Step 0{currentStep + 1} of 0{steps.length}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">
              {steps[currentStep].title}
            </h2>
            <p className="text-xs font-medium text-slate-400 mb-2">
              {steps[currentStep].subtitle}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Instant Storm Jump Presets (Shown on final step or bottom) */}
        {currentStep === steps.length - 1 && (
          <div className="mb-6 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>QUICK-JUMP TO MAJOR ACTIVE SYSTEMS:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {storms.slice(0, 2).map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectFeatured(st)}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {st.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {st.categoryLabel.split(' ')[0]} {st.category > 0 ? `Cat ${st.category}` : ''} · {st.windSpeedKnots} kt
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="/App-debug.apk"
                download="App-debug.apk"
                onClick={() => soundFx.playClick()}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-mono"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>DOWNLOAD ANDROID APK (APP-DEBUG.APK)</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {currentStep > 0 ? (
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentStep(currentStep - 1);
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="py-2.5 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>START TRACKING</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>NEXT STEP</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
