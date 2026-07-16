import React from "react";
import { useProblemStatement } from "../../hooks/useProblemStatement";
import { problemUrl } from "../../lib/codeforces";
import { RatingBadge } from "../blitz/RatingBadge";
import { CodeWorkspace } from "./CodeWorkspace";
import { SolveSidebar } from "./SolveSidebar";
import { SplitPane } from "./SplitPane";
import { StatementPane } from "./StatementPane";
import type { SolveWorkspaceProps } from "./types";

const LETTERS = "ABCDEFGH";

/**
 * The single "solve a problem" experience — statement + editor + judge console
 * + the shell around them. Used by both Blitz/Duel sessions (mode="session")
 * and Home practice mode (mode="practice"); the two used to be independent,
 * drifted implementations (ProblemWorkspace.tsx and an inline block in
 * LeetCodeDashboard.tsx).
 */
export const SolveWorkspace: React.FC<SolveWorkspaceProps> = (props) => {
  const { problem, onBack, onAccepted, playSound } = props;
  const { statement, loading: statementLoading, notCovered } = useProblemStatement(problem.key);

  const solved = props.mode === "session" ? props.claim !== null : props.solved;
  // Session mode locks Submit once solved (Blitz problems are claimed once);
  // practice mode allows re-submitting freely.
  const judgeableNow = problem.judgeable && (props.mode === "practice" || !solved);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-bb-line select-none gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => {
              playSound("click");
              onBack();
            }}
            onMouseEnter={() => playSound("hover")}
            className="btn-outline h-9 px-3.5 cursor-pointer text-xs font-bold font-mono uppercase tracking-wider shrink-0"
          >
            ← {props.mode === "session" ? "Session" : "Problems"}
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-bb-ink-faint min-w-0">
            {props.mode === "session" ? (
              <>
                <span className="shrink-0">{LETTERS[props.orderIndex] ?? props.orderIndex + 1}</span>
                <span className="shrink-0">/</span>
              </>
            ) : (
              <span className="shrink-0 tabular-nums">
                {problem.contestId}
                {problem.index}.
              </span>
            )}
            <span className="text-bb-ink font-semibold font-sans text-sm truncate">{problem.title}</span>
            <RatingBadge rating={problem.rating} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {props.mode === "practice" && solved && (
            <div className="pill flex items-center gap-1.5 h-8 px-3 border border-bb-lime/40 bg-bb-lime/10 font-mono text-[11px] font-bold uppercase text-bb-lime">
              ✓ Solved
            </div>
          )}
          <div className="pill flex items-center gap-1.5 h-8 px-3 border border-bb-lime/40 bg-bb-lime/10 font-mono text-[11px] font-bold uppercase tracking-wider text-bb-lime">
            <span className="w-1.5 h-1.5 rounded-full bg-bb-lime" />
            C++17
          </div>
          {props.mode === "session" ? (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-bb-ink-faint">
              <span className={`w-1.5 h-1.5 rounded-full ${props.pollState === "live" ? "bg-bb-blue animate-pulse" : "bg-bb-ink-faint"}`} />
              {props.pollState === "live" ? "watching" : props.pollState === "paused" ? "paused" : "retrying"}
            </div>
          ) : (
            <a
              href={problemUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("click")}
              className="btn-outline h-8 px-3 text-[10px] font-mono uppercase tracking-wider flex items-center"
            >
              Open ↗
            </a>
          )}
        </div>
      </div>

      {/* Body: optional session sidebar + resizable statement|editor split */}
      <div className={`flex-1 grid grid-cols-1 ${props.mode === "session" ? "lg:grid-cols-[280px_1fr]" : ""} gap-8 items-stretch min-h-0`}>
        {props.mode === "session" && (
          <SolveSidebar
            problem={problem}
            items={props.sidebarItems}
            orderIndex={props.orderIndex}
            progress={props.progress}
            claim={props.claim}
            onSelectProblem={props.onSelectProblem}
            playSound={playSound}
          />
        )}

        <SplitPane
          storageKey="bb_solve_split_v1"
          leftLabel="📄 problem.md"
          rightLabel="⌨ solution.cpp"
          left={
            <StatementPane
              problem={problem}
              statement={statement}
              loading={statementLoading}
              notCovered={notCovered}
              mode={props.mode}
              playSound={playSound}
            />
          }
          right={
            <CodeWorkspace
              key={problem.key}
              problemKey={problem.key}
              sessionId={props.mode === "session" ? props.sessionId : undefined}
              judgeable={judgeableNow}
              examples={statement?.examples ?? []}
              playSound={playSound}
              onAccepted={onAccepted}
            />
          }
        />
      </div>
    </div>
  );
};
