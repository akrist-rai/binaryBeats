import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  playSound: (type: 'click' | 'hover') => void;
  currentUser: string;
}

interface UserRank {
  rank: number;
  username: string;
  avatar: string;
  rating: number;
  solved: number;
  tier: 'Luminary' | 'Sentinel' | 'Elite' | 'Novice';
  streak: number;
  accent: string;
}

export const LeaderboardView: React.FC<LeaderboardProps> = ({ playSound, currentUser }) => {
  const [search, setSearch] = useState('');

  const users: UserRank[] = [
    { rank: 1, username: 'byte_boss', avatar: 'BB', rating: 3120, solved: 492, tier: 'Luminary', streak: 42, accent: '#ff0055' },
    { rank: 2, username: 'compile_king', avatar: 'CK', rating: 2985, solved: 412, tier: 'Sentinel', streak: 28, accent: '#00e5ff' },
    { rank: 3, username: 'syntax_scripter', avatar: 'SS', rating: 2840, solved: 389, tier: 'Sentinel', streak: 19, accent: '#00ff66' },
    { rank: 4, username: 'cache_flow', avatar: 'CF', rating: 2790, solved: 356, tier: 'Elite', streak: 12, accent: '#eab308' },
    { rank: 5, username: 'stack_trace', avatar: 'ST', rating: 2650, solved: 320, tier: 'Elite', streak: 9, accent: '#a855f7' },
    { rank: 6, username: 'git_gud', avatar: 'GG', rating: 2510, solved: 290, tier: 'Elite', streak: 15, accent: '#ec4899' },
    { rank: 7, username: 'binary_beats_fan', avatar: 'BF', rating: 2340, solved: 210, tier: 'Novice', streak: 5, accent: '#3b82f6' },
    { rank: 142, username: 'akrist', avatar: 'AK', rating: 1420, solved: 121, tier: 'Novice', streak: 3, accent: 'var(--mg-acc, #ff2a38)' }
  ];

  const visibleUsers = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-white bg-black relative pb-12">
      {/* Dynamic background lighting */}
      <div className="absolute top-[30%] left-[30%] w-[450px] h-[300px] rounded-full bg-mg-acc/5 blur-[120px] pointer-events-none" />

      <div className="w-full px-12 py-10 flex flex-col gap-6 relative z-10">
        
        {/* Header grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-mono tracking-widest uppercase mb-1">
              Developer Rankings
            </h2>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
              Real-time standing in the global compiling arena
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72 font-mono">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full h-10 pl-9 pr-3 rounded text-xs text-white bg-zinc-950/80 placeholder-zinc-600 focus:outline-none transition-colors border border-zinc-900 focus:border-zinc-700 shadow-inner"
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Leaderboard Table (Col Span 2) */}
          <div className="lg:col-span-2 rounded overflow-hidden glass-panel border border-zinc-900 shadow-xl flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_90px_80px_70px] items-center h-12 px-6 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900/60 bg-zinc-950/40 select-none">
              <span>Rank</span>
              <span>Developer</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Solved</span>
              <span className="text-right">Streak</span>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col divide-y divide-zinc-900/40 font-mono">
              <AnimatePresence mode="popLayout">
                {visibleUsers.length === 0 ? (
                  <motion.div 
                    key="empty" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="py-16 text-center text-sm text-zinc-500 font-mono"
                  >
                    No developers found
                  </motion.div>
                ) : (
                  visibleUsers.map((u) => {
                    const isMe = u.username === currentUser;
                    return (
                      <motion.div 
                        key={u.username}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`grid grid-cols-[60px_1fr_90px_80px_70px] items-center px-6 py-4 transition-colors ${
                          isMe 
                            ? 'bg-mg-acc/5 hover:bg-mg-acc/8 border-y border-mg-acc/10' 
                            : 'hover:bg-white/[0.01]'
                        }`}
                      >
                        {/* Rank indicator */}
                        <div className="flex items-center">
                          <span className={`text-xs font-bold ${
                            u.rank === 1 ? 'text-[#ff0055] text-glow' : 
                            u.rank === 2 ? 'text-[#00e5ff] text-glow' : 
                            u.rank === 3 ? 'text-[#00ff66] text-glow' : 'text-zinc-500'
                          }`}>
                            #{String(u.rank).padStart(2, '0')}
                          </span>
                        </div>

                        {/* User Card */}
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-md border"
                            style={{ 
                              backgroundColor: u.accent,
                              borderColor: isMe ? 'white' : 'transparent',
                              boxShadow: `0 0 10px ${u.accent}40`
                            }}
                          >
                            {u.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[12px] font-bold ${isMe ? 'text-white' : 'text-zinc-300'}`}>
                              {u.username} {isMe && <span className="text-[9px] font-bold text-mg-acc ml-1 uppercase">(You)</span>}
                            </span>
                            <span className="text-[9px] text-zinc-500 uppercase font-semibold">{u.tier}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="text-right text-xs font-bold text-zinc-200">
                          {u.rating}
                        </div>

                        {/* Solved */}
                        <div className="text-right text-xs font-bold text-zinc-400">
                          {u.solved}
                        </div>

                        {/* Streak */}
                        <div className="text-right text-xs font-bold text-zinc-400">
                          🔥{u.streak}d
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User statistics card sidebar */}
          <div className="flex flex-col gap-6 font-mono">
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded glass-panel p-5"
            >
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2">
                Your Arena Status
              </h4>

              <div className="flex flex-col gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Global Standing</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">Rank #142</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Top 12.4%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Weekly Rating Trajectory</span>
                  <div className="h-10 mt-1 relative flex items-end">
                    {/* SVG representation of trajectory sparkline */}
                    <svg className="w-full h-full text-mg-acc" viewBox="0 0 100 30" fill="none">
                      <path 
                        d="M0,25 Q15,22 30,23 T60,12 T90,8" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        fill="none"
                        style={{ filter: 'drop-shadow(0px 0px 4px var(--mg-acc))' }}
                      />
                      <circle cx="90" cy="8" r="2.5" fill="white" className="animate-pulse" />
                    </svg>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-500">
                  <span>REGIONAL CLUSTER</span>
                  <span className="font-bold text-zinc-300">EU-CENTRAL-01</span>
                </div>
              </div>
            </motion.div>

            {/* Legend card */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded glass-panel p-5 text-[10px] text-zinc-500"
            >
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-2">
                Arena Tier Guide
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { tier: 'Luminary', rating: 'Rating > 3000', color: '#ff0055' },
                  { tier: 'Sentinel', rating: 'Rating 2800 - 3000', color: '#00e5ff' },
                  { tier: 'Elite', rating: 'Rating 2400 - 2799', color: '#a855f7' },
                  { tier: 'Novice', rating: 'Rating < 2400', color: '#3b82f6' }
                ].map(t => (
                  <div key={t.tier} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-bold text-zinc-400">{t.tier}</span>
                    </div>
                    <span>{t.rating}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};
