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
    { id: 'home', label: 'Problems', icon: '⚡' },
    { id: 'blitz', label: 'Contest', icon: '🏆' },
    { id: 'leaderboard', label: 'Ranking', icon: '📊' },
    { id: 'community', label: 'Community', icon: '💬' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#08080c]/80 backdrop-blur-2xl">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
          onMouseEnter={onHoverSound}
          role="link" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
            B
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-bold text-white tracking-tight">Binary Beats</span>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate(t.id)}
                onMouseEnter={onHoverSound}
                className={`relative px-5 py-2 rounded-[10px] text-[15px] font-medium cursor-pointer transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/[0.08] rounded-[10px] -z-10 shadow-lg shadow-white/[0.02]"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Sound */}
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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>

          {/* XP Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/15">
            <span className="text-base">⚡</span>
            <span className="text-[15px] font-bold text-white">{xp}</span>
            <span className="text-xs text-indigo-300/60 font-medium">XP</span>
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-indigo-500/20">
              {username[0].toUpperCase()}
            </div>
            <span className="text-[15px] font-medium text-zinc-300 hidden sm:inline">{username}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
