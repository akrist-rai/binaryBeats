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

/** Three-stop difficulty ramp in the arena's own palette (lime → blue → red)
 *  instead of the paper register's lime/orange/red — keeps orange reserved
 *  for "your action" (buttons) inside this dark register. */
function tier(rating: number): { label: string; text: string; ring: string; glow: string } {
  if (rating <= 1300) return { label: "Easy", text: "text-bb-term-acc", ring: "border-bb-term-acc/40", glow: "card-glow-lime" };
  if (rating <= 1900) return { label: "Medium", text: "text-bb-term-acc2", ring: "border-bb-term-acc2/40", glow: "card-glow-blue" };
  return { label: "Hard", text: "text-[#ff5c5c]", ring: "border-[#ff5c5c]/40", glow: "card-glow-red" };
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ session, problem, orderIndex, onOpen, playSound }) => {
  const key = problemKey(problem);
  const me = session.handles[0];
  const isDuel = session.mode === "duel";

  const solvedByMe = session.results[me]?.[key] !== undefined;
  const winner = isDuel ? claimedBy(session, key) : solvedByMe ? me : null;
  const solved = winner !== null;
  const mine = winner === me;

  const t = tier(problem.rating);
  const letter = LETTERS[orderIndex] ?? String(orderIndex + 1);

  return (
    <motion.div
      layout
      whileHover={{ x: 3 }}
      onClick={() => {
        playSound("click");
        onOpen();
      }}
      onMouseEnter={() => playSound("hover")}
      className={`group relative flex items-center gap-4 pl-4 pr-5 py-4 cursor-pointer transition-colors border-b border-bb-term-line last:border-b-0 ${
        mine ? "bg-bb-term-acc/[0.05]" : "hover:bg-bb-term-text/[0.03]"
      }`}
    >
      {/* Seed token — bigger, glowing ring in the problem's difficulty color */}
      <div
        className={`relative shrink-0 w-10 h-10 rounded-full border-2 ${t.ring} bg-bb-term-bg flex items-center justify-center font-mono font-black text-sm ${t.text} ${
          mine ? t.glow : ""
        }`}
      >
        {letter}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0 mb-1.5">
          <span className="text-sm text-bb-term-text font-semibold group-hover:text-bb-term-acc transition-colors truncate">
            {problem.name}
          </span>
          <span className="text-[10px] font-mono text-bb-term-text/35 shrink-0 tabular-nums">
            {problem.contestId}
            {problem.index}
          </span>
          <span className={`text-[9px] font-mono uppercase tracking-wider shrink-0 ${t.text}`}>{t.label}</span>
        </div>
        {problem.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-bb-term-line text-bb-term-text/40"
              >
                {tag}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="text-[9px] font-mono text-bb-term-text/35">+{problem.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <RatingBadge rating={problem.rating} className="shrink-0 hidden sm:inline-flex" />

      <a
        href={problemUrl(problem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 hidden md:inline-flex items-center gap-1 h-7 px-3 rounded border border-bb-term-line hover:border-bb-term-text/25 text-bb-term-text/60 hover:text-bb-term-text text-[10px] font-mono uppercase tracking-wider transition-colors"
      >
        Solve ↗
      </a>

      {solved ? (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 22 }}
          className={`shrink-0 inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap border ${
            mine ? "border-bb-term-acc/50 bg-bb-term-acc/10 text-bb-term-acc card-glow-lime" : "border-bb-term-line bg-bb-term-text/[0.04] text-bb-term-text/50"
          }`}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isDuel ? (session.displayHandles[winner as string] ?? winner) : "Solved"}
        </motion.span>
      ) : (
        <span className="shrink-0 w-2 h-2 rounded-full border border-bb-term-line" />
      )}

      <span className="shrink-0 text-bb-term-text/25 group-hover:text-bb-term-acc group-hover:translate-x-0.5 transition-all text-xs">
        →
      </span>
    </motion.div>
  );
};
