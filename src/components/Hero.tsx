import React, { useState, useEffect, useMemo } from 'react';
import { synthSound } from '../utils/audio';
import { useScramble } from '../hooks/useScramble';
import { SpeedLines } from './Effects/SpeedLines';
import type { Arc, Episode } from '../data/content';

interface HeroProps {
  ARCS: Arc[];
  EPISODES: Episode[];
  activeArcId: number;
  activeEpId: string;
  currentMode: "SOLO" | "NETWORK";
  onSelectArc: (id: number) => void;
  onSelectEpisode: (id: string) => void;
  onToggleMode: (mode: "SOLO" | "NETWORK") => void;
  onPlayEpisode: (id: string) => void;
  onBrowseAll: () => void;
}

function getArcCover(id: number) {
  const DEFAULT_ARC_COVERS: Record<number, string> = {
    1: 'photos/arc-covers/0xAC001p.jpeg',
    2: 'photos/arc-covers/0xAC002p.jpeg',
    3: 'photos/arc-covers/0xAC003p.jpeg',
    4: 'photos/arc-covers/0xAC004p.jpeg',
    5: 'photos/arc-covers/0xAC005p.jpeg',
    6: 'photos/arc-covers/0xAC006p.jpeg',
    7: 'photos/arc-covers/0xAC007p.jpeg',
    8: 'photos/arc-covers/0xAC008p.jpeg',
    9: 'photos/arc-covers/0xAC009p.jpeg'
  };
  const raw = DEFAULT_ARC_COVERS[id] || DEFAULT_ARC_COVERS[1];
  return raw.startsWith('/') ? raw : '/' + raw;
}

