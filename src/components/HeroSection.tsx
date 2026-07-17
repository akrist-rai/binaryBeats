import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useCfHandle } from '../hooks/useCfHandle';
import { fetchRatingHistory, type CfRatingChange } from '../lib/codeforces';
import { computeStreak, getWeekActivity, getRecent, countBySource } from '../lib/activityLog';
import { RatingBadge } from './ui/RatingBadge';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';
import { StatNumeral } from './ui/StatNumeral';
import { Button } from './ui/Button';
import { Divider } from './ui/Divider';

interface HeroSectionProps {
  total: number;
  playSound: (t: 'click' | 'hover') => void;
  onNavigateTab: (tab: string) => void;
}

export const HeroSection = ({ total, playSound, onNavigateTab }: HeroSectionProps) => {
  const { handle: cfHandle, user: cfUser } = useCfHandle();
  const [ratingHistory, setRatingHistory] = useState<CfRatingChange[]>([]);
  const [streak] = useState(() => computeStreak());
  const [weekActivity] = useState(() => getWeekActivity());
  const [recentActivity] = useState(() => getRecent(4));
  const [cfSolvedCount] = useState(() => countBySource('codeforces'));

  useEffect(() => {
    if (!cfHandle) { setRatingHistory([]); return; }
    let cancelled = false;
    fetchRatingHistory(cfHandle).then(h => { if (!cancelled) setRatingHistory(h); }).catch(() => {});
    return () => { cancelled = true; };
  }, [cfHandle]);

  const sparkBars = useMemo(() => {
    if (!ratingHistory.length) return [];
    const recent = ratingHistory.slice(-12);
    const ratings = recent.map(r => r.newRating);
    const min = Math.min(...ratings); const max = Math.max(...ratings);
    return ratings.map(r => 15 + ((r - min) / (max - min || 1)) * 85);
  }, [ratingHistory]);

  const ratingDelta = useMemo(() => {
    if (!ratingHistory.length) return null;
    const last = ratingHistory[ratingHistory.length - 1];
    return last.newRating - last.oldRating;
  }, [ratingHistory]);


  return (
    <motion.div className="border-b border-bb-line pb-9 mb-9"
      initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

      <motion.div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7"
        variants={{ hidden: { opacity:0, y:-14 }, visible: { opacity:1, y:0, transition:{ duration:0.5 } } }}>
        <div className="relative">
          <span aria-hidden className="pointer-events-none select-none absolute -top-10 -left-1 -z-10 text-[150px] font-display font-black text-bb-ink/[0.045] leading-none">01</span>
          <Eyebrow number="01" className="mb-3">Problem Set</Eyebrow>
          <h1 className="text-4xl md:text-[48px] font-display font-extrabold tracking-tight leading-[1.05] text-bb-ink mt-2">
            Problems
          </h1>
          <p className="text-sm text-bb-ink-soft mt-2.5 font-mono">Real CF problems · local C++17 judge · open-r1/codeforces dataset</p>
        </div>
        <Panel bracket className="w-full lg:w-[380px] overflow-hidden shrink-0 text-bb-line-strong">
          {cfHandle
            ? <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-bb-ink text-bb-ground flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {cfHandle[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-bb-ink truncate">{cfHandle}</div>
                    <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider truncate">{cfUser?.rank ?? 'Codeforces'}</div>
                  </div>
                </div>
                <RatingBadge rating={cfUser?.rating ?? null} />
              </div>
            : <button onClick={() => { playSound('click'); onNavigateTab('blitz'); }}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer group">
                <div>
                  <div className="text-sm font-bold text-bb-ink group-hover:text-bb-yellow transition-colors">Link Codeforces</div>
                  <div className="text-[10px] font-mono text-bb-ink-faint mt-0.5">See your real rating here</div>
                </div>
                <span className="text-bb-ink-faint group-hover:text-bb-yellow transition-colors">→</span>
              </button>
          }
        </Panel>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_220px_1px_220px] gap-0">
        {/* CF Rating */}
        <motion.div className="pr-8" variants={{ hidden:{opacity:0,x:-28}, visible:{opacity:1,x:0,transition:{duration:0.55}} }}>
          {cfHandle && cfUser ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-bb-ink text-bb-ground flex items-center justify-center text-sm font-bold font-mono">
                  {cfHandle[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-bb-ink">{cfHandle}</div>
                  <div className="text-[10px] font-mono text-bb-ink-faint">{cfUser.rank ?? 'Unrated'}</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-end gap-2 mb-1">
                  <motion.span className="text-bb-ink leading-none"
                    initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}} transition={{delay:0.2,type:'spring'}}>
                    {cfUser.rating != null ? <StatNumeral value={cfUser.rating} size="xl" countUp /> : '—'}
                  </motion.span>
                  {ratingDelta !== null && (
                    <span className={`text-sm font-mono mb-1.5 font-bold ${ratingDelta>=0?'text-bb-success':'text-bb-danger'}`}>
                      {ratingDelta>=0?'▲':'▼'} {Math.abs(ratingDelta)}
                    </span>
                  )}
                </div>
                <Eyebrow tone="muted">Codeforces Rating</Eyebrow>
              </div>
              {sparkBars.length > 1 && (
                <div className="flex items-end gap-[3px] h-8">
                  {sparkBars.map((h,i) => (
                    <motion.div key={i} className="flex-1 rounded-sm"
                      style={{height:`${h}%`,background:i===sparkBars.length-1?'var(--bb-yellow)':`rgba(255,212,0,${0.15+i*0.05})`,originY:1}}
                      initial={{scaleY:0}} animate={{scaleY:1}} transition={{delay:0.3+i*0.04,duration:0.4}} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start justify-center h-full min-h-[160px]">
              <p className="text-sm text-bb-ink-soft mb-3 max-w-[220px] leading-relaxed">
                Link your Codeforces handle to see your real rating and trend here.
              </p>
              <Button variant="outline" size="sm" onClick={() => { playSound('click'); onNavigateTab('blitz'); }}>
                Link Codeforces →
              </Button>
            </div>
          )}
        </motion.div>

        <Divider orientation="vertical" className="hidden md:block" />

        {/* Dataset stats */}
        <motion.div className="px-8 pt-6 md:pt-0" variants={{ hidden:{opacity:0,y:24}, visible:{opacity:1,y:0} }}>
          <Eyebrow tone="muted" className="mb-4">Dataset</Eyebrow>
          <motion.div className="text-bb-ink" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            <StatNumeral value={total} size="md" />
          </motion.div>
          <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5 mb-4">problems available</div>
          <div className="pt-4 border-t border-bb-line flex items-center justify-between">
            <div>
              <StatNumeral value={cfSolvedCount} size="md" className="text-bb-rival" />
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5">CF solved</div>
            </div>
            <div className="text-right">
              {cfUser?.maxRating != null
                ? <StatNumeral value={cfUser.maxRating} size="md" className="text-bb-yellow" />
                : <span className="stat-num text-2xl text-bb-yellow">—</span>}
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5">max rating</div>
            </div>
          </div>
        </motion.div>

        <Divider orientation="vertical" className="hidden md:block" />

        {/* Streak */}
        <motion.div className="px-8 pt-6 md:pt-0" variants={{ hidden:{opacity:0,x:28}, visible:{opacity:1,x:0,transition:{duration:0.55}} }}>
          <Eyebrow tone="muted" className="mb-4">Current Streak</Eyebrow>
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="text-bb-ink leading-none"
              initial={{scale:0.4,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3,type:'spring'}}>
              <StatNumeral value={streak} size="lg" />
            </motion.div>
            <div>
              <div className="text-base">{streak>0?'🔥':'💤'}</div>
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider">days</div>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {weekActivity.map((d,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-sm ${d.solved?'bg-bb-success':'bg-bb-ink/[0.07]'}`} />
                <span className="text-[8px] font-mono text-bb-ink-faint">{d.label}</span>
              </div>
            ))}
          </div>
          <Eyebrow tone="muted" className="mb-2">Recent</Eyebrow>
          {recentActivity.length === 0
            ? <div className="text-[10px] font-mono text-bb-ink-faint">No solves logged yet.</div>
            : recentActivity.map((r,i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-bb-line last:border-0">
                  <span className="text-[11px] font-mono text-bb-ink-soft truncate max-w-[100px]">{r.title}</span>
                  <span className={`text-[9px] font-mono font-bold ${r.source==='codeforces'?'text-bb-rival':'text-bb-yellow'}`}>
                    CF · {r.meta}
                  </span>
                </div>
              ))
          }
        </motion.div>
      </div>
    </motion.div>
  );
};
