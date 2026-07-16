import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProblems } from '../hooks/useProblems';
import { RatingBadge } from './blitz/RatingBadge';
import { HeroSection } from './HeroSection';
import { ProblemOrbit } from './ProblemOrbit';
import { SolveWorkspace } from './solve/SolveWorkspace';
import { practiceProblemToSolvable } from './solve/adapters';
import { logSolve } from '../lib/activityLog';

interface Props {
  playSound: (t: 'click' | 'hover') => void;
  onShareSolution: (d: { problemTitle: string; code: string }) => void;
  onNavigateTab: (tab: string) => void;
}

const heatmapData = Array.from({ length: 22 * 7 }, (_, i) => {
  const r = Math.sin(i * 0.3) * 0.5 + Math.random();
  const val = i > 100 ? (r > 0.7 ? (r > 0.88 ? 3 : 2) : 0) : (r > 0.75 ? 1 : 0);
  const d = new Date(); d.setDate(d.getDate() - (22 * 7 - i));
  return { val, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
});

const PAPER_HEAT = ['rgba(23,20,15,0.06)', 'rgba(225,90,32,0.35)', 'rgba(225,90,32,0.65)', '#E15A20'];
const CF_TAGS = ['dp','greedy','graphs','trees','math','sorting','binary search','implementation','strings','geometry'];

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'rating-asc', label: 'Rating ↑' },
  { id: 'rating-desc', label: 'Rating ↓' },
  { id: 'title', label: 'Title A–Z' },
] as const;

