import React from "react";
import { problemUrl } from "../../lib/codeforces";
import type { ProblemStatementData } from "../../lib/problemsApi";
import { RatingBadge } from "../blitz/RatingBadge";
import { ProblemStatement } from "./ProblemStatement";
import type { SolvableProblem } from "./types";

interface StatementPaneProps {
  problem: SolvableProblem;
  statement: ProblemStatementData | null;
  loading: boolean;
  notCovered: boolean;
  /** Session mode has a server-side poller auto-detecting CF verdicts; practice mode doesn't. */
  mode: "session" | "practice";
  playSound: (type: "click" | "hover") => void;
}

const StatementSkeleton: React.FC = () => (
  <div className="flex-1 min-h-0 overflow-hidden bg-bb-term-surface p-5">
    <div className="animate-pulse flex flex-col gap-3">
      <div className="h-3 w-20 rounded bg-bb-term-text/10" />
      <div className="h-6 w-2/3 rounded bg-bb-term-text/10" />
      <div className="h-3 w-full rounded bg-bb-term-text/[0.06]" />
      <div className="h-3 w-full rounded bg-bb-term-text/[0.06]" />
      <div className="h-3 w-5/6 rounded bg-bb-term-text/[0.06]" />
      <div className="h-28 w-full rounded bg-bb-term-text/[0.04] mt-3" />
    </div>
  </div>
);

export const StatementPane: React.FC<StatementPaneProps> = ({ problem, statement, loading, notCovered, mode, playSound }) => {
  if (statement) return <ProblemStatement statement={statement} playSound={playSound} />;
  if (loading) return <StatementSkeleton />;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar-dark bg-bb-term-surface p-5">
      <div className="mb-4 pb-4 border-b border-bb-term-line">
        <span className="eyebrow-term mb-1.5">
          /01 <span className="text-bb-term-text/25 normal-case">·</span> Problem
        </span>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-bb-term-text/35 tabular-nums">
              {problem.contestId}
              {problem.index}
            </span>
            <h3 className="text-lg font-heading font-bold text-bb-term-text mt-1">{problem.title}</h3>
          </div>
          <RatingBadge rating={problem.rating} className="shrink-0" />
        </div>
      </div>

      {problem.tags.length > 0 && (
        <div className="mb-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-bb-term-text/35 block mb-1.5">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-bb-term-line text-bb-term-text/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded border border-bb-term-line bg-bb-term-bg/40 p-4 mb-5">
        <p className="text-xs text-bb-term-text/60 leading-relaxed">
          {mode === "session"
            ? notCovered
              ? "This problem isn't in the local statement dataset (it covers problems up to ~2025), so the full statement lives on Codeforces. Solve it there — we detect your accepted verdict automatically within ~15s."
              : "The statement couldn't be loaded right now — the full problem is always available on Codeforces. Solve it there and we'll detect your accepted verdict automatically within ~15s."
            : notCovered
              ? "This problem isn't in the local statement dataset (it covers problems up to ~2025), so the full statement lives on Codeforces. Read it there, then come back and submit your solution here."
              : "The statement couldn't be loaded right now — the full problem is always available on Codeforces. Read it there, then come back and submit your solution here."}
        </p>
      </div>

      <a
        href={problemUrl(problem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => playSound("click")}
        className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded bg-bb-term-acc text-bb-term-bg hover:brightness-110 font-bold font-mono text-[11px] uppercase tracking-wider transition-all"
      >
        Open on Codeforces ↗
      </a>
    </div>
  );
};
