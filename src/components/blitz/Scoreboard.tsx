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
      <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
        <h4 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-4 border-b border-white/[0.08] pb-2">
          Progress
        </h4>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-mono font-black text-white">{solved}</span>
          <span className="text-sm font-mono text-zinc-500">/ {total} solved</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full bg-[#c3f73a]"
            animate={{ width: `${total ? (solved / total) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">XP earned</span>
          <span className="text-sm font-mono font-bold text-[#c3f73a]">+{xpEarned}</span>
        </div>
      </div>
    );
  }

  const rival = session.handles[1];
  const meScore = s[me] ?? 0;
  const rivalScore = s[rival] ?? 0;
  const leading = meScore === rivalScore ? null : meScore > rivalScore ? me : rival;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111116] p-5">
      <h4 className="text-[10px] font-mono tracking-wider uppercase font-medium text-zinc-500 mb-4 border-b border-white/[0.08] pb-2">
        Duel Scoreboard
      </h4>
      <div className="flex flex-col gap-3">
        {[me, rival].map((handle) => (
          <motion.div
            layout
            key={handle}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-colors ${
              leading === handle ? "border-white/40 bg-white/[0.04]" : "border-white/[0.08]"
            }`}
          >
            <span className="text-xs font-mono font-medium text-zinc-300 truncate">
              {handle}
              {handle === me && <span className="text-zinc-600"> (you)</span>}
            </span>
            <span className="text-lg font-mono font-black text-white tabular-nums">{s[handle] ?? 0}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">XP earned</span>
        <span className="text-sm font-mono font-bold text-[#c3f73a]">+{xpEarned}</span>
      </div>
    </div>
  );
};
