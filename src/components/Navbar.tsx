import React from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  xp: number;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onHoverSound: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, xp, username, onNavigate, onLogout, onHoverSound, soundEnabled, onToggleSound,
}) => {
  const tabs = [
    { id: 'home', label: 'Problems' },
    { id: 'blitz', label: 'Contest' },
    { id: 'leaderboard', label: 'Ranking' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 px-6 lg:px-8">
        {/* Logo — editorial text-based like Outfit */}
        <div
          className="flex items-center gap-2 cursor-pointer group select-none"
          onClick={() => onNavigate('home')}
          onMouseEnter={onHoverSound}
          role="link" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
        >
          <span className="text-[18px] font-bold text-white tracking-tight font-[Space_Grotesk,Inter,system-ui,sans-serif]">
            Binary Beats
          </span>
          <span className="w-[6px] h-[6px] rounded-full bg-[#c3f73a] group-hover:scale-125 transition-transform" />
        </div>

        {/* Center: Simple text nav links */}
        <div className="hidden md:flex items-center gap-8">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate(t.id)}
                onMouseEnter={onHoverSound}
                className={`relative py-1 text-[13px] font-medium cursor-pointer transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-[19px] left-0 right-0 h-[1.5px] bg-[#c3f73a]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side — minimal */}
        <div className="flex items-center gap-4">
          {/* Sound toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) {
                setTimeout(() => {
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                    osc.start(); osc.stop(ctx.currentTime + 0.05);
                  } catch(e) {}
                }, 50);
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>

          {/* XP counter — clean, flat */}
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-[#c3f73a] font-bold font-mono">{xp}</span>
            <span className="text-zinc-600 text-[11px] font-medium">XP</span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.06]" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-zinc-300">
              {username[0].toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-zinc-400 hidden sm:inline">{username}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
