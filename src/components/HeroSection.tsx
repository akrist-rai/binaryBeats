import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useCfHandle } from '../hooks/useCfHandle';
import { fetchRatingHistory, type CfRatingChange } from '../lib/codeforces';
import { computeStreak, getWeekActivity, getRecent, countBySource } from '../lib/activityLog';
import { RatingBadge } from './blitz/RatingBadge';

interface HeroSectionProps {
  xp: number;
  total: number;
  playSound: (t: 'click' | 'hover') => void;
  onNavigateTab: (tab: string) => void;
}

export const HeroSection = ({ xp, total, playSound, onNavigateTab }: HeroSectionProps) => {
  const { handle: cfHandle, user: cfUser } = useCfHandle();
  const [ratingHistory, setRatingHistory] = useState<CfRatingChange[]>([]);
  const [countdown, setCountdown] = useState('');
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

  useEffect(() => {
    const tick = () => {
      const d = new Date(); d.setHours(24, 0, 0, 0);
      const ms = Math.max(0, d.getTime() - Date.now());
      setCountdown(`${String(Math.floor(ms/3.6e6)).padStart(2,'0')}:${String(Math.floor((ms%3.6e6)/6e4)).padStart(2,'0')}:${String(Math.floor((ms%6e4)/1e3)).padStart(2,'0')}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  return (
    <motion.div className="border-b border-bb-line pb-9 mb-9"
      initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

      <motion.div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7"
        variants={{ hidden: { opacity:0, y:-14 }, visible: { opacity:1, y:0, transition:{ duration:0.5 } } }}>
        <div className="relative">
          <span aria-hidden className="pointer-events-none select-none absolute -top-10 -left-1 -z-10 text-[150px] font-heading font-black text-bb-ink/[0.045] leading-none">01</span>
          <span className="eyebrow mb-3">/01 <span className="text-bb-ink-faint normal-case">·</span> Problem Set</span>
          <h1 className="text-4xl md:text-[48px] font-heading font-extrabold tracking-tight leading-[1.05] text-bb-ink mt-2">
            Problems
          </h1>
          <p className="text-sm text-bb-ink-soft mt-2.5 font-mono">Real CF problems · local C++17 judge · open-r1/codeforces dataset</p>
        </div>
        <div className="w-full lg:w-[380px] spec-card corner-marks chamfer-tr overflow-hidden shrink-0">
          {cfHandle
            ? <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-bb-ink text-bb-term-acc flex items-center justify-center text-xs font-bold font-mono shrink-0">
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
                  <div className="text-sm font-bold text-bb-ink group-hover:text-bb-orange transition-colors">Link Codeforces</div>
                  <div className="text-[10px] font-mono text-bb-ink-faint mt-0.5">See your real rating here</div>
                </div>
                <span className="text-bb-ink-faint group-hover:text-bb-orange transition-colors">→</span>
              </button>
          }
        </div>
      </motion.div>

      <motion.div className="flex items-center justify-between mb-7 pt-5 dashed-rule"
        variants={{ hidden:{opacity:0}, visible:{opacity:1} }}>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-bb-ink-faint uppercase tracking-wider">Total XP</span><span className="text-bb-orange font-bold">{xp}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-bb-ink-faint uppercase tracking-wider">Daily reset in</span>
          <span className="text-bb-ink font-bold tabular-nums">{countdown}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_220px_1px_220px] gap-0">
        {/* CF Rating */}
        <motion.div className="pr-8" variants={{ hidden:{opacity:0,x:-28}, visible:{opacity:1,x:0,transition:{duration:0.55}} }}>
          {cfHandle && cfUser ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-bb-ink text-bb-term-acc flex items-center justify-center text-sm font-bold font-mono">
                  {cfHandle[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-bb-ink">{cfHandle}</div>
                  <div className="text-[10px] font-mono text-bb-ink-faint">{cfUser.rank ?? 'Unrated'}</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-end gap-2 mb-1">
                  <motion.span className="text-5xl stat-num text-bb-ink leading-none"
                    initial={{opacity:0,scale:0.75}} animate={{opacity:1,scale:1}} transition={{delay:0.2,type:'spring'}}>
                    {cfUser.rating ?? '—'}
                  </motion.span>
                  {ratingDelta !== null && (
                    <span className={`text-sm font-mono mb-1.5 font-bold ${ratingDelta>=0?'text-bb-lime':'text-bb-red'}`}>
                      {ratingDelta>=0?'▲':'▼'} {Math.abs(ratingDelta)}
                    </span>
                  )}
                </div>
                <div className="label-caps">Codeforces Rating</div>
              </div>
              {sparkBars.length > 1 && (
                <div className="flex items-end gap-[3px] h-8">
                  {sparkBars.map((h,i) => (
                    <motion.div key={i} className="flex-1 rounded-sm"
                      style={{height:`${h}%`,background:i===sparkBars.length-1?'#E15A20':`rgba(225,90,32,${0.15+i*0.05})`,originY:1}}
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
              <button onClick={() => { playSound('click'); onNavigateTab('blitz'); }}
                className="btn-outline px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer">
                Link Codeforces →
              </button>
            </div>
          )}
        </motion.div>

        <div className="hidden md:block bg-bb-line" />

        {/* Dataset stats */}
        <motion.div className="px-8 pt-6 md:pt-0" variants={{ hidden:{opacity:0,y:24}, visible:{opacity:1,y:0} }}>
          <div className="label-caps mb-4">Dataset</div>
          <motion.div className="text-2xl stat-num text-bb-ink" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            {total.toLocaleString()}
          </motion.div>
          <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5 mb-4">problems available</div>
          <div className="pt-4 border-t border-bb-line flex items-center justify-between">
            <div>
              <div className="text-2xl stat-num text-bb-blue">{cfSolvedCount}</div>
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5">CF solved</div>
            </div>
            <div className="text-right">
              <div className="text-2xl stat-num text-bb-orange">{xp}</div>
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider mt-0.5">total XP</div>
            </div>
          </div>
        </motion.div>

        <div className="hidden md:block bg-bb-line" />

        {/* Streak */}
        <motion.div className="px-8 pt-6 md:pt-0" variants={{ hidden:{opacity:0,x:28}, visible:{opacity:1,x:0,transition:{duration:0.55}} }}>
          <div className="label-caps mb-4">Current Streak</div>
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="text-4xl stat-num text-bb-ink leading-none"
              initial={{scale:0.4,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3,type:'spring'}}>
              {streak}
            </motion.div>
            <div>
              <div className="text-base">{streak>0?'🔥':'💤'}</div>
              <div className="text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider">days</div>
            </div>
          </div>
          <div className="flex gap-1 mb-4">
            {weekActivity.map((d,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-sm ${d.solved?'bg-bb-lime':'bg-bb-ink/[0.07]'}`} />
                <span className="text-[8px] font-mono text-bb-ink-faint">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="label-caps mb-2">Recent</div>
          {recentActivity.length === 0
            ? <div className="text-[10px] font-mono text-bb-ink-faint">No solves logged yet.</div>
            : recentActivity.map((r,i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-bb-line last:border-0">
                  <span className="text-[11px] font-mono text-bb-ink-soft truncate max-w-[100px]">{r.title}</span>
                  <span className={`text-[9px] font-mono font-bold ${r.source==='codeforces'?'text-bb-blue':'text-bb-orange'}`}>
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
