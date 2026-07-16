import React from "react";
import { motion } from "motion/react";
import { claimedBy, type BlitzSession, type SessionProblem } from "../../lib/blitzSession";
import { problemKey, problemUrl } from "../../lib/codeforces";
import { RatingBadge } from "./RatingBadge";

interface ProblemCardProps {
  session: BlitzSession;
  problem: SessionProblem;
  orderIndex: number;
  onOpen: () => void;
  playSound: (type: "click" | "hover") => void;
}

const LETTERS = "ABCDEFGH";

export const ProblemCard: React.FC<ProblemCardProps> = ({ session, problem, orderIndex, onOpen, playSound }) => {
  const key = problemKey(problem);
  const me = session.handles[0];
  const isDuel = session.mode === "duel";

  const solvedByMe = session.results[me]?.[key] !== undefined;
  const winner = isDuel ? claimedBy(session, key) : solvedByMe ? me : null;
  const solved = winner !== null;

  return (
    <motion.div
      layout
      onClick={() => {
        playSound("click");
        onOpen();
      }}
      onMouseEnter={() => playSound("hover")}
      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors border-l-2 group ${
        solved ? "border-l-[#c3f73a] bg-white/[0.01]" : "border-l-transparent hover:bg-white/[0.01] hover:border-l-white/20"
      }`}
    >
      <span className="text-sm font-mono font-bold text-zinc-500 w-5 shrink-0">{LETTERS[orderIndex] ?? orderIndex + 1}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0 mb-1">
          <span className="text-sm text-zinc-200 font-medium group-hover:text-white transition-colors truncate">
            {problem.name}
          </span>
          <span className="text-[10px] font-mono text-zinc-600 shrink-0">
            {problem.contestId}
            {problem.index}
          </span>
        </div>
        {problem.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/[0.05] bg-white/[0.02] text-zinc-600"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="text-[9px] font-mono text-zinc-700">+{problem.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <RatingBadge rating={problem.rating} className="shrink-0" />

      <a
        href={problemUrl(problem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/[0.08] hover:border-white/[0.16] bg-[#111116] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
      >
        Solve ↗
      </a>

      {solved ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={`shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
            winner === me
              ? "border border-white/50 bg-white/[0.08] text-white"
              : "border border-white/25 bg-white/[0.05] text-zinc-200"
          }`}
        >
          {isDuel ? (session.displayHandles[winner as string] ?? winner) : "Solved"}
        </motion.span>
      ) : (
        <span className="shrink-0 w-2 h-2 rounded-full border border-white/25" />
      )}

      <span className="shrink-0 text-zinc-600 group-hover:text-white transition-colors text-xs">→</span>
    </motion.div>
  );
};
