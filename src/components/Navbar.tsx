import React from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  xp: number;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onHoverSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  xp,
  username,
  onNavigate,
  onLogout,
  onHoverSound,
}) => {
  const tabs = [
    { id: 'home', label: 'Problems' },
    { id: 'blitz', label: 'Contest' },
    { id: 'leaderboard', label: 'Leaderboard' },
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

      {/* Right section: profile + XP */}
      <div className="flex items-center gap-5 text-xs font-mono">
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