export const LeetCodeDashboard = ({ playSound, onShareSolution, onNavigateTab }: Props) => {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<''|'easy'|'medium'|'hard'>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [solvedKeys, setSolvedKeys] = useState<string[]>([]);
  const [solveTick, setSolveTick] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'orbit'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['id']>('default');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { problems, total, pages, loading, error } = useProblems({
    search: search || undefined,
    difficulty: difficulty || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    page, pageSize: 50,
  });

  const activeProblem = activeKey ? problems.find(p => p.key === activeKey) ?? null : null;

  useEffect(() => { setPage(1); }, [search, difficulty, selectedTag]);

  // Load solved problem keys from the activity log
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bb_activity_log_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        const keys = parsed.map((e: any) => e.key).filter(Boolean);
        setSolvedKeys(keys);
      }
    } catch {}
  }, [solveTick]);

  // "/" focuses search, like most fast problem trackers
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const open = (key: string) => { playSound('click'); setActiveKey(key); };
  const back = () => { playSound('click'); setActiveKey(null); };

  const getDiff = (rating?: number | null) => !rating ? 'Unrated' : rating<=1300 ? 'Easy' : rating<=1900 ? 'Medium' : 'Hard';

  // Client-side status filter + sort layered on top of the server-paginated page
  const displayProblems = useMemo(() => {
    let list = problems.filter(p => {
      if (statusFilter === 'solved') return solvedKeys.includes(p.key);
      if (statusFilter === 'unsolved') return !solvedKeys.includes(p.key);
      return true;
    });
    if (sortBy === 'rating-asc') list = [...list].sort((a, b) => (a.rating ?? 99999) - (b.rating ?? 99999));
    if (sortBy === 'rating-desc') list = [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    if (sortBy === 'title') list = [...list].sort((a, b) => (a.title ?? a.key).localeCompare(b.title ?? b.key));
    return list;
  }, [problems, statusFilter, sortBy, solvedKeys]);

  const diffBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0, Unrated: 0 };
    displayProblems.forEach(p => { counts[getDiff(p.rating)]++; });
    return counts;
  }, [displayProblems]);

  const currentStreak = useMemo(() => {
    let s = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].val > 0) s++; else break;
    }
    return s;
  }, []);

  const nextUp = problems.find(p => !solvedKeys.includes(p.key)) ?? problems[0] ?? null;

  const activeFilterCount = [search, difficulty, selectedTag, statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length;
  const resetFilters = () => {
    playSound('click');
    setSearch(''); setDifficulty(''); setSelectedTag(null); setStatusFilter('all');
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-bb-ink flex flex-col">
      <AnimatePresence mode="wait">

        {/* ── WORKSPACE VIEW — full-bleed, no page max-width, desktop IDE layout ── */}
        {activeKey && activeProblem ? (
          <motion.div
            key="workspace"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="flex-1 flex flex-col w-full px-2.5 lg:px-4 py-2.5 lg:py-3 min-h-0"
          >
            <SolveWorkspace
              mode="practice"
              problem={practiceProblemToSolvable(activeProblem)}
              solved={solvedKeys.includes(activeKey)}
              onBack={back}
              onAccepted={() => {
                playSound('click');
                setSolveTick(t => t + 1);
                logSolve({
                  source: 'leetcode',
                  key: activeKey,
                  title: activeProblem.title ?? activeKey,
                  meta: activeProblem.rating ? String(activeProblem.rating) : 'Unrated',
                  solvedAtSeconds: Math.floor(Date.now() / 1000),
                });
              }}
              playSound={playSound}
            />
          </motion.div>

        ) : (
          /* ── PROBLEMS LIST ── */
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 py-10 flex-1 flex flex-col">
            <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col gap-0">
              <HeroSection total={total} playSound={playSound} onNavigateTab={onNavigateTab} />

              {/* Snapshot strip — quick read on progress before scanning the list */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="spec-card px-4 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bb-lime/10 border border-bb-lime/40 flex items-center justify-center text-bb-lime text-xs font-bold shrink-0">✓</div>
                  <div className="min-w-0">
                    <div className="text-lg font-heading font-bold text-bb-ink tabular-nums leading-none">{solvedKeys.length}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint mt-1">Solved</div>
                  </div>
                </div>
                <div className="spec-card px-4 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bb-orange/10 border border-bb-orange/40 flex items-center justify-center text-bb-orange text-xs font-bold shrink-0">🔥</div>
                  <div className="min-w-0">
                    <div className="text-lg font-heading font-bold text-bb-ink tabular-nums leading-none">{currentStreak}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint mt-1">Day streak</div>
                  </div>
                </div>
                <div className="spec-card px-4 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bb-ink/[0.06] border border-bb-line-strong flex items-center justify-center text-bb-ink-soft text-xs font-bold shrink-0">Σ</div>
                  <div className="min-w-0">
                    <div className="text-lg font-heading font-bold text-bb-ink tabular-nums leading-none">{total.toLocaleString()}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint mt-1">Matching filters</div>
                  </div>
                </div>
              </div>

              {/* View switcher — Orbit is the circular roadmap slated to replace the list */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="label-caps">Browse</div>
                <div className="flex rounded-full border border-bb-line bg-bb-paper-raised p-0.5 font-mono text-[11px] gap-0.5">
                  {([{ id: 'list' as const, label: 'List' }, { id: 'orbit' as const, label: '◎ Orbit' }]).map(v => (
                    <button key={v.id} onClick={() => { playSound('click'); setViewMode(v.id); }}
                      className={`px-4 h-7 rounded-full font-bold cursor-pointer transition-colors ${viewMode===v.id?'bg-bb-ink text-bb-paper':'text-bb-ink-faint hover:text-bb-ink-soft'}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {viewMode === 'orbit' ? (
                <ProblemOrbit solvedKeys={solvedKeys} onOpen={open} playSound={playSound} />
              ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                {/* LEFT: Problem list */}
                <div className="flex flex-col gap-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bb-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input ref={searchInputRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…"
                        className="w-full h-9 pl-9 pr-9 rounded-lg text-xs font-mono text-bb-ink placeholder-bb-ink-faint focus:outline-none bg-bb-paper-raised border border-bb-line focus:border-bb-line-strong transition-colors" />
                      <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-bb-ink-faint border border-bb-line rounded px-1 py-0.5 pointer-events-none select-none">/</kbd>
                    </div>
                    <div className="flex rounded-full border border-bb-line bg-bb-paper-raised p-0.5 font-mono text-[11px] gap-0.5">
                      {(['','easy','medium','hard'] as const).map(d => (
                        <button key={d} onClick={() => { playSound('click'); setDifficulty(d); }}
                          className={`px-3 h-7 rounded-full font-bold cursor-pointer transition-colors ${difficulty===d?'bg-bb-ink text-bb-paper':'text-bb-ink-faint hover:text-bb-ink-soft'}`}>
                          {d===''?'All':d[0].toUpperCase()+d.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex rounded-full border border-bb-line bg-bb-paper-raised p-0.5 font-mono text-[11px] gap-0.5">
                      {([{id:'all' as const,label:'All'},{id:'unsolved' as const,label:'Todo'},{id:'solved' as const,label:'Done'}]).map(s => (
                        <button key={s.id} onClick={() => { playSound('click'); setStatusFilter(s.id); }}
                          className={`px-3 h-7 rounded-full font-bold cursor-pointer transition-colors ${statusFilter===s.id?'bg-bb-ink text-bb-paper':'text-bb-ink-faint hover:text-bb-ink-soft'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <select value={sortBy} onChange={e => { playSound('click'); setSortBy(e.target.value as typeof sortBy); }}
                      className="h-9 px-3 rounded-full text-[11px] font-mono font-bold text-bb-ink-soft bg-bb-paper-raised border border-bb-line focus:outline-none focus:border-bb-line-strong cursor-pointer">
                      {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>

                  {(selectedTag || activeFilterCount > 0) && (
                    <div className="flex items-center gap-2 flex-wrap -mt-1">
                      {selectedTag && (
                        <button onClick={() => setSelectedTag(null)}
                          className="pill flex items-center gap-1 h-7 px-2.5 border border-bb-line-strong bg-bb-ink/[0.03] text-[10px] font-mono text-bb-ink cursor-pointer hover:bg-bb-ink/[0.06] transition-colors">
                          #{selectedTag} ×
                        </button>
                      )}
                      {activeFilterCount > 0 && (
                        <button onClick={resetFilters}
                          className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint hover:text-bb-orange transition-colors cursor-pointer underline underline-offset-2">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}

                  {/* Column headers */}
                  <div className="grid grid-cols-[32px_1fr_90px_80px] gap-2 items-center px-4 label-caps select-none">
                    <span /><span>Problem</span><span className="text-center">Difficulty</span><span className="text-center">Rating</span>
                  </div>

                  {/* Rows */}
                  <div className="flex flex-col gap-1">
                    {loading
                      ? Array.from({length:8}).map((_,i) => <div key={i} className="h-14 rounded-lg bg-bb-ink/[0.02] border border-bb-line animate-pulse" />)
                      : error
                        ? <div className="py-12 text-center text-xs text-bb-red font-mono border border-dashed border-bb-red/30 rounded-xl">{error}</div>
                        : displayProblems.length === 0
                          ? <div className="py-16 flex flex-col items-center gap-3 text-center text-xs text-bb-ink-faint font-mono border border-dashed border-bb-line rounded-xl">
                              <span>No problems match your filters</span>
                              <button onClick={resetFilters} className="btn-outline h-8 px-3 text-[10px] uppercase tracking-wider cursor-pointer">Reset filters</button>
                            </div>
                          : displayProblems.map((p, i) => {
                              const isSolved = solvedKeys.includes(p.key);
                              const diff = getDiff(p.rating);
                              const dc = diff==='Easy' ? 'text-bb-lime border-bb-lime/40 bg-bb-lime/10' : diff==='Medium' ? 'text-bb-orange border-bb-orange/40 bg-bb-orange/10' : diff==='Hard' ? 'text-bb-red border-bb-red/40 bg-bb-red/10' : 'text-bb-ink-faint border-bb-line bg-bb-ink/[0.03]';
                              const accentBar = diff==='Easy' ? 'bg-bb-lime' : diff==='Medium' ? 'bg-bb-orange' : diff==='Hard' ? 'bg-bb-red' : 'bg-bb-line-strong';
                              return (
                                <motion.div key={p.key} layout
                                  initial={{opacity:0}} animate={{opacity:1}} transition={{delay:Math.min(i,20)*0.012}}
                                  onClick={() => open(p.key)} onMouseEnter={() => playSound('hover')}
                                  className="relative grid grid-cols-[32px_1fr_90px_80px] gap-2 items-center pl-5 pr-4 py-3.5 rounded-lg border cursor-pointer transition-all group border-bb-line bg-bb-paper-raised hover:border-bb-line-strong overflow-hidden">
                                  <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentBar}`} />
                                  <span className="link-chip">↗</span>
                                  <div className="flex justify-center">
                                    {isSolved ? (
                                      <div className="w-4 h-4 rounded-full bg-bb-lime/15 border border-bb-lime flex items-center justify-center text-bb-lime text-[10px] font-mono font-bold select-none">✓</div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-bb-line-strong group-hover:border-bb-orange transition-colors" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-mono text-bb-ink-faint tabular-nums shrink-0">{p.contestId}{p.index}</span>
                                      <span className={`text-sm font-medium truncate transition-colors ${isSolved ? 'text-bb-ink-faint line-through' : 'text-bb-ink group-hover:text-bb-orange'}`}>{p.title ?? p.key}</span>
                                      {p.judgeable && <span className="pill shrink-0 text-[8px] font-mono px-1.5 py-0.5 border border-bb-lime/40 text-bb-lime bg-bb-lime/10">judge</span>}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {p.tags.slice(0,4).map(t => (
                                        <button key={t} onClick={e => { e.stopPropagation(); playSound('click'); setSelectedTag(selectedTag===t?null:t); }}
                                          className={`pill text-[9px] font-mono px-1.5 py-0.5 border cursor-pointer transition-colors ${selectedTag===t?'border-bb-ink-strong bg-bb-ink/10 text-bb-ink':'border-bb-line text-bb-ink-faint hover:text-bb-ink-soft'}`}>
                                          {t}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className={`pill text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${dc}`}>{diff}</span>
                                  </div>
                                  <div className="text-center font-mono text-xs text-bb-ink-faint tabular-nums">{p.rating ?? '—'}</div>
                                </motion.div>
                              );
                            })
                    }
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-bb-ink-faint">
                      <span>Showing {displayProblems.length} of {problems.length} on this page · {total.toLocaleString()} total</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}
                          className="px-2 py-1 rounded border border-bb-line text-bb-ink-faint hover:text-bb-ink disabled:opacity-30 cursor-pointer transition-colors">←</button>
                        <span className="text-bb-ink tabular-nums">{String(page).padStart(2,'0')} / {String(pages).padStart(2,'0')}</span>
                        <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page>=pages}
                          className="px-2 py-1 rounded border border-bb-line text-bb-ink-faint hover:text-bb-ink disabled:opacity-30 cursor-pointer transition-colors">→</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="flex flex-col gap-4">
                  {/* Next Up — a practical, always-relevant starting point */}
                  {nextUp && (
                    <div className="spec-card corner-marks p-5 relative overflow-hidden">
                      <div className="absolute -right-8 top-3 rotate-45 bg-bb-orange text-bb-paper text-[9px] font-mono font-bold uppercase tracking-widest px-8 py-0.5 shadow-sm select-none pointer-events-none">
                        Pick
                      </div>
                      <div className="eyebrow mb-3">Next Up</div>
                      <div className="text-[10px] font-mono text-bb-ink-faint tabular-nums mb-1">{nextUp.contestId}{nextUp.index}</div>
                      <div className="text-base font-heading font-bold text-bb-ink mb-3 leading-snug pr-6">{nextUp.title ?? nextUp.key}</div>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <RatingBadge rating={nextUp.rating} />
                        {nextUp.tags[0] && (
                          <span className="pill text-[9px] font-mono px-1.5 py-0.5 border border-bb-line text-bb-ink-faint">{nextUp.tags[0]}</span>
                        )}
                      </div>
                      <button onClick={() => open(nextUp.key)} onMouseEnter={() => playSound('hover')}
                        className="btn-primary w-full h-9 text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer">
                        Solve →
                      </button>
                    </div>
                  )}

                  {/* Refine — topics + live difficulty spread of current results, one card */}
                  <div className="spec-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="label-caps">Filter by Topic</h4>
                      {selectedTag && (
                        <button onClick={() => setSelectedTag(null)} className="text-[9px] font-mono uppercase tracking-wider text-bb-ink-faint hover:text-bb-orange transition-colors cursor-pointer">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {CF_TAGS.map(t => {
                        const active = selectedTag === t;
                        return (
                          <button key={t} onClick={() => { playSound('click'); setSelectedTag(active ? null : t); }}
                            className={`px-2.5 py-1.5 rounded-md text-[10.5px] font-mono cursor-pointer transition-all border ${active?'bg-bb-ink text-bb-paper border-bb-ink':'text-bb-ink-soft hover:text-bb-ink hover:bg-bb-ink/[0.03] border-bb-line'}`}>
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-dashed border-bb-line">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="label-caps">This View</h4>
                        <span className="text-[10px] font-mono text-bb-ink-faint tabular-nums">{displayProblems.length} shown</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-bb-ink/[0.05] mb-2.5">
                        {(['Easy','Medium','Hard','Unrated'] as const).map(d => {
                          const n = diffBreakdown[d];
                          const pct = displayProblems.length ? (n / displayProblems.length) * 100 : 0;
                          const bg = d==='Easy' ? 'bg-bb-lime' : d==='Medium' ? 'bg-bb-orange' : d==='Hard' ? 'bg-bb-red' : 'bg-bb-line-strong';
                          return pct > 0 ? <div key={d} className={bg} style={{width:`${pct}%`}} /> : null;
                        })}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {(['Easy','Medium','Hard','Unrated'] as const).map(d => (
                          <span key={d} className="flex items-center gap-1.5 text-[10px] font-mono text-bb-ink-soft">
                            <span className={`w-1.5 h-1.5 rounded-full ${d==='Easy'?'bg-bb-lime':d==='Medium'?'bg-bb-orange':d==='Hard'?'bg-bb-red':'bg-bb-line-strong'}`} />
                            {d} <span className="text-bb-ink-faint tabular-nums">{diffBreakdown[d]}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activity heatmap */}
                  <div className="spec-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="label-caps">Activity</h4>
                      <span className="text-[10px] font-mono text-bb-ink-faint">{currentStreak > 0 ? `${currentStreak}d streak` : '22 weeks'}</span>
                    </div>
                    <div className="flex gap-[3px] overflow-hidden justify-center">
                      {Array.from({length:22}, (_,week) => (
                        <div key={week} className="flex flex-col gap-[3px]">
                          {Array.from({length:7}, (_,day) => {
                            const log = heatmapData[week*7+day] || {val:0,date:''};
                            return (
                              <div key={day} className="w-[9px] h-[9px] rounded-[1.5px] cursor-pointer hover:ring-1 hover:ring-bb-ink/30 transition-all relative group/cell"
                                style={{background:PAPER_HEAT[log.val]}}>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 hidden group-hover/cell:block bg-bb-ink text-bb-paper border border-bb-ink text-[8px] p-1.5 rounded shadow-xl text-center pointer-events-none z-50">
                                  {log.date}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[9px] font-mono text-bb-ink-faint">Less</span>
                      <div className="flex gap-1">
                        {PAPER_HEAT.map((c,i) => <div key={i} className="w-2 h-2 rounded-sm" style={{background:c}} />)}
                      </div>
                      <span className="text-[9px] font-mono text-bb-ink-faint">More</span>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};