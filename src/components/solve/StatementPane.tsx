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
  <div className="flex-1 min-h-[460px] spec-card p-6">
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-4 w-24 rounded bg-bb-ink/[0.06]" />
      <div className="h-8 w-2/3 rounded bg-bb-ink/[0.08]" />
      <div className="h-3 w-full rounded bg-bb-ink/[0.04]" />
      <div className="h-3 w-full rounded bg-bb-ink/[0.04]" />
      <div className="h-3 w-5/6 rounded bg-bb-ink/[0.04]" />
      <div className="h-32 w-full rounded-lg bg-bb-ink/[0.03] mt-4" />
    </div>
  </div>
);

export const StatementPane: React.FC<StatementPaneProps> = ({ problem, statement, loading, notCovered, mode, playSound }) => {
  if (statement) return <ProblemStatement statement={statement} playSound={playSound} />;
  if (loading) return <StatementSkeleton />;

  return (
    <div className="flex-1 min-h-[460px] spec-card corner-marks p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5 pb-5 border-b border-bb-line">
        <div>
          <span className="label-caps">
            {problem.contestId}
            {problem.index}
          </span>
          <h3 className="text-2xl font-heading font-extrabold text-bb-ink mt-1">{problem.title}</h3>
        </div>
        <RatingBadge rating={problem.rating} />
      </div>

      {problem.tags.length > 0 && (
        <div className="mb-6">
          <span className="label-caps block mb-2">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span key={tag} className="pill text-[10px] font-mono px-2 py-1 border border-bb-line bg-bb-paper text-bb-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-bb-line bg-bb-paper p-5 mb-6">
        <p className="text-sm text-bb-ink-soft leading-relaxed">
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
        className="btn-primary inline-flex items-center justify-center gap-2 h-12 font-bold font-mono text-xs uppercase tracking-wider px-8"
      >
        Open Full Problem on Codeforces ↗
      </a>
    </div>
  );
};
