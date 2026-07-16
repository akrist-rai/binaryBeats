import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardProps {
  playSound: (type: 'click' | 'hover') => void;
  currentUser: string;
}

type Period = 'allTime' | 'monthly' | 'daily';

interface UserRank {
  username: string;
  avatar: string;
  rating: number;
  solved: number;
  tier: 'Luminary' | 'Sentinel' | 'Elite' | 'Novice';
  streak: number;
  accent: string;
  dailyXp: number;
  monthlyXp: number;
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'allTime', label: 'All-Time' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'daily', label: 'Daily' },
];

export const LeaderboardView: React.FC<LeaderboardProps> = ({ playSound, currentUser }) => {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('allTime');

  const users: UserRank[] = [
    { username: 'byte_boss', avatar: 'BB', rating: 3120, solved: 492, tier: 'Luminary', streak: 42, accent: '#f43f5e', dailyXp: 180, monthlyXp: 4200 },
    { username: 'compile_king', avatar: 'CK', rating: 2985, solved: 412, tier: 'Sentinel', streak: 28, accent: '#06b6d4', dailyXp: 220, monthlyXp: 3800 },
    { username: 'syntax_scripter', avatar: 'SS', rating: 2840, solved: 389, tier: 'Sentinel', streak: 19, accent: '#22c55e', dailyXp: 90, monthlyXp: 5100 },
    { username: 'cache_flow', avatar: 'CF', rating: 2790, solved: 356, tier: 'Elite', streak: 12, accent: '#eab308', dailyXp: 310, monthlyXp: 2900 },
    { username: 'stack_trace', avatar: 'ST', rating: 2650, solved: 320, tier: 'Elite', streak: 9, accent: '#a855f7', dailyXp: 60, monthlyXp: 3400 },
    { username: 'git_gud', avatar: 'GG', rating: 2510, solved: 290, tier: 'Elite', streak: 15, accent: '#ec4899', dailyXp: 150, monthlyXp: 2200 },
    { username: 'binary_beats_fan', avatar: 'BF', rating: 2340, solved: 210, tier: 'Novice', streak: 5, accent: '#3b82f6', dailyXp: 400, monthlyXp: 1800 },
    { username: 'akrist', avatar: 'AK', rating: 1420, solved: 121, tier: 'Novice', streak: 3, accent: '#7c5cfc', dailyXp: 80, monthlyXp: 900 },
  ];

  const metricFor = (u: UserRank) => (period === 'daily' ? u.dailyXp : period === 'monthly' ? u.monthlyXp : u.rating);

  const ranked = useMemo(() => {
    return [...users]
      .sort((a, b) => metricFor(b) - metricFor(a))
      .map((u, i) => ({ ...u, rank: i + 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const podium = [ranked[1], ranked[0], ranked[2]];
  const rest = ranked.filter((u) => u.rank > 3);

  const visibleUsers = useMemo(() => {
    return rest.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, period]);

  const metricLabel = period === 'daily' ? 'XP earned today' : period === 'monthly' ? 'XP earned this month' : 'rating';
  const myRank = ranked.find((u) => u.username === currentUser)?.rank;

  return (
    <div className="w-full min-h-[calc(100vh-56px)] text-zinc-100 relative pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Global Standings</span>
            <h2 className="text-2xl md:text-3xl font-bold font-heading gradient-text-cool mb-1 tracking-tight mt-1">Leaderboard</h2>
            <p className="text-xs font-mono text-zinc-500">Ranked by {metricLabel}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-lg overflow-hidden border border-white/[0.08] bg-[#111116] p-0.5 font-mono text-[10px]">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { playSound('click'); setPeriod(p.id); }}
                  className="px-3 h-8 rounded-md font-bold tracking-wider cursor-pointer uppercase transition-colors relative"
                  style={{ color: period === p.id ? '#000000' : '#71717a' }}
                >
                  {period === p.id && (
                    <motion.span
                      layoutId="leaderboardPeriodBg"
                      className="absolute inset-0 bg-[#c3f73a] rounded-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-56 md:flex-none">
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
        </div>

        {/* Podium — top 3 */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
          {podium.map((u) => {
            const isFirst = u.rank === 1;
            const isMe = u.username === currentUser;
            return (
              <motion.div
                key={u.username}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isFirst ? 0 : 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                className={`relative flex flex-col items-center rounded-xl border p-5 ${
                  isFirst
                    ? 'border-[#c3f73a]/30 bg-gradient-to-b from-[#c3f73a]/[0.08] to-transparent glow-acc pb-8 order-2'
                    : u.rank === 2
                      ? 'border-white/[0.08] bg-[#111116] pb-6 order-1'
                      : 'border-white/[0.08] bg-[#111116] pb-6 order-3'
                }`}
              >
                <span className={`absolute -top-3 font-mono font-black text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                  isFirst ? 'bg-[#c3f73a] text-black' : 'bg-white/10 text-zinc-300 border border-white/[0.15]'
                }`}>#{u.rank}</span>
                <div
                  className={`rounded-full flex items-center justify-center font-bold font-mono text-white mt-3 mb-3 ${isFirst ? 'w-16 h-16 text-lg' : 'w-12 h-12 text-sm'}`}
                  style={{ backgroundColor: u.accent, boxShadow: isFirst ? `0 0 30px -6px ${u.accent}` : 'none' }}
                >
                  {u.avatar}
                </div>
                <span className={`font-semibold truncate max-w-full ${isFirst ? 'text-white text-sm' : 'text-zinc-300 text-xs'}`}>
                  {u.username}{isMe && <span className="text-[#c3f73a]"> (you)</span>}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{u.tier}</span>
                <span className={`font-mono font-bold mt-2 ${isFirst ? 'text-xl text-[#c3f73a]' : 'text-base text-white'}`}>
                  {period === 'allTime' ? u.rating : `+${metricFor(u)}`}
                </span>
                {period !== 'allTime' && <span className="text-[9px] font-mono text-zinc-600 mt-0.5">rating {u.rating}</span>}
              </motion.div>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-white/[0.08] bg-[#111116] flex flex-col">
            <div className="grid grid-cols-[60px_1fr_90px_80px_70px] items-center h-10 px-6 text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 border-b border-white/[0.08] select-none">
              <span>Rank</span>
              <span>Developer</span>
              <span className="text-right">{period === 'allTime' ? 'Rating' : 'XP'}</span>
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
                          <span className="text-xs font-mono font-bold text-zinc-500">
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

                        <div className="text-right text-sm font-mono font-bold text-white">
                          {period === 'allTime' ? u.rating : `+${metricFor(u)}`}
                        </div>
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
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-1">
                    {PERIODS.find((p) => p.id === period)?.label} Standing
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-glow text-[#c3f73a]">
                      {myRank ? `#${myRank}` : '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block mb-1">Rating Trend</span>
                  <div className="h-10 mt-1 relative flex items-end">
                    <svg className="w-full h-full text-[#35e8ff]" viewBox="0 0 100 30" fill="none">
                      <path d="M0,25 Q15,22 30,23 T60,12 T90,8" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="90" cy="8" r="2.5" fill="white" className="animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
              {period === 'allTime' ? (
                <>
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
                </>
              ) : (
                <>
                  <h4 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-3 border-b border-white/[0.08] pb-2">
                    How this is ranked
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                    {period === 'daily'
                      ? 'Ranked by XP earned in the last 24 hours. Resets daily — rating stays the same, only the order changes.'
                      : 'Ranked by XP earned so far this month. Resets on the 1st — rating stays the same, only the order changes.'}
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
