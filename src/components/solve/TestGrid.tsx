import React from "react";
import { motion } from "motion/react";
import type { Verdict } from "../../lib/judgeApi";

export type TestTileState = "pass" | "wa" | "tle" | "re" | "pending" | "running";

const TILE_CLASS: Record<TestTileState, string> = {
  pass: "bg-bb-term-acc",
  wa: "bg-[#ff5c5c]",
  tle: "bg-amber-400",
  re: "bg-[#ff5c5c]",
  pending: "bg-bb-term-line",
  running: "bg-bb-term-acc animate-pulse-lime",
};

/** Live progress (no verdict yet) → tile states. Purely derived, no new backend data needed. */
export function tilesFromProgress(progress: { done: number; total: number }): TestTileState[] {
  return Array.from({ length: progress.total }, (_, i) =>
    i < progress.done ? "pass" : i === progress.done ? "running" : "pending"
  );
}

/** Finished verdict → tile states. `executeSubmit` stops at the first failure, so
 *  everything before it passed and everything after it never ran. */
export function tilesFromVerdict(v: Verdict): TestTileState[] {
  if (v.totalCount === 0) return [];
  return Array.from({ length: v.totalCount }, (_, i) => {
    if (i < v.passedCount) return "pass";
    if (v.failedTestIndex !== undefined && i === v.failedTestIndex - 1) {
      return v.status === "WA" ? "wa" : v.status === "TLE" ? "tle" : v.status === "RE" ? "re" : "pending";
    }
    return "pending";
  });
}

interface TestGridProps {
  tiles: TestTileState[];
  /** Index (0-based) of the failing tile, if any — only that tile can open the diff viewer. */
  failedIndex?: number;
  onSelectFailed?: () => void;
  className?: string;
}

const TILE_TITLE: Record<TestTileState, string> = {
  pass: "Passed",
  wa: "Wrong answer — click to view diff",
  tle: "Time limit exceeded",
  re: "Runtime error",
  pending: "Not run",
  running: "Running…",
};

export const TestGrid: React.FC<TestGridProps> = ({ tiles, failedIndex, onSelectFailed, className = "" }) => {
  if (tiles.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-[3px] ${className}`} role="list" aria-label="Test results">
      {tiles.map((state, i) => {
        const clickable = i === failedIndex && state !== "pass" && state !== "pending" && !!onSelectFailed;
        return (
          <motion.button
            key={i}
            type="button"
            role="listitem"
            title={TILE_TITLE[state]}
            disabled={!clickable}
            onClick={clickable ? onSelectFailed : undefined}
            whileHover={clickable ? { scale: 1.25 } : undefined}
            className={`w-2.5 h-2.5 rounded-[2px] ${TILE_CLASS[state]} ${clickable ? "cursor-pointer ring-1 ring-offset-1 ring-offset-bb-term-surface ring-current" : "cursor-default"}`}
          />
        );
      })}
    </div>
  );
};
