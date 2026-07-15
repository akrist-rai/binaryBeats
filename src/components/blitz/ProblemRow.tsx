import React from "react";
import { motion } from "motion/react";
import { claimedBy, type BlitzSession } from "../../lib/blitzSession";
import { problemKey, problemUrl } from "../../lib/codeforces";
import type { SessionProblem } from "../../lib/blitzAlgorithm";
import { RatingBadge } from "./RatingBadge";

interface ProblemRowProps {
  session: BlitzSession;
  problem: SessionProblem;
  orderIndex: number;
}

const LETTERS = "ABCDEFGH";

export const ProblemRow: React.FC<ProblemRowProps> = ({ session, problem, orderIndex }) => {
  const key = problemKey(problem);
  const me = session.handles[0];
  const isDuel = session.mode === "duel";

  const solvedByMe = session.results[me]?.[key] !== undefined;
  const winner = isDuel ? claimedBy(session, key) : solvedByMe ? me : null;
  const solved = winner !== null;

  return (
    <motion.div
      layout
      className={`grid grid-cols-[28px_1fr_74px_150px] items-center gap-3 px-4 py-3 transition-colors border-l-2 ${
        solved ? "border-l-[#c3f73a] bg-white/[0.01]" : "border-l-transparent"
      }`}
    >
      <span className="text-xs font-mono font-bold text-zinc-500">{LETTERS[orderIndex] ?? orderIndex + 1}</span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm text-zinc-200 font-medium truncate">{problem.name}</span>
        <span className="text-[10px] font-mono text-zinc-600">
          {problem.contestId}
          {problem.index}
        </span>
      </div>

      <RatingBadge rating={problem.rating} />

      <div className="flex items-center justify-end gap-2">
        <a
          href={problemUrl(problem)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] hover:border-white/[0.16] bg-[#111116] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
        >
          Solve ↗
        </a>

        {solved ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
              winner === me
                ? "border border-white/50 bg-white/[0.08] text-white"
                : "border border-white/25 bg-white/[0.05] text-zinc-200"
            }`}
          >
            {isDuel ? winner : "Solved"}
          </motion.span>
        ) : (
          <span className="w-2 h-2 rounded-full border border-white/25 shrink-0" />
        )}
      </div>
    </motion.div>
  );
};
