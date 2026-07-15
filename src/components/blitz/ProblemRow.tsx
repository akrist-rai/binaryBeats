import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { claimedBy, type BlitzSession } from "../../lib/blitzSession";
import { problemKey, problemUrl } from "../../lib/codeforces";
import type { SessionProblem } from "../../lib/blitzAlgorithm";
import { RatingBadge } from "./RatingBadge";
import { CodeWorkspace } from "./CodeWorkspace";

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
  const [expanded, setExpanded] = useState(false);

  const solvedByMe = session.results[me]?.[key] !== undefined;
  const winner = isDuel ? claimedBy(session, key) : solvedByMe ? me : null;
  const solved = winner !== null;

  return (
    <div className={`border-l-2 transition-colors ${solved ? "border-l-[#c3f73a] bg-white/[0.01]" : "border-l-transparent"}`}>
      <motion.div layout className="grid grid-cols-[28px_1fr_74px_190px] items-center gap-3 px-4 py-3">
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
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              expanded
                ? "border-white/40 bg-white/[0.08] text-white"
                : "border-white/[0.08] hover:border-white/[0.16] bg-[#111116] text-zinc-300 hover:text-white"
            }`}
          >
            {expanded ? "Hide" : "Code"}
          </button>

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
              {isDuel ? (session.displayHandles[winner as string] ?? winner) : "Solved"}
            </motion.span>
          ) : (
            <span className="w-2 h-2 rounded-full border border-white/25 shrink-0" />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <CodeWorkspace problemKey={key} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
