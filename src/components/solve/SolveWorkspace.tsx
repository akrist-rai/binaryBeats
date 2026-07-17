import React from "react";
import { useProblemStatement } from "../../hooks/useProblemStatement";
import { problemUrl } from "../../lib/codeforces";
import { RatingBadge } from "../ui/RatingBadge";
import { CodeWorkspace } from "./CodeWorkspace";
import { SolveSidebar } from "./SolveSidebar";
import { SplitPane } from "./SplitPane";
import { StatementPane } from "./StatementPane";
import type { SolveWorkspaceProps } from "./types";

/**
 * The single "solve a problem" experience — statement + editor + judge console
 * + the shell around them. Used by both Blitz/Duel sessions (mode="session")
 * and Home practice mode (mode="practice"). Presented as one contiguous IDE
 * "window" (its own bordered surface, theme-aware like the rest of the app)
 * rather than a stack of separately-carded panels.
 */
export const SolveWorkspace: React.FC<SolveWorkspaceProps> = (props) => {
  const { problem, onBack, onAccepted, playSound } = props;
  const { statement, loading: statementLoading, notCovered } = useProblemStatement(problem.key);

  const solved = props.mode === "session" ? props.claim !== null : props.solved;
  // Session mode locks Submit once solved (Blitz problems are claimed once);
  // practice mode allows re-submitting freely.
  const judgeableNow = problem.judgeable && (props.mode === "practice" || !solved);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 rounded border-[1.5px] border-bb-line bg-bb-ground overflow-hidden bracket-frame"
      style={{ minHeight: 640 }}
    >
      {/* Title bar */}
      <div className="h-11 shrink-0 flex items-center justify-between gap-3 pl-2 pr-3 border-b border-bb-line bg-bb-surface select-none">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => {
              playSound("click");
              onBack();
            }}
            onMouseEnter={() => playSound("hover")}
            title={props.mode === "session" ? "Back to session" : "Back to problems"}
            className="w-7 h-7 shrink-0 rounded flex items-center justify-center text-bb-ink/50 hover:text-bb-ink hover:bg-bb-ink/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5 min-w-0 font-mono text-xs pl-1">
            <span className="text-bb-ink/35 shrink-0">{props.mode === "session" ? "session" : "problems"}</span>
            <span className="text-bb-ink/25 shrink-0">›</span>
            {props.mode === "session" && (
              <>
                <span className="text-bb-ink/50 shrink-0">{props.orderIndex + 1}</span>
                <span className="text-bb-ink/25 shrink-0">›</span>
              </>
            )}
            {props.mode === "practice" && (
              <span className="text-bb-ink/50 shrink-0 tabular-nums">
                {problem.contestId}
                {problem.index}
              </span>
            )}
            <span className="text-bb-ink font-semibold truncate">{problem.title}</span>
            <RatingBadge rating={problem.rating} className="shrink-0" />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {solved && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-bb-yellow">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Solved
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-bb-yellow/70">
            <span className="w-1.5 h-1.5 rounded-full bg-bb-yellow/70" />
            C++17
          </span>
          {props.mode === "session" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-bb-ink/40">
              <span className={`w-1.5 h-1.5 rounded-full ${props.pollState === "live" ? "bg-bb-yellow animate-pulse" : "bg-bb-ink/30"}`} />
              <span className="hidden md:inline">{props.pollState === "live" ? "watching" : props.pollState === "paused" ? "paused" : "retrying"}</span>
            </span>
          ) : null}
          <a
            href={problemUrl(problem)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("click")}
            title="Open on Codeforces"
            className="w-7 h-7 rounded flex items-center justify-center text-bb-ink/40 hover:text-bb-ink hover:bg-bb-ink/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 10.5V18h7.5" />
            </svg>
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {props.mode === "session" && (
          <SolveSidebar
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
          leftLabel="Problem"
          rightLabel="solution.cpp"
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
              testCount={statement?.testCount ?? 0}
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
