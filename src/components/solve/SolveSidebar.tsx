import React from "react";
import { problemUrl } from "../../lib/codeforces";
import { RatingBadge } from "../blitz/RatingBadge";
import type { SolvableProblem, SolveClaim, SolveSidebarProblem } from "./types";

interface SolveSidebarProps {
  problem: SolvableProblem;
  items: SolveSidebarProblem[];
  orderIndex: number;
  progress: { solved: number; total: number };
  claim: SolveClaim;
  onSelectProblem: (index: number) => void;
  playSound: (type: "click" | "hover") => void;
}

export const SolveSidebar: React.FC<SolveSidebarProps> = ({ problem, items, orderIndex, progress, claim, onSelectProblem, playSound }) => {
  return (
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
            {progress.solved}/{progress.total}
          </span>
        </div>
        <div className="flex gap-1 mb-5">
          {items.map((item) => (
            <span
              key={item.key}
              className={`flex-1 h-1.5 rounded-full ${
                item.solvedByMe ? "bg-bb-lime" : item.solved ? "bg-bb-ink-soft" : "bg-bb-ink/[0.08]"
              }`}
            />
          ))}
        </div>

        <h4 className="label-caps mb-3 select-none">Problems in This Session</h4>
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => {
            const isCurrent = i === orderIndex;
            const diffBar = (item.rating ?? 0) <= 1300 ? "bg-bb-lime" : (item.rating ?? 0) <= 1900 ? "bg-bb-orange" : "bg-bb-red";
            return (
              <div
                key={item.key}
                onClick={() => {
                  if (!isCurrent) {
                    playSound("click");
                    onSelectProblem(i);
                  }
                }}
                className={`relative overflow-hidden group flex items-center justify-between py-2 pl-3.5 pr-3 rounded-md cursor-pointer transition-all font-mono ${
                  isCurrent ? "bg-bb-ink/[0.04] border border-bb-line-strong text-bb-ink" : "text-bb-ink-soft hover:text-bb-ink hover:bg-bb-ink/[0.02]"
                }`}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${diffBar}`} />
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] font-bold text-bb-ink-faint shrink-0">{item.letter}</span>
                  <span className="text-xs font-medium truncate">{item.title}</span>
                </div>
                {item.solved && (
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${
                      item.solvedByMe ? "text-bb-lime bg-bb-lime/10" : "text-bb-ink-soft bg-bb-ink/[0.05]"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {claim && (
        <div className="mt-auto pt-4 border-t border-bb-line text-[10px] font-mono">
          <div
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border ${
              claim.mine ? "border-bb-lime/40 bg-bb-lime/10 text-bb-lime" : "border-bb-line bg-bb-paper text-bb-ink-soft"
            }`}
          >
            {claim.mine ? "Solved ✓" : `Claimed by ${claim.label}`}
          </div>
        </div>
      )}
    </div>
  );
};
