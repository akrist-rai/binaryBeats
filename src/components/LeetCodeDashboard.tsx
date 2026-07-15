import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props { onPlayEpisode: (id: string) => void; }

const PROBLEMS = [
  { id: 'p1', num: 1, title: 'Two Sum', tags: ['Array','Hash Table'], diff: 'Easy' as const, rate: '52.4%', xp: 80, solved: true },
  { id: 'p2', num: 15, title: 'Valid Parentheses', tags: ['Stack','String'], diff: 'Medium' as const, rate: '43.1%', xp: 150, solved: false },
  { id: 'p3', num: 23, title: 'Merge K Sorted Lists', tags: ['Heap','Linked List'], diff: 'Hard' as const, rate: '19.7%', xp: 300, solved: false },
];

const DC = {
  Easy: { text: 'text-zinc-400', bg: 'bg-zinc-900', border: 'border-zinc-800' },
  Medium: { text: 'text-zinc-200', bg: 'bg-zinc-800', border: 'border-zinc-700' },
  Hard: { text: 'text-white font-bold', bg: 'bg-zinc-700', border: 'border-zinc-600' }
};

// Heatmap colors in shades of gray
const heatColors = ['#121214', '#27272a', '#52525b', '#e4e4e7'];

// Generate fake heatmap data (52 weeks × 7 days)
const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => {
  const r = Math.sin(i * 0.3) * 0.5 + Math.random();
  if (i > 340) return r > 0.6 ? (r > 0.85 ? 3 : r > 0.72 ? 2 : 1) : 0;
  return r > 0.7 ? (r > 0.9 ? 3 : r > 0.8 ? 2 : 1) : 0;
});

