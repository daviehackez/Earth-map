import React, { useState } from 'react';
import { StormSystem, OceanBasin } from '../types/weather';
import { soundFx } from '../services/soundFx';
import { X, Search, Wind, Gauge, Compass, ChevronRight } from 'lucide-react';

interface StormListModalProps {
  storms: StormSystem[];
  selectedStorm: StormSystem | null;
  onSelectStorm: (storm: StormSystem) => void;
  onClose: () => void;
}

export const StormListModal: React.FC<StormListModalProps> = ({
  storms,
  selectedStorm,
  onSelectStorm,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBasin, setSelectedBasin] = useState<string>('All');

  const basins: string[] = ['All', 'Western Pacific', 'North Atlantic', 'Eastern Pacific', 'North Indian', 'South Pacific'];

  const filteredStorms = storms.filter((st) => {
    const matchesSearch = st.name.toLowerCase().includes(search.toLowerCase()) || st.id.toLowerCase().includes(search.toLowerCase());
    const matchesBasin = selectedBasin === 'All' || st.basin === selectedBasin;
    return matchesSearch && matchesBasin;
  });

  const handlePickStorm = (st: StormSystem) => {
    soundFx.playCameraLock();
    onSelectStorm(st);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#070e24] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Global Active Storm Systems
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live tracking feed across all ocean basins
            </p>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Basin Filters */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cyclone name, ID, or basin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {basins.map((b) => (
              <button
                key={b}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedBasin(b);
                }}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedBasin === b
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Storms List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredStorms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active storm systems match the current filter.
            </div>
          ) : (
            filteredStorms.map((st) => {
              const isSelected = selectedStorm?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handlePickStorm(st)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                        style={{
                          backgroundColor: `${st.color}25`,
                          color: st.color,
                          border: `1px solid ${st.color}60`,
                        }}
                      >
                        {st.category === 0 ? 'TS' : `Cat ${st.category}`}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {st.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({st.id})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-200">{st.windSpeedKnots} kt</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>{st.pressureHpa} hPa</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{st.basin}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <div className="hidden sm:block text-right text-[11px] font-mono text-slate-400">
                      <div>{st.center.lat.toFixed(1)}°N</div>
                      <div>{Math.abs(st.center.lon).toFixed(1)}°{st.center.lon >= 0 ? 'E' : 'W'}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
