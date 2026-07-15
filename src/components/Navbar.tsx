import React from 'react';
import { synthSound } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  xp: number;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  xp,
  username,
  onNavigate,
  onLogout,
}) => {
  const handleNavigate = (tab: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    synthSound.click();
    onNavigate(tab);
  };

  const handleKeyDown = (tab: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleNavigate(tab, event);
    }
  };

  const handleLogoutClick = () => {
    synthSound.click();
    onLogout();
  };

  return (
    <nav className="relative z-50 w-full flex items-center justify-between h-[56px] px-6 bg-[#06060e]/92 backdrop-blur-md border-b border-white/10 select-none">
      {/* Brand logo */}
      <div
        className="font-bebas text-lg font-black tracking-[0.18em] text-paper cursor-pointer flex items-center select-none outline-none focus:text-mg-acc"
        onClick={(e) => handleNavigate('home', e)}
        onKeyDown={(e) => handleKeyDown('home', e)}
        role="link"
        tabIndex={0}
      >
        <span className="text-mg-acc text-[1.25em]">B</span>INARY BEATS
      </div>

      {/* Navigation middle links */}
      <div className="flex items-center gap-1.5">
        <a
          href="#home"
          className={`font-mono text-[9px] tracking-widest uppercase py-1 px-3.5 border border-transparent transition-all duration-150 ${activeTab === 'home'
              ? 'text-mg-acc border-mg-acc bg-mg-acc/5 font-bold'
              : 'text-white/35 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          onClick={(e) => handleNavigate('home', e)}
        >
          Home
        </a>

        <a
          href="#blitz"
          className={`font-mono text-[9px] tracking-widest uppercase py-1 px-3.5 border border-transparent transition-all duration-150 ${activeTab === 'blitz'
              ? 'text-mg-acc border-mg-acc bg-mg-acc/5 font-bold'
              : 'text-white/35 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          onClick={(e) => handleNavigate('blitz', e)}
        >
          blitz
        </a>

        <a
          href="#leaderboard"
          className={`font-mono text-[9px] tracking-widest uppercase py-1 px-3.5 border border-transparent transition-all duration-150 ${activeTab === 'leaderboard'
              ? 'text-mg-acc border-mg-acc bg-mg-acc/5 font-bold'
              : 'text-white/35 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          onClick={(e) => handleNavigate('leaderboard', e)}
        >
          Leaderboard
        </a>
      </div>

      {/* Right connection details & status */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-wider text-white/35">
          <span className="w-1.5 h-1.5 rounded-full bg-crt animate-pulse"></span>
          <span className="font-semibold text-white/50">{username}</span>
        </span>

        <span className="font-mono text-[9px] text-paper bg-white/[0.03] px-2.5 py-1 border border-white/10 flex items-center gap-1.5">
          <span className="text-crt animate-pulse">⚡</span>
          <span className="font-bold">{xp} XP</span>
        </span>

        <button
          className="font-mono text-[9px] tracking-widest uppercase border border-white/15 bg-white/5 hover:border-mg-acc hover:text-mg-acc hover:bg-mg-acc/5 py-1 px-3 cursor-pointer transition-all duration-150 active:translate-y-[1px]"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