export const LeetCodeDashboard = ({ onPlayEpisode }: Props) => {
  const [filter, setFilter] = useState<'All'|'Easy'|'Medium'|'Hard'>('All');
  const [search, setSearch] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date(); d.setHours(24, 0, 0, 0);
      const ms = Math.max(0, d.getTime() - Date.now());
      setCountdown(`${String(Math.floor(ms/3.6e6)).padStart(2,'0')}:${String(Math.floor((ms%3.6e6)/6e4)).padStart(2,'0')}:${String(Math.floor((ms%6e4)/1e3)).padStart(2,'0')}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const visible = useMemo(() => PROBLEMS.filter(p => {
    if (filter !== 'All' && p.diff !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filter, search]);

  const solved = PROBLEMS.filter(p => p.solved).length;
  const pct = Math.round((solved / PROBLEMS.length) * 100);

  return (
    <div style={{ background: '#000000' }} className="w-full min-h-[calc(100vh-56px)] text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="flex flex-col gap-6">

            {/* Study Plan Banner - Black and White style */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="rounded-xl overflow-hidden relative bg-zinc-950"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white text-black font-semibold">Daily</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{countdown} remaining</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">Merge K Sorted Lists</h3>
                  <p className="text-sm text-zinc-400 mt-1 font-light">Complete the spotlight task to maintain active streak</p>
                </div>
                <motion.button
                  whileHover={{ backgroundColor: '#ffffff', color: '#000000', scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPlayEpisode('p3')}
                  className="shrink-0 px-6 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider font-bold cursor-pointer border border-white transition-colors bg-transparent text-white"
                >
                  Solve →
                </motion.button>
              </div>
            </motion.div>

            {/* Toolbar: Search + Difficulty Tabs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center font-mono"
            >
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] text-white bg-zinc-950 placeholder-zinc-600 focus:outline-none transition-colors border border-zinc-800 focus:border-zinc-500"
                />
              </div>
              {/* Diff tabs */}
              <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                {(['All','Easy','Medium','Hard'] as const).map(d => {
                  const isActive = filter === d;
                  return (
                    <button key={d} onClick={() => setFilter(d)}
                      className="px-4 h-9 text-[11px] font-semibold tracking-wider cursor-pointer uppercase transition-all"
                      style={{
                        background: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? '#000000' : '#71717a',
                        borderRight: d !== 'Hard' ? '1px solid #27272a' : 'none',
                      }}
                    >{d}</button>
                  );
                })}
              </div>
            </motion.div>

            {/* Problem List */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/40"
            >
              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_90px_70px_90px] items-center h-10 px-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest select-none border-b border-zinc-900 bg-zinc-950"
              >
                <span></span>
                <span>Title</span>
                <span className="text-center">Difficulty</span>
                <span className="text-center">Rate</span>
                <span className="text-right">Reward</span>
              </div>

              {/* Table rows */}
              <AnimatePresence mode="popLayout">
                {visible.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-16 text-center text-sm text-zinc-500 font-mono">No problems found</motion.div>
                ) : visible.map((p, i) => {
                  const theme = DC[p.diff];
                  return (
                    <motion.div key={p.id} layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onPlayEpisode(p.id)}
                      className="grid grid-cols-[40px_1fr_90px_70px_90px] items-center px-4 py-4 cursor-pointer transition-colors group border-b border-zinc-900/50"
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                      {/* Status */}
                      <div className="flex justify-center">
                        {p.solved ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-white text-black text-[9px] font-bold">
                            ✓
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-800 bg-transparent" />
                        )}
                      </div>

                      {/* Title + tags */}
                      <div className="min-w-0 pl-1 font-mono">
                        <span className="text-[13px] text-zinc-300 group-hover:text-white transition-colors">
                          {String(p.num).padStart(3, '0')}. {p.title}
                        </span>
                        <div className="flex gap-1 mt-1.5">
                          {p.tags.map(t => (
                            <span key={t} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded text-zinc-500 bg-zinc-900 border border-zinc-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="text-center font-mono uppercase tracking-wider text-[10px]">
                        <span className={`px-2 py-0.5 rounded border ${theme.text} ${theme.bg} ${theme.border}`}>
                          {p.diff}
                        </span>
                      </div>

                      {/* Acceptance */}
                      <div className="text-center text-[11px] font-mono text-zinc-500">{p.rate}</div>

                      {/* XP */}
                      <div className="text-right font-mono text-xs font-bold text-white">
                        +{p.xp} XP
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="flex flex-col gap-6">

            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-xl p-5 border border-zinc-800 bg-zinc-950"
            >
              <div className="flex items-center gap-3 mb-5 font-mono">
                <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center text-sm font-bold bg-white text-black">
                  AK
                </div>
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider">akrist</div>
                  <div className="text-[10px] text-zinc-500 font-mono">RANK #142</div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex flex-col gap-3 font-mono text-[10px] tracking-wider">
                {([
                  { label: 'Easy', solved: 1, total: 1, text: 'text-zinc-400', barBg: 'bg-zinc-400' },
                  { label: 'Medium', solved: 0, total: 1, text: 'text-zinc-300', barBg: 'bg-zinc-200' },
                  { label: 'Hard', solved: 0, total: 1, text: 'text-white', barBg: 'bg-white' },
                ]).map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1 uppercase">
                      <span className={s.text}>{s.label}</span>
                      <span className="text-zinc-500">{s.solved}/{s.total}</span>
                    </div>
                    <div className="h-[4px] rounded-full overflow-hidden bg-zinc-900">
                      <motion.div className={`h-full rounded-full ${s.barBg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.total ? (s.solved/s.total)*100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-zinc-900 font-mono uppercase tracking-wider">
                {[
                  { n: `${solved}`, label: 'Solved' },
                  { n: '230', label: 'XP' },
                  { n: '3', label: 'Streak' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-sm font-bold text-white">{s.n}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submissions Heatmap - monochrome cells */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-xl p-5 border border-zinc-800 bg-zinc-950"
            >
              <div className="flex justify-between items-center mb-3 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                <span>Submission Activity</span>
              </div>
              {/* Heatmap grid */}
              <div className="flex gap-[3px] overflow-hidden">
                {Array.from({ length: 26 }, (_, week) => (
                  <div key={week} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }, (_, day) => {
                      const idx = week * 7 + day;
                      const level = heatmapData[idx] || 0;
                      return (
                        <motion.div key={day}
                          className="w-[10px] h-[10px] rounded-[2px]"
                          style={{ background: heatColors[level] }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + idx * 0.001, duration: 0.15 }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-3 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                <span className="mr-1">Less</span>
                {heatColors.map((c, i) => (
                  <div key={i} className="w-[8px] h-[8px] rounded-[1px]" style={{ background: c }} />
                ))}
                <span className="ml-1">More</span>
              </div>
            </motion.div>

            {/* Trending Topics - minimal monochrome outline badges */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="rounded-xl p-5 border border-zinc-800 bg-zinc-950 font-mono"
            >
              <h4 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {['Array','Hash Table','Stack','Heap','Linked List','Divide & Conquer'].map(t => (
                  <span key={t} className="text-[10px] px-3 py-1.5 rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider cursor-pointer"
                    style={{ background: 'transparent' }}
                  >{t}</span>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
