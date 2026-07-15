import React, { useMemo } from 'react';
import { synthSound } from '../utils/audio';
import type { Arc, Episode } from '../data/content';

interface TransmissionsProps {
  ARCS: Arc[];
  EPISODES: Episode[];
  onPlay: (arcId: number, episodeId: string) => void;
  onBrowseAll: () => void;
}

const TYPE_META = {
  ctf:      { label: 'CTF',      color: '#000', bg: '#00c85a' },
  research: { label: 'RESEARCH', color: '#fff', bg: '#e8000d' },
  quiz:     { label: 'QUIZ',     color: '#fff', bg: '#9b5fff' },
  exploit:  { label: 'EXPLOIT',  color: '#fff', bg: '#9b5fff' }
};

function getEpisodeImage(epId: string, arcId: number) {
  const map: Record<string, string> = {
    'S1E1_A9': 'photos/episodes/S1E1.jpeg',
    'S1E2_A9': 'photos/episodes/S1E2.jpeg',
    'S1E3_A9': 'photos/episodes/S1E3.jpeg',
    'S1E4_A9': 'photos/episodes/S1E4.jpeg',
    'S1E5_A9': 'photos/episodes/S1E5.jpeg',
    'S1E6_A9': 'photos/episodes/S1E6.jpeg',
    'S1E7_A9': 'photos/episodes/S1E7.jpeg',
    'S1E8_A9': 'photos/episodes/S1E8.jpeg',
    'S1E1_A6': 'photos/episodes/S2E1.jpeg',
    'S1E2_A6': 'photos/episodes/S2E2.jpeg',
    'S1E3_A6': 'photos/episodes/S2E3.jpeg',
    'S1E1_A1': 'photos/episodes/S3E1.jpeg',
    'S1E2_A1': 'photos/episodes/S3E2.jpeg',
    'S1E3_A1': 'photos/episodes/S3E3.jpeg',
    'S1E4_A1': 'photos/episodes/S3E4.jpeg',
    'S1E1_A5': 'photos/episodes/S4E1.jpeg',
    'S1E2_A5': 'photos/episodes/S4E2.jpeg',
    'S1E3_A5': 'photos/episodes/S4E3.jpeg',
    'S1E1_A2': 'photos/episodes/S5E1.jpeg',
    'S1E2_A2': 'photos/episodes/S5E2.jpeg',
    'S1E3_A2': 'photos/episodes/S5E3.jpeg',
    'S2E1_A2': 'photos/0xEP001p.jpeg',
    'S2E2_A2': 'photos/0xEP002p.jpeg',
    'S2E3_A2': 'photos/0xEP005p.jpeg',
    'S1E1_A4': 'photos/episodes/S6E1.jpeg',
    'S1E2_A4': 'photos/episodes/S6E2.jpeg',
    'S1E3_A4': 'photos/episodes/S6E3.jpeg',
    'S1E1_A3': 'photos/episodes/S7E1.jpeg',
    'S1E2_A3': 'photos/episodes/S7E2.jpeg',
    'S1E3_A3': 'photos/episodes/S7E3.jpeg',
    'S1E1': 'photos/episodes/0xEP063p.jpeg',
    'S1E2': 'photos/episodes/0xEP064p.jpeg',
    'S1E3': 'photos/episodes/0xEP065p.jpeg',
    'S2E1': 'photos/episodes/0xEP066p.jpeg',
    'S2E2': 'photos/episodes/0xEP067p.jpeg',
    'S2E3': 'photos/episodes/0xEP068p.jpeg',
    'S1E1_A7': 'photos/episodes/S8E1.jpeg',
    'S1E2_A7': 'photos/episodes/S8E2.jpeg',
    'S1E3_A7': 'photos/episodes/S8E3.jpeg',
    'S1E1_A8': 'photos/episodes/S9E1.jpeg',
    'S1E2_A8': 'photos/episodes/S9E2.jpeg',
    'S1E3_A8': 'photos/episodes/S9E3.jpeg',
  };
  
  const defaultCovers: Record<number, string> = {
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
  
  const raw = map[epId] || defaultCovers[arcId] || defaultCovers[1];
  return raw.startsWith('/') ? raw : '/' + raw;
}

export const Transmissions: React.FC<TransmissionsProps> = ({
  ARCS,
  EPISODES,
  onPlay,
  onBrowseAll,
}) => {
  const transmissions = useMemo(() => {
    const list = EPISODES.map(ep => {
      const arc = ARCS.find(a => a.id === ep.arcId);
      return { ...ep, arc };
    });
    
    list.sort((a, b) => {
      const actA = a.active ? 1 : 0;
      const actB = b.active ? 1 : 0;
      if (actB !== actA) return actB - actA;
      return b.xp - a.xp;
    });
    
    return list.slice(0, 4);
  }, [EPISODES, ARCS]);

  const activeCount = useMemo(() => {
    return transmissions.filter(t => t.active).length;
  }, [transmissions]);

  const handleMouseEnter = () => {
    synthSound.hover();
  };

  const handlePlayClick = (tx: typeof transmissions[number]) => {
    synthSound.click();
    onPlay(tx.arcId, tx.id);
  };

  return (
    <div className="relative w-full border-t border-t-white/10 bg-[#030308]/60 p-6 md:p-12 pb-8 flex flex-col gap-6 select-none">
      <div className="relative z-10 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="font-bebas text-2xl font-bold tracking-[0.14em] text-paper">TRANSMISSIONS</div>
          <div className="font-mono text-[10px] text-white/20">// EPISODES</div>
          <div className="font-mono text-[9px] tracking-widest py-0.5 px-2 bg-white/5 border border-white/15 text-white/50">
            {activeCount > 0 ? (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-crt animate-pulse mr-1"></span>ACTIVE NOW
              </>
            ) : (
              `${transmissions.length} AVAILABLE`
            )}
          </div>
        </div>
        <div 
          className="font-mono text-[10px] tracking-wider text-white/40 hover:text-paper cursor-pointer transition-colors duration-150" 
          onClick={onBrowseAll}
        >
          ALL EPISODES →
        </div>
      </div>
      <div className="h-[1px] bg-white/10 w-full relative z-10"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10">
        {transmissions.map((tx, idx) => {
          const acc = tx.arc ? tx.arc.accColor : '#e8000d';
          const tm = TYPE_META[tx.type as keyof typeof TYPE_META] || TYPE_META.ctf;
          const img = getEpisodeImage(tx.id, tx.arcId);
          
          return (
            <div 
              key={tx.id}
              className="relative bg-[#0a0a14] border border-white/5 hover:border-[var(--tx-acc)] cursor-pointer overflow-hidden transition-all duration-200 shadow-lg group select-none flex flex-col justify-between min-h-[340px]" 
              style={{ '--tx-acc': acc } as React.CSSProperties}
              onMouseEnter={handleMouseEnter}
              onClick={() => handlePlayClick(tx)}
            >
              <div>
                {/* Image header wrapper */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img 
                    src={img} 
                    alt={tx.title} 
                    className="w-full h-full object-cover saturate-[0.7] brightness-[0.85] transition-all duration-300 group-hover:scale-105 group-hover:saturate-[1] group-hover:brightness-100" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                  <div 
                    className="absolute inset-0 z-2 pointer-events-none" 
                    style={{ background: `linear-gradient(0deg, ${tx.arc?.bgColor || '#06060e'}ee 0%, rgba(6,6,14,.1) 100%)` }}
                  ></div>
                  <div className="absolute inset-0 z-3 pointer-events-none bg-scanlines bg-[length:100%_4px,6px_100%] opacity-5"></div>
                  <div className="absolute top-3 left-3 z-10 font-bebas text-xl text-white/40 tracking-wider select-none">{String(idx + 1).padStart(2, '0')}</div>
                  <div 
                    className="absolute bottom-3 left-3 z-10 font-mono text-[9px] tracking-widest px-2 py-0.5 font-bold uppercase select-none" 
                    style={{ background: tm.bg, color: tm.color }}
                  >
                    {tm.label}{tx.active && <>&nbsp;<span className="animate-pulse">◉</span></>}
                  </div>
                  <div className="absolute top-3 right-3 z-10 font-mono text-[9px] tracking-wider bg-black/60 border border-white/10 px-2 py-0.5 text-paper flex items-center gap-1">⚡ {tx.xp} XP</div>
                </div>
                
                {/* Card body details */}
                <div className="p-5 flex flex-col gap-1.5">
                  <div className="font-mono text-[9px] tracking-widest font-bold uppercase" style={{ color: acc }}>{tx.arc?.domain || tx.arc?.arcName}</div>
                  <div className="font-bebas text-md tracking-wider text-paper line-clamp-1 group-hover:text-mg-acc transition-colors duration-150">{tx.title}</div>
                  <p className="font-sans text-[11px] text-white/60 leading-relaxed font-light line-clamp-2 mt-1">{tx.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 border-t border-white/5 pt-3">
                  <span className="truncate max-w-[70%] tracking-wider" style={{ color: `${acc}99` }}>{tx.arc?.arcName || ''}</span>
                  <span className="font-bold tracking-widest text-white/60">EP {tx.n}</span>
                </div>
              </div>

              {/* Corner indicators inside relative card */}
              <div className="absolute w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-solid top-[4px] left-[4px] pointer-events-none z-1" style={{ borderColor: acc }}></div>
              <div className="absolute w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-solid bottom-[4px] right-[4px] pointer-events-none z-1" style={{ borderColor: acc }}></div>

              {tx.active && (
                <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: acc }}></div>
              )}
              
              <div className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${acc}44, transparent)` }}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