export const Hero: React.FC<HeroProps> = ({
  ARCS = [],
  EPISODES = [],
  activeArcId = 3,
  activeEpId = "",
  currentMode = "SOLO",
  onSelectArc,
  onSelectEpisode,
  onToggleMode,
  onPlayEpisode,
  onBrowseAll,
}) => {
  const [hoveredArcId, setHoveredArcId] = useState<number | null>(null);

  // Resolve display elements
  const displayArcId = hoveredArcId !== null ? hoveredArcId : activeArcId;
  
  const displayArc = useMemo(() => {
    return ARCS.find(a => a.id === displayArcId) || ARCS.find(a => a.id === activeArcId) || ARCS[0];
  }, [ARCS, displayArcId, activeArcId]);

  const displayEpisodes = useMemo(() => {
    return EPISODES.filter(e => e.arcId === displayArc.id);
  }, [EPISODES, displayArc]);

  const activeEpisode = useMemo(() => {
    return displayEpisodes.find(e => e.id === activeEpId) || displayEpisodes.find(e => e.active) || displayEpisodes[0];
  }, [displayEpisodes, activeEpId]);

  const acc = displayArc?.accColor || '#ff2a38';
  const bgColor = displayArc?.bgColor || '#030308';
  const arcCover = useMemo(() => getArcCover(displayArc.id), [displayArc.id]);

  const progressPct = useMemo(() => {
    const doneCount = displayEpisodes.filter(e => e.done).length;
    return displayEpisodes.length > 0 ? Math.round((doneCount / displayEpisodes.length) * 100) : 0;
  }, [displayEpisodes]);

  // Background crossfade transition
  const [currentCover, setCurrentCover] = useState(arcCover);
  const [coverOpacity, setCoverOpacity] = useState(1);

  useEffect(() => {
    if (arcCover !== currentCover) {
      setCoverOpacity(0);
      const timer = setTimeout(() => {
        setCurrentCover(arcCover);
        setCoverOpacity(1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [arcCover, currentCover]);

  // Glitched title scrambling
  const scrambledTitle = useScramble(displayArc.title, 25, 0);

  const getArcProgress = (arcId: number) => {
    const arcEps = EPISODES.filter(e => e.arcId === arcId);
    const doneE = arcEps.filter(e => e.done).length;
    return arcEps.length > 0 ? Math.round((doneE / arcEps.length) * 100) : 0;
  };

  const handleArcClick = (id: number) => {
    synthSound.click();
    onSelectArc(id);
  };

  const handleArcHover = (id: number) => {
    synthSound.hover();
    setHoveredArcId(id);
  };

  const handleArcLeave = () => {
    setHoveredArcId(null);
  };

  const handleEpisodeClick = (id: string) => {
    synthSound.click();
    onSelectEpisode(id);
  };

  const handlePlayEpisodeClick = () => {
    synthSound.click();
    if (activeEpisode) {
      onPlayEpisode(activeEpisode.id);
    }
  };

  const handleToggleModeClick = (mode: "SOLO" | "NETWORK") => {
    synthSound.click();
    onToggleMode(mode);
  };

  const handleArcKeyDown = (id: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleArcClick(id);
    }
  };

  const handleEpisodeKeyDown = (id: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleEpisodeClick(id);
    }
  };

  return (
    <div className="relative w-full border-b border-white/10 flex flex-col overflow-hidden bg-[#030308]" style={{ '--mg-acc': acc } as React.CSSProperties}>
      {/* Cinema background with transition key */}
      <div className="absolute inset-0 bg-[#030308] z-0 overflow-hidden">
        <img 
          src={currentCover} 
          alt={displayArc.title} 
          className="absolute inset-0 w-full h-full object-cover object-top filter saturate-[0.7] z-0 transition-opacity duration-200" 
          style={{ opacity: coverOpacity }}
        />
        <div 
          className="absolute left-0 top-0 bottom-0 w-[55%] z-1 pointer-events-none" 
          style={{ background: `linear-gradient(95deg, ${bgColor} 0%, ${bgColor}e0 35%, ${bgColor}88 65%, transparent 100%)` }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-[40%] z-1 pointer-events-none" 
          style={{ background: `linear-gradient(0deg, ${bgColor} 0%, ${bgColor}cc 22%, transparent 60%)` }}
        ></div>
        <div 
          className="absolute top-0 left-0 right-0 h-[20%] z-1 pointer-events-none" 
          style={{ background: `linear-gradient(180deg, ${bgColor}bb 0%, transparent 28%)` }}
        ></div>
        <div className="absolute inset-0 z-2 opacity-5 bg-scanlines bg-[length:100%_4px,6px_100%] pointer-events-none"></div>
        <div 
          className="absolute inset-0 z-1 mix-blend-color-dodge filter blur-3xl opacity-[0.12] pointer-events-none" 
          style={{ background: `radial-gradient(ellipse 55% 60% at 12% 70%, ${acc} 0%, transparent 65%)` }}
        ></div>
      </div>

      {/* HUD stats bar */}
      <div className="relative z-10 w-full border-b border-white/5 bg-[#030308]/60 backdrop-blur-md px-6 py-3 flex items-center justify-between text-xs tracking-wider border-t border-t-white/10">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-lg tracking-[0.14em] text-paper"><em>E</em>PHEMERAL</span>
          <span className="w-[1px] h-[14px] bg-white/10"></span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-white/35">
            <span className="w-1.5 h-1.5 rounded-full bg-crt animate-pulse"></span>
            NETWORK ACTIVE
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-white/30 tracking-widest">EPS</span>
            <span className="font-bold tracking-tight">{EPISODES.length}</span>
          </span>
          
          <span className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-white/30 tracking-widest">ARCS</span>
            <span className="font-bold tracking-tight" style={{ color: acc }}>{ARCS.length}</span>
          </span>

          {/* Mode Switch segments */}
          <div className="inline-flex items-center shrink-0" role="group" aria-label="Session mode">
            <div className="relative flex items-stretch h-[24px] border border-white/15 bg-white/[0.03] overflow-hidden">
              <div 
                className={`absolute top-0 left-0 w-1/2 h-full bg-white/[0.09] transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none z-0 ${currentMode === 'NETWORK' ? 'translate-x-full border-l border-white/10' : 'translate-x-0 border-r border-white/10'}`} 
                aria-hidden="true"
              ></div>
              
              <button 
                type="button" 
                className={`relative z-10 flex items-center justify-center gap-1 px-3.5 bg-transparent border-none cursor-pointer font-mono text-[9px] tracking-widest transition-colors duration-150 select-none uppercase ${currentMode === 'SOLO' ? 'text-mg-acc font-bold' : 'text-white/35 hover:text-white/60'}`} 
                onClick={() => handleToggleModeClick('SOLO')}
              >
                <span className="text-[8px] opacity-70" aria-hidden="true">◈</span>
                <span>SOLO</span>
              </button>
              
              <button 
                type="button" 
                className={`relative z-10 flex items-center justify-center gap-1 px-3.5 bg-transparent border-none cursor-pointer font-mono text-[9px] tracking-widest transition-colors duration-150 select-none uppercase ${currentMode === 'NETWORK' ? 'text-mg-acc font-bold' : 'text-white/35 hover:text-white/60'}`} 
                onClick={() => handleToggleModeClick('NETWORK')}
              >
                <span className="text-[8px] opacity-70" aria-hidden="true">◉</span>
                <span>NET</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid split-pane */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] items-stretch min-h-[480px]">
        {/* Left splash panel */}
        <div className="flex flex-col justify-end p-6 md:p-12 pb-8 gap-4 max-w-[720px] z-10 relative border-2 border-white/18 overflow-hidden bg-[#0a0a12] group/panel">
          {/* Conic speed lines on hover */}
          <div className="absolute inset-[-50%] pointer-events-none z-0 bg-mg-speed bg-mg-speed-acc opacity-0 group-hover/panel:opacity-100 transition-opacity duration-250 group-hover/panel:animate-mg-spin"></div>

          {/* Screentone / Halftone radial pattern */}
          <div className="absolute inset-0 bg-mg-tone-fine bg-[size:5px_5px] pointer-events-none z-1"></div>

          {/* Inner inset border */}
          <div className="absolute inset-0 border border-white/5 pointer-events-none z-1"></div>

          <SpeedLines color={acc} density={56} opacity={0.045} origin="bottom-center" />
          
          {/* Corner border indicators */}
          <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-solid border-mg-acc top-[4px] left-[4px] pointer-events-none z-1"></div>
          <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-r-[1.5px] border-solid border-mg-acc top-[4px] right-[4px] pointer-events-none z-1"></div>
          <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-l-[1.5px] border-solid border-mg-acc bottom-[4px] left-[4px] pointer-events-none z-1"></div>
          <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-solid border-mg-acc bottom-[4px] right-[4px] pointer-events-none z-1"></div>

          {/* Narrative caption box */}
          <div className="absolute top-6 left-6 font-mono text-[10px] tracking-widest text-left pl-3 border-l-2 bg-[#030308]/60 py-1.5 px-3 z-10" style={{ borderLeftColor: acc }}>
            {displayArc.description || 'EPHEMERAL'}
            <br />
            <span className="text-[9px] font-bold" style={{ color: acc }}>
              EP {activeEpisode ? activeEpisode.n : '—'}
            </span>
          </div>

          {/* Large background watermark text */}
          <div className="absolute right-8 top-8 font-bebas text-6xl md:text-8xl tracking-wider select-none pointer-events-none opacity-20 transition-all duration-300" style={{ color: acc, WebkitTextStroke: `1px ${acc}` }}>
            {displayArc.domain || 'LOADING'}
          </div>

          {/* Bottom content panel */}
          <div className="flex flex-col gap-3.5 select-text relative z-10 mt-16 md:mt-24">
            {/* Live new badge */}
            {activeEpisode && activeEpisode.active && (
              <span 
                className="self-start font-mono text-[9px] tracking-widest font-black py-0.5 px-2 text-white uppercase"
                style={{ background: acc, color: ['#f9a825', '#b9ff00', '#ffbd4a', 'var(--lime)'].includes(acc) ? '#000' : '#fff' }}
              >
                ◉ NEW
              </span>
            )}

            {/* Main title (with scramble hook) */}
            <h1 
              className="font-bebas text-5xl md:text-7xl font-extrabold leading-[0.85] tracking-wide text-paper select-none inline-block [-webkit-text-stroke:1px_rgba(255,255,255,0.6)] [paint-order:stroke_fill] [line-height:0.85] uppercase -rotate-[2deg] skew-x-[-3deg]"
            >
              {scrambledTitle}
            </h1>

            {/* Episode index and sub-title */}
            <div className="flex items-center gap-3">
              <div 
                className="font-mono text-[10px] tracking-widest font-black py-0.5 px-1.5"
                style={{ background: acc, color: ['#f9a825', '#b9ff00', '#ffbd4a', 'var(--lime)'].includes(acc) ? '#000' : '#fff' }}
              >
                EP {activeEpisode ? String(activeEpisode.n).padStart(2, '0') : '—'}
              </div>
              <div className="font-mono text-xs tracking-wider truncate font-semibold" style={{ color: acc }}>
                // {activeEpisode ? activeEpisode.title : 'No Episode Loaded'}
              </div>
            </div>

            {/* Narrative description snippet */}
            <p className="font-sans text-sm text-paper/80 leading-relaxed max-w-[540px] font-light">
              {activeEpisode ? (
                activeEpisode.description.length > 165 ? activeEpisode.description.slice(0, 165) + '…' : activeEpisode.description
              ) : (
                'Awaiting transmission...'
              )}
            </p>

            {/* Progress Bar & Episode Ticks */}
            <div className="flex flex-col gap-2 max-w-[480px] w-full mt-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-white/30 tracking-widest">SERIES PROGRESS</span>
                <span className="font-bold tracking-wider" style={{ color: acc }}>{progressPct}%</span>
              </div>
              <div className="h-1 bg-white/10 relative overflow-visible">
                <div 
                  className="absolute left-0 top-0 h-full transition-all duration-700 ease-out" 
                  style={{ width: `${progressPct}%`, background: acc, boxShadow: `0 0 12px ${acc}` }}
                ></div>
                <div className="absolute inset-0 flex justify-between">
                  {displayEpisodes.map((ep, idx) => (
                    <div 
                      key={ep.id}
                      className="absolute w-[2px] h-2 top-[-2px] transition-colors"
                      style={{ 
                        left: `${((idx + 1) / displayEpisodes.length) * 100}%`, 
                        background: ep.done ? acc : 'rgba(255,255,255,0.12)' 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA control buttons */}
            <div className="flex items-center gap-4 flex-wrap mt-4">
              <button 
                className="font-mono text-xs tracking-widest font-black py-3 px-8 rounded-none cursor-pointer transition-all duration-200 flex items-center gap-2 relative overflow-hidden uppercase hover:translate-y-[-2px] hover:brightness-110 active:translate-y-0 text-white" 
                style={{ 
                  background: `linear-gradient(135deg, ${acc} 0%, rgba(255,42,56,0.7) 100%)`, 
                  color: ['#f9a825', '#b9ff00', '#ffbd4a', 'var(--lime)'].includes(acc) ? '#000' : '#fff'
                }}
                onClick={handlePlayEpisodeClick}
              >
                <span className="text-sm">▶</span> PLAY EPISODE {activeEpisode ? String(activeEpisode.n).padStart(2, '0') : '01'}
              </button>
              
              <button 
                className="font-mono text-xs tracking-widest py-3 px-6 border border-white/20 bg-white/5 text-paper/60 cursor-pointer transition-all duration-200 uppercase hover:border-white/50 hover:text-paper hover:bg-white/10 active:translate-y-[1px]" 
                onClick={onBrowseAll}
              >
                ALL SERIES
              </button>
            </div>
          </div>
        </div>

        {/* Right Arc selector panel */}
        <div className="bg-[#030308]/80 border-l border-white/5 backdrop-blur-lg flex flex-col overflow-hidden hidden md:flex">
          <div className="font-mono text-[9px] tracking-widest text-white/30 px-6 py-4 border-b border-white/5 uppercase">
            // SERIES INDEX
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col scrollbar-none">
            {ARCS.map((arc) => (
              <div 
                key={arc.id}
                role="button"
                tabIndex={0}
                className={`flex items-center gap-3.5 p-4 px-6 cursor-pointer border-b border-white/5 transition-all duration-200 relative group shrink-0 outline-none focus-visible:bg-white/[0.06] ${
                  displayArc.id === arc.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                }`}
                onClick={() => handleArcClick(arc.id)}
                onKeyDown={(e) => handleArcKeyDown(arc.id, e)}
                onMouseEnter={() => handleArcHover(arc.id)}
                onMouseLeave={handleArcLeave}
              >
                {displayArc.id === arc.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: arc.accColor }}></div>
                )}

                <div className="w-10 h-14 bg-black overflow-hidden relative shrink-0">
                  <img 
                    src={getArcCover(arc.id)} 
                    alt={arc.title} 
                    className="w-full h-full object-cover object-top transition-all duration-300 filter group-hover:saturate-[1] saturate-[0.6] group-hover:scale-105" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="font-mono text-[9px] font-bold" style={{ color: arc.accColor }}>
                    v{arc.sequence ?? arc.id}
                  </div>
                  <div className="font-bebas text-md tracking-wider truncate text-paper">
                    {arc.title}
                  </div>
                  <div className="font-mono text-[8px] tracking-wider text-white/30 truncate">
                    {arc.domain}
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="h-[2px] bg-white/10 mt-1.5 w-full overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${getArcProgress(arc.id)}%`, backgroundColor: arc.accColor }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom episode chip strip panel */}
      <div className="relative z-10 bg-[#030308]/60 border-t border-white/10 backdrop-blur-md flex flex-col">
        <div className="font-mono text-[9px] tracking-widest text-white/20 px-6 md:px-12 py-2 mt-1 select-none">
          // EPISODES
        </div>
        
        <div className="flex overflow-x-auto gap-2 px-6 md:px-12 pb-4 scrollbar-none select-none">
          {displayEpisodes.map((ep) => (
            <div 
              key={ep.id}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2 border p-2.5 px-4 cursor-pointer transition-all duration-150 shrink-0 font-mono text-[10px] max-w-[220px] select-none outline-none focus-visible:bg-white/[0.06] ${
                activeEpisode && ep.id === activeEpisode.id 
                  ? 'border-current bg-white/[0.04]' 
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/80 hover:bg-white/[0.02]'
              }`}
              style={activeEpisode && ep.id === activeEpisode.id ? { borderColor: acc, color: acc } : {}}
              onClick={() => handleEpisodeClick(ep.id)}
              onKeyDown={(e) => handleEpisodeKeyDown(ep.id, e)}
              onMouseEnter={() => synthSound.hover()}
            >
              <span className="font-disp text-sm font-bold shrink-0">{String(ep.n).padStart(2, '0')}</span>
              <span className="truncate tracking-wide">{ep.title.split(' — ')[0]}</span>
              {ep.done ? (
                <span className="text-crt font-bold">✓</span>
              ) : ep.active ? (
                <span className="animate-pulse" style={{ color: acc }}>●</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
