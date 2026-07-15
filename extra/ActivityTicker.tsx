import React from 'react';
import { synthSound } from '../src/utils/audio';

const VERBS = ['captured', 'pwned', 'exfiltrated', 'cracked', 'breached'];

const CAT_COLORS: Record<string, string> = {
  GRADIENT: '#4fc3f7', ARCHITECTURE: '#f9a825', INFERENCE: '#e8000d',
  'DATA LEAK': '#ff6b35', TRAINING: '#ab47bc', NLP: '#26c6da',
  OVERFITTING: '#ef5350', SYSTEMS: '#66bb6a', CRYPTO: '#ffd54f',
  ALGORITHMS: '#80cbc4', FAIRNESS: '#ce93d8', WEB: '#e8000d',
  PWN: '#ff4466', REVERSE: '#d500f9', SCRIPTING: '#ab47bc',
};

const CAT_ICONS: Record<string, string> = {
  GRADIENT: '∇', ARCHITECTURE: '⬡', INFERENCE: '◈', 'DATA LEAK': '⚠',
  TRAINING: '⟳', NLP: '⌥', OVERFITTING: '⤴', SYSTEMS: '⚙',
  CRYPTO: '🔐', ALGORITHMS: '◇', FAIRNESS: '⚖', WEB: '🌐',
  PWN: '☠', REVERSE: '⇄', SCRIPTING: '📜',
};

const activities = [
  { userId: 'shinji_eva', challengeId: 'S1E3_A7', points: 280, category: 'TRAINING', time: '12s' },
  { userId: 'cyber_bandit', challengeId: 'S1E2_A2', points: 220, category: 'PWN', time: '45s' },
  { userId: 'johan_fan', challengeId: 'S1E2', points: 110, category: 'TRAINING', time: '3m' },
  { userId: 'luffy_pirate', challengeId: 'S1E4_A2', points: 280, category: 'CRYPTO', time: '7m' },
  { userId: 'akrist', challengeId: 'S1E5_A1', points: 190, category: 'ALGORITHMS', time: '14m' },
  { userId: 'okabe_future', challengeId: 'S1E3_A8', points: 260, category: 'CRYPTO', time: '22m' },
  { userId: 'reaper_xp', challengeId: 'S2E2_A2', points: 180, category: 'WEB', time: '30m' },
  { userId: 'guts_knight', challengeId: 'S2E2_A1', points: 220, category: 'ALGORITHMS', time: '44m' }
];

function getHexAddr(userId: string) {
  let hash = 0x5381;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) + hash) ^ userId.charCodeAt(i);
  }
  return '0x' + (hash >>> 0).toString(16).toUpperCase().slice(0, 4);
}

function getVerb(userId: string, challengeId: string) {
  const idx = (userId.charCodeAt(0) + challengeId.charCodeAt(0)) % VERBS.length;
  return VERBS[idx];
}

export const ActivityTicker: React.FC = () => {
  const handleMouseEnter = () => {
    synthSound.hover();
  };

  const doubleActivities = [...activities, ...activities];

  return (
    <div 
      className="flex items-center gap-4 py-2.5 px-6 bg-black/45 border-t border-t-red/10 border-b border-b-red/10 overflow-hidden whitespace-nowrap select-none w-full" 
      onMouseEnter={handleMouseEnter}
    >
      {/* Live Net Badge */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-white/35 shrink-0 uppercase select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse shrink-0"></span>
        <span>LIVE NET</span>
      </div>

      {/* Marquee container */}
      <div className="flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,#000_5%,#000_95%,transparent_100%)]">
        <div className="flex gap-10 animate-ticker hover:[animation-play-state:paused]">
          {doubleActivities.map((entry, index) => {
            const isMe = entry.userId === 'akrist';
            const catColor = CAT_COLORS[entry.category] || 'var(--red)';
            const catIcon = CAT_ICONS[entry.category] || '□';
            const hexAddr = getHexAddr(entry.userId);
            const verb = getVerb(entry.userId, entry.challengeId);

            return (
              <div key={index} className="inline-flex items-center gap-1.5 font-mono text-[10px] shrink-0">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: catColor }}></span>
                <span className="text-white/20 tracking-wider shrink-0 mr-0.5">{hexAddr}</span>
                <span 
                  className={`font-bold tracking-wider ${isMe ? 'text-crt [text-shadow:0_0_8px_rgba(0,255,65,0.4)]' : 'text-white/75'}`}
                >
                  {entry.userId}
                </span>
                <span className={`text-white/35 ${verb !== 'captured' ? 'text-red font-bold' : ''}`}>{verb}</span>
                <span className="text-[10px]" style={{ color: catColor }}>{catIcon}</span>
                <span className="tracking-wider" style={{ color: catColor }}>{entry.challengeId}</span>
                <span className="font-bold text-[#b9ff00]">+{entry.points}</span>
                <span className="text-white/15 mx-0.5">·</span>
                <span className="text-white/20 text-[9px]">{entry.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
