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
  activeTab,
  xp,
  username,
  onNavigate,
  onLogout,
  onHoverSound,
  soundEnabled,
  onToggleSound,
}) => {
  const tabs = [
    { id: 'home', label: 'Problems' },
    { id: 'blitz', label: 'Contest' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between h-14 px-6 lg:px-10 select-none border-b border-white/[0.06] bg-[#0c0c10]/90 backdrop-blur-xl">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => onNavigate('home')}
        onMouseEnter={onHoverSound}
        role="link"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
      >
        <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-mg-acc text-white text-sm font-bold shadow-[0_0_16px_rgba(124,92,252,0.3)] transition-transform duration-300 group-hover:scale-110">
          B
        </span>
        <span className="text-base font-semibold text-white tracking-tight">
          Binary<span className="text-zinc-500 font-normal ml-0.5">Beats</span>
        </span>
      </div>

      {/* Center: Navigation Tabs */}
      <div className="hidden md:flex items-center gap-1 relative">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              onMouseEnter={onHoverSound}
              className={`relative px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/[0.07] rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
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
          onMouseEnter={onHoverSound}
          title={soundEnabled ? "Mute sound" : "Unmute sound"}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          {soundEnabled ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>

        {/* XP */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-sm font-medium text-zinc-300">
          <span>⚡</span>
          <span className="font-semibold text-white">{xp}</span>
          <span className="text-zinc-500 text-xs">XP</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04]">
          <div className="w-6 h-6 rounded-full bg-mg-acc flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(124,92,252,0.3)]">
            {username[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-zinc-300 hidden sm:inline">{username}</span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          onMouseEnter={onHoverSound}
          className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
