import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProblems } from '../hooks/useProblems';
import { useProblemStatement } from '../hooks/useProblemStatement';
import { CodeWorkspace } from './blitz/CodeWorkspace';
import { ProblemStatement } from './blitz/ProblemStatement';
import { RatingBadge } from './blitz/RatingBadge';
import { HeroSection } from './HeroSection';
import { ProblemOrbit } from './ProblemOrbit';
import { logSolve } from '../lib/activityLog';

interface Props {
  xp: number;
  onAddXp: (n: number) => void;
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

export const LeetCodeDashboard = ({ xp, onAddXp, playSound, onShareSolution, onNavigateTab }: Props) => {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<''|'easy'|'medium'|'hard'>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [solvedKeys, setSolvedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'orbit'>('list');

  const { problems, total, pages, loading, error } = useProblems({
    search: search || undefined,
    difficulty: difficulty || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    page, pageSize: 50,
  });

  const { statement } = useProblemStatement(activeKey ?? '');
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
  }, [xp]);

  const open = (key: string) => { playSound('click'); setActiveKey(key); };
  const back = () => { playSound('click'); setActiveKey(null); };

  const nextUp = problems.find(p => !solvedKeys.includes(p.key)) ?? problems[0] ?? null;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] text-bb-ink flex flex-col">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 py-10 flex-1 flex flex-col gap-10">
        <AnimatePresence mode="wait">

          {/* ── WORKSPACE VIEW ── */}
          {activeKey ? (
            <motion.div key="workspace" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-6 border-b border-bb-line">
                <div className="flex items-center gap-4">
                  <button onClick={back} className="btn-outline h-9 px-3.5 cursor-pointer text-xs font-bold font-mono uppercase tracking-wider">
                    ← Problems
                  </button>
                  <div className="flex items-center gap-2 text-xs font-mono text-bb-ink-soft min-w-0">
                    {activeProblem && <><span className="text-bb-ink font-semibold text-sm truncate">{activeProblem.contestId}{activeProblem.index}. {activeProblem.title ?? activeKey}</span><RatingBadge rating={activeProblem.rating} /></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="pill flex items-center gap-1.5 h-8 px-3 border border-bb-lime/40 bg-bb-lime/10 font-mono text-[11px] font-bold uppercase text-bb-lime">
                    <span className="w-1.5 h-1.5 rounded-full bg-bb-lime" /> C++17
                  </div>
                  {activeProblem && (
                    <a href={`https://codeforces.com/contest/${activeProblem.contestId}/problem/${activeProblem.index}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-outline h-8 px-3 text-[10px] font-mono uppercase tracking-wider flex items-center">
                      Open ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0" style={{minHeight:'520px'}}>
                <div className="overflow-y-auto custom-scrollbar spec-card corner-marks">
                  {statement
                    ? <ProblemStatement statement={statement} playSound={playSound} />
                    : <div className="p-6 animate-pulse flex flex-col gap-3">
                        <div className="h-4 w-32 rounded bg-bb-ink/[0.06]" />
                        <div className="h-6 w-2/3 rounded bg-bb-ink/[0.08]" />
                        <div className="h-3 w-full rounded bg-bb-ink/[0.04]" />
                        <div className="h-3 w-5/6 rounded bg-bb-ink/[0.04]" />
                        {!activeProblem?.judgeable && activeKey && <p className="text-xs text-bb-ink-faint mt-4">Statement loading… or open on Codeforces directly.</p>}
                      </div>
                  }
                </div>
                <CodeWorkspace
                  key={activeKey}
                  problemKey={activeKey}
                  judgeable={activeProblem?.judgeable ?? false}
                  examples={statement?.examples ?? []}
                  playSound={playSound}
                  onAccepted={() => {
                    playSound('click');
                    onAddXp(50);
                    if (activeProblem) {
                      logSolve({
                        source: 'leetcode',
                        key: activeKey,
                        title: activeProblem.title ?? activeKey,
                        meta: activeProblem.rating ? String(activeProblem.rating) : 'Unrated',
                        solvedAtSeconds: Math.floor(Date.now() / 1000),
                      });
                    }
                  }}
                />
              </div>
            </motion.div>

          ) : (
            /* ── PROBLEMS LIST ── */
            <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col gap-0">
              <HeroSection xp={xp} total={total} playSound={playSound} onNavigateTab={onNavigateTab} />

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
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…"
                        className="w-full h-9 pl-9 pr-3 rounded-lg text-xs font-mono text-bb-ink placeholder-bb-ink-faint focus:outline-none bg-bb-paper-raised border border-bb-line focus:border-bb-line-strong transition-colors" />
                    </div>
                    <div className="flex rounded-full border border-bb-line bg-bb-paper-raised p-0.5 font-mono text-[11px] gap-0.5">
                      {(['','easy','medium','hard'] as const).map(d => (
                        <button key={d} onClick={() => { playSound('click'); setDifficulty(d); }}
                          className={`px-3 h-7 rounded-full font-bold cursor-pointer transition-colors ${difficulty===d?'bg-bb-ink text-bb-paper':'text-bb-ink-faint hover:text-bb-ink-soft'}`}>
                          {d===''?'All':d[0].toUpperCase()+d.slice(1)}
                        </button>
                      ))}
                    </div>
                    {selectedTag && (
                      <button onClick={() => setSelectedTag(null)}
                        className="pill flex items-center gap-1 h-9 px-3 border border-bb-line-strong bg-bb-ink/[0.03] text-[11px] font-mono text-bb-ink cursor-pointer hover:bg-bb-ink/[0.06] transition-colors">
                        #{selectedTag} ×
                      </button>
                    )}
                  </div>

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
                        : problems.length === 0
                          ? <div className="py-16 text-center text-xs text-bb-ink-faint font-mono border border-dashed border-bb-line rounded-xl">No problems match your filters</div>
                          : problems.map((p, i) => {
                              const isSolved = solvedKeys.includes(p.key);
                              const diff = !p.rating ? 'Unrated' : p.rating<=1300 ? 'Easy' : p.rating<=1900 ? 'Medium' : 'Hard';
                              const dc = diff==='Easy' ? 'text-bb-lime border-bb-lime/40 bg-bb-lime/10' : diff==='Medium' ? 'text-bb-orange border-bb-orange/40 bg-bb-orange/10' : 'text-bb-red border-bb-red/40 bg-bb-red/10';
                              const accentBar = diff==='Easy' ? 'bg-bb-lime' : diff==='Medium' ? 'bg-bb-orange' : diff==='Hard' ? 'bg-bb-red' : 'bg-bb-line-strong';
                              return (
                                <motion.div key={p.key} layout
                                  initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.015}}
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
                      <span>Showing {problems.length} of {total.toLocaleString()}</span>
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
                      <div className="eyebrow mb-3">Next Up</div>
                      <div className="text-[10px] font-mono text-bb-ink-faint tabular-nums mb-1">{nextUp.contestId}{nextUp.index}</div>
                      <div className="text-base font-heading font-bold text-bb-ink mb-3 leading-snug">{nextUp.title ?? nextUp.key}</div>
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

                  {/* Tag filter */}
                  <div className="spec-card p-5">
                    <h4 className="label-caps mb-3">Filter by Topic</h4>
                    <div className="flex flex-col gap-1">
                      {CF_TAGS.map(t => {
                        const active = selectedTag === t;
                        return (
                          <button key={t} onClick={() => { playSound('click'); setSelectedTag(active ? null : t); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-mono cursor-pointer transition-all border ${active?'bg-bb-ink text-bb-paper border-bb-ink':'text-bb-ink-soft hover:text-bb-ink hover:bg-bb-ink/[0.03] border-transparent'}`}>
                            <span>{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity heatmap */}
                  <div className="spec-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="label-caps">Activity</h4>
                      <span className="text-[10px] font-mono text-bb-ink-faint">22 weeks</span>
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

                  {/* Info card */}
                  <div className="spec-card p-5">
                    <h4 className="label-caps mb-3">About</h4>
                    <p className="text-[11px] font-mono text-bb-ink-soft leading-relaxed">
                      Problems sourced from the <span className="text-bb-ink font-bold">open-r1/codeforces</span> dataset (ODC-By 4.0). Problems marked <span className="text-bb-lime font-bold">judge</span> are evaluated locally against the official Codeforces test suite.
                    </p>
                  </div>
                </div>
              </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
