import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props { onPlayEpisode: (id: string) => void; }

const PROBLEMS = [
  { id: 'p1', num: 1, title: 'Two Sum', tags: ['Array','Hash Table'], diff: 'Easy' as const, rate: '52.4%', xp: 80, solved: true },
  { id: 'p2', num: 15, title: 'Valid Parentheses', tags: ['Stack','String'], diff: 'Medium' as const, rate: '43.1%', xp: 150, solved: false },
  { id: 'p3', num: 23, title: 'Merge K Sorted Lists', tags: ['Heap','Linked List'], diff: 'Hard' as const, rate: '19.7%', xp: 300, solved: false },
];

const DC = { Easy: '#00b8a3', Medium: '#ffc01e', Hard: '#ff375f' };

// Generate fake heatmap data (52 weeks × 7 days)
const heatmapData = Array.from({ length: 52 * 7 }, (_, i) => {
  const r = Math.sin(i * 0.3) * 0.5 + Math.random();
  if (i > 340) return r > 0.6 ? (r > 0.85 ? 3 : r > 0.72 ? 2 : 1) : 0;
  return r > 0.7 ? (r > 0.9 ? 3 : r > 0.8 ? 2 : 1) : 0;
});

const heatColors = ['#161b22', '#0e4429', '#006d32', '#26a641'];

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

  return (
    <div style={{ background: '#1a1a2e' }} className="w-full min-h-[calc(100vh-56px)]">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="flex flex-col gap-6">

            {/* Study Plan Banner */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="rounded-xl overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,55,95,0.3), transparent 60%)' }} />
              <div className="relative p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: 'rgba(255,55,95,0.15)', color: '#ff375f' }}>Featured</span>
                    <span className="text-[10px] text-white/30 font-mono">{countdown} remaining</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Daily Challenge: Merge K Sorted Lists</h3>
                  <p className="text-sm text-white/40 mt-1">Solve today's challenge to maintain your streak</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onPlayEpisode('p3')}
                  className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ background: '#ff375f', color: '#fff', boxShadow: '0 4px 16px rgba(255,55,95,0.3)' }}
                >
                  Solve →
                </motion.button>
              </div>
            </motion.div>

            {/* Toolbar: Search + Difficulty Tabs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] text-white/80 placeholder-white/20 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              {/* Diff tabs */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {(['All','Easy','Medium','Hard'] as const).map(d => {
                  const isActive = filter === d;
                  const c = d !== 'All' ? DC[d] : null;
                  return (
                    <button key={d} onClick={() => setFilter(d)}
                      className="px-4 h-9 text-[12px] font-medium cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: isActive ? (c || '#fff') : 'rgba(255,255,255,0.3)',
                        borderRight: d !== 'Hard' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}
                    >{d}</button>
                  );
                })}
              </div>
            </motion.div>

            {/* Problem Table */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_80px_70px_80px] items-center h-10 px-4 text-[11px] font-medium text-white/25 uppercase tracking-wider select-none"
                style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
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
                    className="py-16 text-center text-sm text-white/20">No problems found</motion.div>
                ) : visible.map((p, i) => (
                  <motion.div key={p.id} layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onPlayEpisode(p.id)}
                    className="grid grid-cols-[40px_1fr_80px_70px_80px] items-center px-4 py-3.5 cursor-pointer transition-colors group"
                    style={{
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    {/* Status */}
                    <div className="flex justify-center">
                      {p.solved ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,184,163,0.15)' }}>
                          <svg className="w-3 h-3" style={{ color: DC.Easy }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.08)' }} />
                      )}
                    </div>

                    {/* Title + tags */}
                    <div className="min-w-0 pl-1">
                      <span className="text-[13px] text-white/80 group-hover:text-white transition-colors font-medium">
                        {p.num}. {p.title}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {p.tags.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-white/25"
                            style={{ background: 'rgba(255,255,255,0.04)' }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="text-center">
                      <span className="text-[11px] font-semibold" style={{ color: DC[p.diff] }}>{p.diff}</span>
                    </div>

                    {/* Acceptance */}
                    <div className="text-center text-[12px] text-white/30">{p.rate}</div>

                    {/* XP */}
                    <div className="text-right">
                      <span className="text-[12px] font-bold font-mono" style={{ color: '#a3e635' }}>+{p.xp}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="flex flex-col gap-6">

            {/* User Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, #ff375f, #ff6b6b)', color: '#fff' }}>A</div>
                <div>
                  <div className="text-sm font-semibold text-white">akrist</div>
                  <div className="text-[11px] text-white/30 font-mono">Rank #142</div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="flex flex-col gap-3">
                {([
                  { label: 'Easy', solved: 1, total: 1, color: DC.Easy },
                  { label: 'Medium', solved: 0, total: 1, color: DC.Medium },
                  { label: 'Hard', solved: 0, total: 1, color: DC.Hard },
                ]).map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span style={{ color: s.color }} className="font-medium">{s.label}</span>
                      <span className="text-white/30 font-mono">{s.solved}/{s.total}</span>
                    </div>
                    <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.total ? (s.solved/s.total)*100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { n: `${solved}`, label: 'Solved' },
                  { n: '230', label: 'XP' },
                  { n: '3 🔥', label: 'Streak' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-bold text-white">{s.n}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contribution Heatmap */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-white/60">42 submissions in the past year</span>
              </div>
              {/* Heatmap grid */}
              <div className="flex gap-[3px] overflow-hidden">
                {Array.from({ length: 52 }, (_, week) => (
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
                          transition={{ delay: 0.4 + idx * 0.0008, duration: 0.15 }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-3">
                <span className="text-[10px] text-white/20 mr-1">Less</span>
                {heatColors.map((c, i) => (
                  <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
                ))}
                <span className="text-[10px] text-white/20 ml-1">More</span>
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="rounded-xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h4 className="text-sm font-medium text-white/60 mb-3">Trending Topics</h4>
              <div className="flex flex-wrap gap-2">
                {['Array','Hash Table','Dynamic Programming','String','Binary Search','Stack','Graph','Tree'].map(t => (
                  <span key={t} className="text-[11px] px-3 py-1.5 rounded-full cursor-pointer transition-colors text-white/40 hover:text-white/70"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
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
