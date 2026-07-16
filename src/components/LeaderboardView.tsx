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
    <div className="w-full min-h-[calc(100vh-56px)] text-bb-ink relative pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="eyebrow mb-2">/03 <span className="text-bb-ink-faint normal-case">·</span> Global Standings</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-bb-ink mb-1 mt-2">Leaderboard</h2>
            <p className="text-xs font-mono text-bb-ink-faint">Ranked by {metricLabel}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-full overflow-hidden border border-bb-line bg-bb-paper-raised p-0.5 font-mono text-[10px]">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { playSound('click'); setPeriod(p.id); }}
                  className={`px-3 h-8 rounded-full font-bold tracking-wider cursor-pointer uppercase transition-colors relative ${
                    period === p.id ? 'text-bb-paper' : 'text-bb-ink-faint hover:text-bb-ink-soft'
                  }`}
                >
                  {period === p.id && (
                    <motion.span
                      layoutId="leaderboardPeriodBg"
                      className="absolute inset-0 bg-bb-ink rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-56 md:flex-none">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bb-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full h-10 pl-10 pr-4 rounded-lg text-xs font-mono text-bb-ink bg-bb-paper-raised placeholder-bb-ink-faint focus:outline-none border border-bb-line focus:border-bb-line-strong transition-colors"
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
                className={`relative flex flex-col items-center rounded-lg border p-5 transition-colors ${
                  isFirst
                    ? 'border-bb-orange/40 bg-bb-orange/[0.06] pb-8 order-2 corner-marks'
                    : `border-bb-line bg-bb-paper-raised hover:border-bb-line-strong pb-6 ${u.rank === 2 ? 'order-1' : 'order-3'}`
                }`}
              >
                <span className={`absolute -top-3 pill font-mono font-black text-xs w-7 h-7 flex items-center justify-center ${
                  isFirst ? 'bg-bb-orange text-bb-paper' : 'bg-bb-ink/[0.06] text-bb-ink-soft border border-bb-line-strong'
                }`}>#{u.rank}</span>
                <div
                  className={`rounded-full flex items-center justify-center font-bold font-mono bg-bb-ink text-bb-paper mt-3 mb-3 ${
                    isFirst ? 'w-16 h-16 text-lg border-2 border-bb-orange/50' : 'w-12 h-12 text-sm'
                  }`}
                >
                  {u.avatar}
                </div>
                <span className={`font-semibold truncate max-w-full ${isFirst ? 'text-bb-ink text-sm' : 'text-bb-ink-soft text-xs'}`}>
                  {u.username}{isMe && <span className="text-bb-orange"> (you)</span>}
                </span>
                <span className={`mt-0.5 ${u.tier === 'Luminary' ? 'editorial text-sm text-bb-lime' : 'text-[9px] font-mono text-bb-ink-faint'}`}>
                  {u.tier}
                </span>
                <span className={`stat-num mt-2 ${isFirst ? 'text-2xl text-bb-orange' : 'text-base text-bb-ink'}`}>
                  {period === 'allTime' ? u.rating : `+${metricFor(u)}`}
                </span>
                {period !== 'allTime' && <span className="text-[9px] font-mono text-bb-ink-faint mt-0.5">rating {u.rating}</span>}
              </motion.div>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Table */}
          <div className="lg:col-span-2 spec-card overflow-hidden flex flex-col">
            <div className="grid grid-cols-[60px_1fr_90px_80px_70px] items-center h-10 px-6 label-caps border-b border-bb-line select-none">
              <span>Rank</span>
              <span>Developer</span>
              <span className="text-right">{period === 'allTime' ? 'Rating' : 'XP'}</span>
              <span className="text-right">Solved</span>
              <span className="text-right">Streak</span>
            </div>

            <div className="flex flex-col divide-y divide-bb-line">
              <AnimatePresence mode="popLayout">
                {visibleUsers.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-16 text-center text-xs font-mono text-bb-ink-faint">
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
                          isMe ? 'bg-bb-orange/[0.05] border-l-bb-orange' : 'border-l-transparent hover:bg-bb-ink/[0.02] hover:border-l-bb-orange/40'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="stat-num text-base text-bb-ink-faint">
                            #{u.rank}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold bg-bb-ink text-bb-paper font-mono">
                            {u.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold font-sans ${isMe ? 'text-bb-ink' : 'text-bb-ink-soft'}`}>
                              {u.username} {isMe && <span className="text-[10px] font-mono tracking-wider uppercase text-bb-orange ml-2 font-bold">(you)</span>}
                            </span>
                            <span className="text-[10px] font-mono text-bb-ink-faint">{u.tier}</span>
                          </div>
                        </div>

                        <div className="text-right stat-num text-sm text-bb-ink">
                          {period === 'allTime' ? u.rating : `+${metricFor(u)}`}
                        </div>
                        <div className="text-right text-xs font-mono text-bb-ink-soft">{u.solved}</div>
                        <div className="text-right text-xs font-mono text-bb-ink-soft">🔥{u.streak}d</div>
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
              className="spec-card p-5">
              <h4 className="label-caps mb-4 border-b border-bb-line pb-2">
                Your Status
              </h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="label-caps block mb-1">
                    {PERIODS.find((p) => p.id === period)?.label} Standing
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="stat-num text-3xl text-bb-orange">
                      {myRank ? `#${myRank}` : '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="label-caps block mb-1">Rating Trend</span>
                  <div className="h-10 mt-1 relative flex items-end">
                    <svg className="w-full h-full text-bb-orange" viewBox="0 0 100 30" fill="none">
                      <path d="M0,25 Q15,22 30,23 T60,12 T90,8" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="90" cy="8" r="2.5" fill="#17140F" className="animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="spec-card p-5">
              {period === 'allTime' ? (
                <>
                  <h4 className="label-caps mb-3 border-b border-bb-line pb-2">
                    Tier Guide
                  </h4>
                  <div className="flex flex-col gap-3 text-xs font-mono">
                    {[
                      { tier: 'Luminary', rating: '3000+', color: '#8FB537' },
                      { tier: 'Sentinel', rating: '2800–3000', color: '#57503F' },
                      { tier: 'Elite', rating: '2400–2799', color: '#8C8371' },
                      { tier: 'Novice', rating: '< 2400', color: 'rgba(140,131,113,0.5)' }
                    ].map(t => (
                      <div key={t.tier} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="text-bb-ink-soft font-bold">{t.tier}</span>
                        </div>
                        <span className="text-bb-ink-faint text-[10px]">{t.rating}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="label-caps mb-3 border-b border-bb-line pb-2">
                    How this is ranked
                  </h4>
                  <p className="text-xs font-mono text-bb-ink-faint leading-relaxed">
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
