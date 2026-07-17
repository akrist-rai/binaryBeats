import React from "react";
import { motion } from "motion/react";
import { claimedBy, type BlitzSession, type SessionProblem } from "../../lib/blitzSession";
import { problemKey, problemUrl } from "../../lib/codeforces";
import { RatingBadge, difficultyLabel, colorForRating } from "../ui/RatingBadge";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";

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
  const mine = winner === me;

  // Difficulty color/label come from the shared rating scale (colorForRating),
  // not a separate lime/blue/red ramp — that would collide with real
  // status/rival colors (e.g. a "Medium" problem in the same blue used for a
  // rival's identity, or a "Hard" problem in the same red as a WA verdict).
  const color = colorForRating(problem.rating);
  const label = difficultyLabel(problem.rating);
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
      className={`group relative flex items-center gap-4 pl-4 pr-5 py-4 cursor-pointer transition-colors border-b border-bb-line last:border-b-0 ${
        mine ? "bg-bb-yellow/[0.05]" : "hover:bg-bb-ink/[0.03]"
      }`}
    >
      {/* Seed token — ring/label colored by the problem's own rating color. */}
      <div
        className="relative shrink-0 w-10 h-10 rounded-full border-2 bg-bb-ground flex items-center justify-center font-mono font-black text-sm"
        style={{ borderColor: color, color }}
      >
        {letter}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0 mb-1.5">
          <span className="text-sm text-bb-ink font-semibold group-hover:text-bb-yellow transition-colors truncate">
            {problem.name}
          </span>
          <span className="text-[10px] font-mono text-bb-ink/35 shrink-0 tabular-nums">
            {problem.contestId}
            {problem.index}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider shrink-0" style={{ color }}>
            {label}
          </span>
        </div>
        {problem.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {problem.tags.slice(0, 4).map((tag) => (
              <Tag key={tag} tone="neutral">
                {tag}
              </Tag>
            ))}
            {problem.tags.length > 4 && (
              <span className="text-[9px] font-mono text-bb-ink/35">+{problem.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <RatingBadge rating={problem.rating} className="shrink-0 hidden sm:inline-flex" />

      <Button
        as="a"
        href={problemUrl(problem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        variant="outline"
        size="sm"
        className="shrink-0 hidden md:inline-flex"
      >
        Solve ↗
      </Button>

      {solved ? (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 22 }}
          className="shrink-0"
        >
          <Tag tone={mine ? "accent" : "neutral"}>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {isDuel ? (session.displayHandles[winner as string] ?? winner) : "Solved"}
          </Tag>
        </motion.span>
      ) : (
        <span className="shrink-0 w-2 h-2 rounded-full border border-bb-line" />
      )}

      <span className="shrink-0 text-bb-ink/25 group-hover:text-bb-yellow group-hover:translate-x-0.5 transition-all text-xs">
        →
      </span>
    </motion.div>
  );
};
