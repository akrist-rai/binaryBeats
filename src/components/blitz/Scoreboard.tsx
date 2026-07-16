import React from "react";
import { motion } from "motion/react";
import { scores, type BlitzSession } from "../../lib/blitzSession";

interface ScoreboardProps {
  session: BlitzSession;
  xpEarned: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ session, xpEarned }) => {
  const s = scores(session);
  const me = session.handles[0];
  const total = session.problems.length;

  if (session.mode === "blitz") {
    const solved = s[me] ?? 0;
    return (
      <div className="spec-card p-5">
        <h4 className="label-caps mb-4 border-b border-bb-line pb-2">
          Progress
        </h4>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="stat-num text-2xl text-bb-ink">{String(solved).padStart(2, '0')}</span>
          <span className="text-sm font-mono text-bb-ink-faint">/ {String(total).padStart(2, '0')} solved</span>
        </div>
        <div className="h-1.5 rounded-full bg-bb-ink/[0.08] overflow-hidden">
          <motion.div
            className="h-full bg-bb-lime"
            animate={{ width: `${total ? (solved / total) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-bb-line flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint">XP earned</span>
          <span className="text-sm font-mono font-bold text-bb-lime">+{xpEarned}</span>
        </div>
      </div>
    );
  }

  const rival = session.handles[1];
  const meScore = s[me] ?? 0;
  const rivalScore = s[rival] ?? 0;
  const leading = meScore === rivalScore ? null : meScore > rivalScore ? me : rival;

  return (
    <div className="spec-card p-5">
      <h4 className="label-caps mb-4 border-b border-bb-line pb-2">
        Duel Scoreboard
      </h4>
      <div className="flex flex-col gap-3">
        {[me, rival].map((handle) => (
          <motion.div
            layout
            key={handle}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-colors ${
              leading === handle ? "border-bb-orange bg-bb-orange/[0.05]" : "border-bb-line"
            }`}
          >
            <span className="text-xs font-mono font-medium text-bb-ink truncate">
              {session.displayHandles[handle] ?? handle}
              {handle === me && <span className="text-bb-ink-faint"> (you)</span>}
            </span>
            <span className="stat-num text-lg text-bb-ink tabular-nums">{s[handle] ?? 0}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-bb-line flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint">XP earned</span>
        <span className="text-sm font-mono font-bold text-bb-lime">+{xpEarned}</span>
      </div>
    </div>
  );
};
