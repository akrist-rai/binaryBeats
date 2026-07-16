import React, { useEffect, useState } from "react";
import { claimedBy, type BlitzSession, type SessionProblem } from "../../lib/blitzSession";
import { problemKey, problemUrl } from "../../lib/codeforces";
import type { PollState } from "../../hooks/useSessionPolling";
import { useProblemStatement } from "../../hooks/useProblemStatement";
import { RatingBadge } from "./RatingBadge";
import { CodeWorkspace } from "./CodeWorkspace";
import { ProblemStatement } from "./ProblemStatement";

interface ProblemWorkspaceProps {
  session: BlitzSession;
  problem: SessionProblem;
  orderIndex: number;
  pollState: PollState;
  playSound: (type: "click" | "hover") => void;
  onBack: () => void;
  onSelectProblem: (index: number) => void;
  /** Called after an in-app AC is recorded — refreshes the session immediately. */
  onAccepted: () => void;
}

const LETTERS = "ABCDEFGH";

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  session,
  problem,
  orderIndex,
  pollState,
  playSound,
  onBack,
  onSelectProblem,
  onAccepted,
}) => {
  const me = session.handles[0];
  const isDuel = session.mode === "duel";
  const key = problemKey(problem);
  const solvedByMe = session.results[me]?.[key] !== undefined;
  const winner = isDuel ? claimedBy(session, key) : solvedByMe ? me : null;
  const solved = winner !== null;

  const [workspaceTab, setWorkspaceTab] = useState<"problem" | "code">("problem");
  useEffect(() => {
    setWorkspaceTab("problem");
  }, [key]);

  const { statement, loading: statementLoading, notCovered } = useProblemStatement(key);

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
            ← Session
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-bb-ink-faint min-w-0">
            <span className="shrink-0">{LETTERS[orderIndex] ?? orderIndex + 1}</span>
            <span className="shrink-0">/</span>
            <span className="text-bb-ink font-semibold font-sans text-sm truncate">{problem.name}</span>
            <RatingBadge rating={problem.rating} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="pill flex items-center gap-1.5 h-8 px-3 border border-bb-lime/40 bg-bb-lime/10 font-mono text-[11px] font-bold uppercase tracking-wider text-bb-lime">
            <span className="w-1.5 h-1.5 rounded-full bg-bb-lime" />
            C++17
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-bb-ink-faint">
            <span
              className={`w-1.5 h-1.5 rounded-full ${pollState === "live" ? "bg-bb-blue animate-pulse" : "bg-bb-ink-faint"}`}
            />
            {pollState === "live" ? "watching" : pollState === "paused" ? "paused" : "retrying"}
          </div>
        </div>
      </div>

      {/* Layout: left problem info + nav, right editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-stretch">
        {/* Left pane */}
        <div className="flex flex-col gap-6 spec-card p-5">
          <div className="flex items-center justify-between gap-2">
            <RatingBadge rating={problem.rating} />
            <a
              href={problemUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("click")}
              className="btn-outline inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider"
            >
              Open ↗
            </a>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="label-caps">Session Progress</span>
              <span className="text-[10px] font-mono text-bb-ink-faint tabular-nums">
                {
                  session.problems.filter((p) => {
                    const pKey = problemKey(p);
                    return (isDuel ? claimedBy(session, pKey) : session.results[me]?.[pKey] !== undefined ? me : null) !== null;
                  }).length
                }
                /{session.problems.length}
              </span>
            </div>
            <div className="flex gap-1 mb-5">
              {session.problems.map((p) => {
                const pKey = problemKey(p);
                const pWinner = isDuel ? claimedBy(session, pKey) : session.results[me]?.[pKey] !== undefined ? me : null;
                return (
                  <span
                    key={pKey}
                    className={`flex-1 h-1.5 rounded-full ${
                      pWinner === me ? "bg-bb-lime" : pWinner ? "bg-bb-ink-soft" : "bg-bb-ink/[0.08]"
                    }`}
                  />
                );
              })}
            </div>

            <h4 className="label-caps mb-3 select-none">
              Problems in This Session
            </h4>
            <div className="flex flex-col gap-1.5">
              {session.problems.map((p, i) => {
                const pKey = problemKey(p);
                const isCurrent = i === orderIndex;
                const pWinner = isDuel ? claimedBy(session, pKey) : session.results[me]?.[pKey] !== undefined ? me : null;
                const pSolved = pWinner !== null;
                const pDiffBar = p.rating <= 1300 ? "bg-bb-lime" : p.rating <= 1900 ? "bg-bb-orange" : "bg-bb-red";
                return (
                  <div
                    key={pKey}
                    onClick={() => {
                      if (!isCurrent) {
                        playSound("click");
                        onSelectProblem(i);
                      }
                    }}
                    className={`relative overflow-hidden group flex items-center justify-between py-2 pl-3.5 pr-3 rounded-md cursor-pointer transition-all font-mono ${
                      isCurrent
                        ? "bg-bb-ink/[0.04] border border-bb-line-strong text-bb-ink"
                        : "text-bb-ink-soft hover:text-bb-ink hover:bg-bb-ink/[0.02]"
                    }`}
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${pDiffBar}`} />
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold text-bb-ink-faint shrink-0">{LETTERS[i] ?? i + 1}</span>
                      <span className="text-xs font-medium truncate">{p.name}</span>
                    </div>
                    {pSolved && (
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${
                          pWinner === me ? "text-bb-lime bg-bb-lime/10" : "text-bb-ink-soft bg-bb-ink/[0.05]"
                        }`}
                      >
                        {isDuel ? "✓" : "✓"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {solved && (
            <div className="mt-auto pt-4 border-t border-bb-line text-[10px] font-mono">
              <div
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border ${
                  winner === me
                    ? "border-bb-lime/40 bg-bb-lime/10 text-bb-lime"
                    : "border-bb-line bg-bb-paper text-bb-ink-soft"
                }`}
              >
                {isDuel ? `Claimed by ${session.displayHandles[winner as string] ?? winner}` : "Solved ✓"}
              </div>
            </div>
          )}
        </div>

        {/* Right pane: problem.md / solution.cpp tabs, equal footing for both */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-1 h-10 border-b border-bb-line select-none shrink-0">
            {(
              [
                { id: "problem" as const, label: "📄 problem.md" },
                { id: "code" as const, label: "⌨ solution.cpp" },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound("click");
                  setWorkspaceTab(tab.id);
                }}
                className={`h-full px-4 text-xs font-bold cursor-pointer border-b-2 flex items-center transition-all font-mono ${
                  workspaceTab === tab.id
                    ? "border-b-bb-orange text-bb-ink"
                    : "border-transparent text-bb-ink-faint hover:text-bb-ink-soft"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {workspaceTab === "problem" ? (
            statement ? (
              <ProblemStatement statement={statement} playSound={playSound} />
            ) : statementLoading ? (
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
            ) : (
              <div className="flex-1 min-h-[460px] spec-card p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5 pb-5 border-b border-bb-line">
                  <div>
                    <span className="text-[10px] font-mono text-bb-ink-faint uppercase tracking-wider">
                      {problem.contestId}
                      {problem.index}
                    </span>
                    <h3 className="text-2xl font-heading font-extrabold text-bb-ink mt-1">{problem.name}</h3>
                  </div>
                  <RatingBadge rating={problem.rating} />
                </div>

                {problem.tags.length > 0 && (
                  <div className="mb-6">
                    <span className="label-caps block mb-2">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="pill text-[10px] font-mono px-2 py-1 border border-bb-line bg-bb-paper text-bb-ink-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-bb-line bg-bb-paper p-5 mb-6">
                  <p className="text-sm text-bb-ink-soft leading-relaxed">
                    {notCovered
                      ? "This problem isn't in the local statement dataset (it covers problems up to ~2025), so the full statement lives on Codeforces. Solve it there — we detect your accepted verdict automatically within ~15s."
                      : "The statement couldn't be loaded right now — the full problem is always available on Codeforces. Solve it there and we'll detect your accepted verdict automatically within ~15s."}
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
            )
          ) : (
            // key forces a full remount on problem switch — CodeWorkspace's draft
            // state is loaded once via a lazy useState initializer, so it must
            // actually remount (not just re-render) to pick up the new problem's
            // draft instead of carrying over the previous problem's editor state.
            <CodeWorkspace
              key={key}
              problemKey={key}
              sessionId={session.id}
              judgeable={problem.judgeable === true && !solved}
              examples={statement?.examples ?? []}
              playSound={playSound}
              onAccepted={onAccepted}
            />
          )}
        </div>
      </div>
    </div>
  );
};
