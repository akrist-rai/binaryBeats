import React, { useState } from 'react';
import { synthSound } from '../src/utils/audio';
import { SpeedLines } from '../src/components/Effects/SpeedLines';
import type { Arc, Episode } from '../src/data/content';

interface ManifestProps {
  ARCS: Arc[];
  EPISODES: Episode[];
  onSelectArc: (id: number) => void;
}

export const Manifest: React.FC<ManifestProps> = ({
  ARCS,
  EPISODES,
  onSelectArc,
}) => {
  const [activeCellId, setActiveCellId] = useState<number | null>(null);

  const handleCellClick = (id: number) => {
    synthSound.click();
    if (activeCellId === id) {
      setActiveCellId(null);
    } else {
      setActiveCellId(id);
    }
  };

  const handleCellKeyDown = (id: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCellClick(id);
    }
  };

  const handleSelectArcClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    synthSound.click();
    onSelectArc(id);
  };

  const getArcProgress = (arcId: number) => {
    const eps = EPISODES.filter((e) => e.arcId === arcId);
    if (!eps.length) return { pct: 0, done: 0, total: 0 };
    const done = eps.filter((e) => e.done).length;
    return {
      pct: Math.round((done / eps.length) * 100),
      done,
      total: eps.length,
    };
  };

  const getArcImage = (arcId: number) => {
    const defaultCovers: Record<number, string> = {
      1: "photos/arc-covers/0xAC001p.jpeg",
      2: "photos/arc-covers/0xAC002p.jpeg",
      3: "photos/arc-covers/0xAC003p.jpeg",
      4: "photos/arc-covers/0xAC004p.jpeg",
      5: "photos/arc-covers/0xAC005p.jpeg",
      6: "photos/arc-covers/0xAC006p.jpeg",
      7: "photos/arc-covers/0xAC007p.jpeg",
      8: "photos/arc-covers/0xAC008p.jpeg",
      9: "photos/arc-covers/0xAC009p.jpeg",
    };
    const raw = defaultCovers[arcId] || defaultCovers[1];
    return raw.startsWith('/') ? raw : '/' + raw;
  };

  return (
    <div className="relative w-full border-t border-t-white/10 bg-[#030308]/60 p-6 md:p-12 pb-8 flex flex-col gap-6 select-none mt-6">
      <div className="relative z-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="font-bebas text-2xl font-bold tracking-[0.14em] text-paper">blitz MANIFEST</div>
          <div className="font-mono text-[10px] text-white/20">// ALL SECTIONS</div>
        </div>
      </div>
      <div className="h-[1px] bg-white/10 w-full relative z-10"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/10 p-[1px] relative z-10">
        {ARCS.map((arc) => {
          const progress = getArcProgress(arc.id);
          const isExpanded = activeCellId === arc.id;
          const imagePath = getArcImage(arc.id);

          return (
            <div
              key={arc.id}
              role="button"
              tabIndex={0}
              className={`relative min-h-[220px] ${isExpanded ? 'h-[360px] md:h-[400px]' : 'h-[220px]'} overflow-hidden cursor-pointer bg-[#0a0a12] transition-all duration-300 border border-white/5 group flex flex-col justify-between p-6 select-none outline-none focus-visible:border-[var(--mg-acc)]`}
              style={{ '--mg-acc': arc.accColor } as React.CSSProperties}
              onMouseEnter={() => synthSound.hover()}
              onClick={() => handleCellClick(arc.id)}
              onKeyDown={(e) => handleCellKeyDown(arc.id, e)}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-top saturate-[0.7] brightness-[0.75] transition-all duration-300 group-hover:scale-[1.02] group-hover:saturate-[0.95]"
                style={{ backgroundImage: `url(${imagePath})` }}
              ></div>
              <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${arc.bgColor}f2, ${arc.bgColor}b0 60%, transparent 100%)` }}
              ></div>
              <div className="absolute inset-0 z-2 pointer-events-none bg-scanlines bg-[length:100%_4px,6px_100%] opacity-5"></div>

              {isExpanded && (
                <>
                  <div className="absolute inset-0 z-1 pointer-events-none bg-mg-tone bg-[size:8px_8px] opacity-15"></div>
                  {/* SpeedLines visual highlight on active cells */}
                  <SpeedLines
                    color={arc.accColor}
                    density={40}
                    opacity={0.12}
                    origin="center"
                    animated={true}
                  />
                </>
              )}

              {/* Cell header details */}
              <div className="relative z-10 flex flex-col gap-1">
                <div className="font-mono text-[9px] tracking-widest font-bold flex items-center gap-1.5" style={{ color: arc.accColor }}>
                  <span className="uppercase">{arc.domain}</span>
                  <span>·</span>
                  <span>V{arc.id}</span>
                </div>
                <div className="font-bebas text-2xl font-black tracking-wide text-paper">{arc.title}</div>
              </div>

              {/* Expansion details */}
              {isExpanded && (
                <div className="relative z-10 flex flex-col gap-4 mt-4 select-text">
                  <p className="font-sans text-xs text-white/70 leading-relaxed font-light line-clamp-3">{arc.description}</p>

                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-white/30 tracking-wider">COMPLETION</span>
                      <span className="font-bold tracking-widest" style={{ color: arc.accColor }}>{progress.pct}%</span>
                    </div>
                    <div className="h-1 bg-white/10 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress.pct}%`, background: arc.accColor }}
                      ></div>
                    </div>
                    <div className="font-mono text-[8px] tracking-wider text-white/20 uppercase mt-0.5">
                      {progress.done} OF {progress.total} CHALLENGES RESOLVED
                    </div>
                  </div>

                  <button
                    className="font-mono text-[9px] tracking-widest uppercase border border-current bg-transparent py-1.5 px-4 cursor-pointer transition-all duration-150 select-none hover:bg-white/[0.04] active:translate-y-[1px] w-fit"
                    style={{ color: arc.accColor, borderColor: arc.accColor }}
                    onClick={(e) => handleSelectArcClick(arc.id, e)}
                  >
                    SELECT ARC
                  </button>
                </div>
              )}

              {/* Interactive corner markings */}
              <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-solid top-[4px] left-[4px] pointer-events-none z-1" style={{ borderColor: arc.accColor }}></div>
              <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-r-[1.5px] border-solid top-[4px] right-[4px] pointer-events-none z-1" style={{ borderColor: arc.accColor }}></div>
              <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-l-[1.5px] border-solid bottom-[4px] left-[4px] pointer-events-none z-1" style={{ borderColor: arc.accColor }}></div>
              <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-solid bottom-[4px] right-[4px] pointer-events-none z-1" style={{ borderColor: arc.accColor }}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
