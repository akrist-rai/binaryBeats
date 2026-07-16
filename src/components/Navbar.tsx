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
    { id: 'home', n: '01', label: 'Problems' },
    { id: 'blitz', n: '02', label: 'Blitz & Duel' },
    { id: 'leaderboard', n: '03', label: 'Ranking' },
    { id: 'community', n: '04', label: 'Community' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-bb-line bg-bb-paper/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Logo — terminal-flavored mark inside an otherwise paper identity */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          onClick={() => onNavigate('home')}
          onMouseEnter={onHoverSound}
          role="link" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
        >
          <span className="w-7 h-7 rounded-md bg-bb-ink text-bb-term-acc flex items-center justify-center font-mono text-[13px] font-bold group-hover:bg-bb-orange group-hover:text-bb-ink transition-colors">
            {'>_'}
          </span>
          <span className="text-[17px] font-bold text-bb-ink tracking-tight font-heading">
            Binary Beats
          </span>
          <span className="hidden sm:inline text-[9px] font-mono font-bold uppercase tracking-widest text-bb-ink-faint border border-bb-line-strong rounded-full px-2 py-0.5 ml-0.5">
            C++17
          </span>
        </div>

        {/* Center: tab nav */}
        <div className="hidden md:flex items-center gap-1">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate(t.id)}
                onMouseEnter={onHoverSound}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium font-mono cursor-pointer transition-colors duration-150 ${
                  isActive ? 'text-bb-paper' : 'text-bb-ink-soft hover:text-bb-ink'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-full bg-bb-ink"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 text-[9px] ${isActive ? 'text-bb-term-acc' : 'text-bb-ink-faint'}`}>{t.n}</span>
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side */}
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-bb-ink-faint hover:text-bb-ink hover:bg-bb-ink/[0.05] transition-all cursor-pointer"
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

          {/* XP counter */}
          <div className="flex items-center gap-1.5 text-[13px] pill border border-bb-line-strong px-2.5 py-1">
            <span className="text-bb-orange font-bold font-mono stat-num">{xp}</span>
            <span className="text-bb-ink-faint text-[10px] font-bold uppercase tracking-wider">XP</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-bb-line" />

          {/* User */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={onLogout}
            onMouseEnter={onHoverSound}
          >
            <div className="w-8 h-8 rounded-full bg-bb-ink text-bb-paper flex items-center justify-center text-[11px] font-bold font-mono">
              {username[0].toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-bb-ink-soft hidden sm:inline">{username}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
