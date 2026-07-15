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
    { rank: 1, username: 'byte_boss', avatar: 'BB', rating: 3120, solved: 492, tier: 'Luminary', streak: 42, accent: '#f43f5e' },
    { rank: 2, username: 'compile_king', avatar: 'CK', rating: 2985, solved: 412, tier: 'Sentinel', streak: 28, accent: '#06b6d4' },
    { rank: 3, username: 'syntax_scripter', avatar: 'SS', rating: 2840, solved: 389, tier: 'Sentinel', streak: 19, accent: '#22c55e' },
    { rank: 4, username: 'cache_flow', avatar: 'CF', rating: 2790, solved: 356, tier: 'Elite', streak: 12, accent: '#eab308' },
    { rank: 5, username: 'stack_trace', avatar: 'ST', rating: 2650, solved: 320, tier: 'Elite', streak: 9, accent: '#a855f7' },
    { rank: 6, username: 'git_gud', avatar: 'GG', rating: 2510, solved: 290, tier: 'Elite', streak: 15, accent: '#ec4899' },
    { rank: 7, username: 'binary_beats_fan', avatar: 'BF', rating: 2340, solved: 210, tier: 'Novice', streak: 5, accent: '#3b82f6' },
    { rank: 142, username: 'akrist', avatar: 'AK', rating: 1420, solved: 121, tier: 'Novice', streak: 3, accent: '#7c5cfc' }
  ];

  const visibleUsers = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="w-full min-h-[calc(100vh-56px)] text-zinc-100 bg-[#0a0a0f] relative pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2 tracking-tight">Leaderboard</h2>
            <p className="text-xs font-mono text-zinc-500">Global developer rankings</p>
          </div>

          <div className="relative w-full md:w-72">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full h-10 pl-10 pr-4 rounded-lg text-xs font-mono text-white bg-[#111116] placeholder-zinc-600 focus:outline-none border border-white/[0.08] focus:border-[#c3f73a]/30 transition-colors"
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-white/[0.08] bg-[#111116] flex flex-col">
            <div className="grid grid-cols-[60px_1fr_90px_80px_70px] items-center h-10 px-6 text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 border-b border-white/[0.08] select-none">
              <span>Rank</span>
              <span>Developer</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Solved</span>
              <span className="text-right">Streak</span>
            </div>

            <div className="flex flex-col divide-y divide-white/[0.04]">
              <AnimatePresence mode="popLayout">
                {visibleUsers.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-16 text-center text-xs font-mono text-zinc-500">
                    No developers found
                  </motion.div>
                ) : (
                  visibleUsers.map((u) => {
                    const isMe = u.username === currentUser;
                    return (
                      <motion.div 
                        key={u.username} layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`grid grid-cols-[60px_1fr_90px_80px_70px] items-center px-6 py-4 transition-colors border-l-2 ${
                          isMe ? 'bg-white/[0.03] border-l-[#c3f73a]' : 'border-l-transparent hover:bg-white/[0.01] hover:border-l-[#c3f73a]/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`text-xs font-mono font-bold ${
                            u.rank === 1 ? 'text-amber-400' : 
                            u.rank === 2 ? 'text-zinc-300' : 
                            u.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                          }`}>
                            #{u.rank}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-mono"
                            style={{ backgroundColor: u.accent }}
                          >
                            {u.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold font-sans ${isMe ? 'text-white' : 'text-zinc-300'}`}>
                              {u.username} {isMe && <span className="text-[10px] font-mono tracking-wider uppercase text-[#c3f73a] ml-2 font-bold">(you)</span>}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{u.tier}</span>
                          </div>
                        </div>

                        <div className="text-right text-sm font-mono font-bold text-white">{u.rating}</div>
                        <div className="text-right text-xs font-mono text-zinc-400">{u.solved}</div>
                        <div className="text-right text-xs font-mono text-zinc-400">🔥{u.streak}d</div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
              <h4 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-4 border-b border-white/[0.08] pb-2">
                Your Status
              </h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-1">Global Standing</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-[#c3f73a]">#142</span>
                    <span className="text-[10px] font-mono text-zinc-500">Top 12.4%</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-1">Rating Trend</span>
                  <div className="h-10 mt-1 relative flex items-end">
                    <svg className="w-full h-full text-[#c3f73a]" viewBox="0 0 100 30" fill="none">
                      <path d="M0,25 Q15,22 30,23 T60,12 T90,8" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="90" cy="8" r="2.5" fill="white" className="animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
              <h4 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-3 border-b border-white/[0.08] pb-2">
                Tier Guide
              </h4>
              <div className="flex flex-col gap-3 text-xs font-mono">
                {[
                  { tier: 'Luminary', rating: '3000+', color: '#f43f5e' },
                  { tier: 'Sentinel', rating: '2800–3000', color: '#06b6d4' },
                  { tier: 'Elite', rating: '2400–2799', color: '#a855f7' },
                  { tier: 'Novice', rating: '< 2400', color: '#3b82f6' }
                ].map(t => (
                  <div key={t.tier} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-zinc-300 font-bold">{t.tier}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{t.rating}</span>
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
