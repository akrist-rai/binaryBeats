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
    <nav className="relative z-50 w-full flex items-center justify-between h-14 px-6 select-none"
      style={{ background: 'rgba(9,9,11,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
    >
      {/* Logo */}
      <div
        className="text-base font-bold tracking-tight text-white cursor-pointer flex items-center gap-0.5"
        onClick={() => onNavigate('home')}
        role="link" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onNavigate('home'); }}
      >
        <span style={{ color: '#ef4444' }}>B</span>inary<span className="text-white/40 font-normal ml-1">Beats</span>
      </div>

      {/* Center tabs */}
      <div className="flex items-center gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{
              background: activeTab === t.id ? 'rgba(239,68,68,0.08)' : 'transparent',
              color: activeTab === t.id ? '#ef4444' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${activeTab === t.id ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-white/60">{username}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#a3e635' }}>⚡</span>
          <span className="font-bold text-white/80">{xp} XP</span>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1 rounded-md text-white/30 hover:text-white/60 cursor-pointer transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
