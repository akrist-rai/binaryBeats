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

  // Difficulty-colored accent bar — same rating-tier convention as the
  // LeetCodeDashboard problem list, for visual consistency between the app's
  // two problem-list surfaces.
  const diffLevel = problem.rating <= 1300 ? "Easy" : problem.rating <= 1900 ? "Medium" : "Hard";
  const accentBar = diffLevel === "Easy" ? "bg-bb-lime" : diffLevel === "Medium" ? "bg-bb-orange" : "bg-bb-red";

  return (
    <motion.div
      layout
      onClick={() => {
        playSound("click");
        onOpen();
      }}
      onMouseEnter={() => playSound("hover")}
      className={`relative flex items-center gap-4 pl-6 pr-5 py-4 cursor-pointer transition-colors group ${
        solved ? (winner === me ? "bg-bb-lime/[0.04]" : "bg-bb-ink/[0.02]") : "hover:bg-bb-ink/[0.02]"
      }`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentBar}`} />
      <span className="link-chip">↗</span>
      <span className="text-sm font-mono font-bold text-bb-ink-faint w-5 shrink-0">{LETTERS[orderIndex] ?? orderIndex + 1}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0 mb-1">
          <span className="text-sm text-bb-ink font-medium group-hover:text-bb-orange transition-colors truncate">
            {problem.name}
          </span>
          <span className="text-[10px] font-mono text-bb-ink-faint shrink-0">
            {problem.contestId}
            {problem.index}
          </span>
        </div>
        {problem.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="pill text-[9px] font-mono px-1.5 py-0.5 border border-bb-line bg-bb-paper text-bb-ink-faint"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="text-[9px] font-mono text-bb-ink-faint">+{problem.tags.length - 4}</span>
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
        className="btn-outline shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider"
      >
        Solve ↗
      </a>

      {solved ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={`pill shrink-0 inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap border ${
            winner === me
              ? "border-bb-lime/50 bg-bb-lime/10 text-bb-lime"
              : "border-bb-line-strong bg-bb-ink/[0.04] text-bb-ink-soft"
          }`}
        >
          {isDuel ? (session.displayHandles[winner as string] ?? winner) : "Solved"}
        </motion.span>
      ) : (
        <span className="shrink-0 w-2 h-2 rounded-full border border-bb-line-strong" />
      )}

      <span className="shrink-0 text-bb-ink-faint group-hover:text-bb-orange transition-colors text-xs">→</span>
    </motion.div>
  );
};
