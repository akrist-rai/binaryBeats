import React from 'react';

interface NavbarProps {
  activeTab: string;
  xp: number;
  username: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, xp, username, onNavigate, onLogout }) => {
  const tabs = [
    { id: 'home', label: 'Problems' },
    { id: 'blitz', label: 'Contest' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="relative z-50 w-full flex items-center justify-between h-14 px-6 select-none font-mono"
      style={{ background: '#000000', borderBottom: '1px solid #27272a' }}
    >
      {/* Logo */}
      <div
        className="text-sm font-bold uppercase tracking-widest text-white cursor-pointer flex items-center gap-1"
        onClick={() => onNavigate('home')}
        role="link" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
      >
        <span>Binary</span>
        <span className="text-zinc-500 font-light">Beats</span>
      </div>

      {/* Center tabs */}
      <div className="flex items-center gap-1 font-mono uppercase tracking-wider text-[11px]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className="px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all"
            style={{
              background: activeTab === t.id ? '#ffffff' : 'transparent',
              color: activeTab === t.id ? '#000000' : '#71717a',
              border: activeTab === t.id ? '1px solid #ffffff' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-semibold text-zinc-300 uppercase tracking-wider">{username}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-950">
          <span className="text-white">⚡</span>
          <span className="font-bold text-white uppercase tracking-wider">{xp} XP</span>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1 rounded border border-zinc-850 hover:border-zinc-500 text-zinc-500 hover:text-white cursor-pointer transition-all text-[11px] uppercase tracking-wider font-semibold"
          style={{ background: 'transparent' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
