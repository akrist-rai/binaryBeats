import React from 'react';
import { motion } from 'motion/react';
import { RatingBadge } from './blitz/RatingBadge';

interface NavbarProps {
  activeTab: string;
  rating: number | null;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onHoverSound: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, rating, username, onNavigate, onLogout, onHoverSound, theme, onToggleTheme,
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
          <span className="sticker-tag hidden sm:inline text-[9px] font-mono font-bold uppercase tracking-widest text-bb-ink-faint border border-bb-line-strong rounded-full px-2 py-0.5 ml-0.5">
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
          {/* Theme toggle — icon shows the mode you'll switch to */}
          <button
            onClick={onToggleTheme}
            onMouseEnter={onHoverSound}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-bb-ink-faint hover:text-bb-orange hover:bg-bb-ink/[0.05] transition-all cursor-pointer"
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
          </button>

          {/* Rating — real Codeforces rating from the linked handle, if any */}
          <div className="flex items-center gap-1.5 text-[13px] pill border border-bb-line-strong px-2.5 py-1">
            <RatingBadge rating={rating} />
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
