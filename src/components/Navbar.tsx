import React from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  xp: number;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onHoverSound: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const THEME_DOTS = [
  { id: 'crimson', label: 'Crimson', bg: 'bg-[#ff2a38]', shadow: 'shadow-[#ff2a38]/40' },
  { id: 'cyber', label: 'Cyber Cyan', bg: 'bg-[#00f5ff]', shadow: 'shadow-[#00f5ff]/40' },
  { id: 'matrix', label: 'Matrix Green', bg: 'bg-[#00ff66]', shadow: 'shadow-[#00ff66]/40' },
  { id: 'volt', label: 'Volt Yellow', bg: 'bg-[#ccff00]', shadow: 'shadow-[#ccff00]/40' },
  { id: 'violet', label: 'Violet Laser', bg: 'bg-[#bd00ff]', shadow: 'shadow-[#bd00ff]/40' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  xp,
  username,
  onNavigate,
  onLogout,
  onHoverSound,
  theme,
  onThemeChange,
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
    <nav 
      className="relative z-50 w-full flex items-center justify-between h-16 px-8 select-none font-mono glass-panel border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur-md"
    >
      {/* Left section: Logo */}
      <div
        className="text-sm font-bold uppercase tracking-widest text-white cursor-pointer flex items-center gap-2 group"
        onClick={() => onNavigate('home')}
        onMouseEnter={onHoverSound}
        role="link" 
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center bg-mg-acc text-black font-bebas text-[11px] font-bold shadow-[0_0_10px_var(--mg-acc)] transition-transform duration-300 group-hover:scale-105">
          B
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-xs font-bold tracking-widest text-white">Binary</span>
          <span className="text-[9px] text-zinc-500 font-normal tracking-wide">Beats</span>
        </div>
      </div>

      {/* Center section: sliding tabs */}
      <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px] relative">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              onMouseEnter={onHoverSound}
              className={`relative px-4 h-8 rounded text-xs font-semibold cursor-pointer transition-colors duration-250 uppercase tracking-wider ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabOutline"
                  className="absolute inset-0 bg-zinc-900/90 border border-zinc-800 rounded -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(0,0,0,0.5)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                >
                  {/* Glowing neon top stripe */}
                  <span className="absolute top-0 left-[20%] right-[20%] h-[1.5px] bg-mg-acc shadow-[0_0_8px_var(--mg-acc)]" />
                </motion.div>
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right section: profile, controls, XP */}
      <div className="flex items-center gap-5 text-xs font-mono">
        {/* Theme dots customizer */}
        <div className="flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-900 px-2.5 py-1 rounded-lg">
          {THEME_DOTS.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                onMouseEnter={onHoverSound}
                title={`Theme: ${t.label}`}
                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-200 relative ${t.bg} ${t.shadow} shadow-md hover:scale-125 hover:brightness-110 ${
                  isSelected 
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-950 scale-110' 
                    : 'opacity-70 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>

        {/* Audio Mute Switch */}
        <button
          onClick={() => {
            onToggleSound();
            // Trigger feedback if turning sound back on
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
          title={soundEnabled ? "Mute Mechanical Audio Feed" : "Unmute Mechanical Audio Feed"}
          className={`p-1.5 rounded-lg border text-sm cursor-pointer transition-colors duration-200 flex items-center justify-center ${
            soundEnabled 
              ? 'border-zinc-900 text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900/80' 
              : 'border-zinc-800/80 text-zinc-600 bg-transparent hover:bg-zinc-900/20'
          }`}
        >
          {soundEnabled ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L11.47 3.53a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>

        {/* User status */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mg-acc opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mg-acc shadow-[0_0_6px_var(--mg-acc)]" />
          </div>
          <span className="font-semibold text-zinc-300 uppercase tracking-wider">{username}</span>
        </div>

        {/* XP Tracker */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-900 bg-zinc-950/80 shadow-inner group hover:border-zinc-800 transition-colors">
          <span className="text-white group-hover:scale-110 transition-transform duration-250">⚡</span>
          <span className="font-bold text-white uppercase tracking-wider">{xp} XP</span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          onMouseEnter={onHoverSound}
          className="px-3.5 py-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white cursor-pointer transition-all text-[11px] uppercase tracking-wider font-semibold bg-transparent"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
