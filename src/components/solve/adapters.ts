import type { Problem } from "../../hooks/useProblems";
import { problemKey } from "../../lib/codeforces";
import { claimedBy, type BlitzSession, type SessionProblem } from "../../lib/blitzSession";
import type { SolvableProblem, SolveClaim, SolveSidebarProblem } from "./types";

const LETTERS = "ABCDEFGH";

export function sessionProblemToSolvable(p: SessionProblem): SolvableProblem {
  return {
    key: problemKey(p),
    contestId: p.contestId,
    index: p.index,
    title: p.name,
    rating: p.rating,
    tags: p.tags,
    judgeable: p.judgeable === true,
  };
}

export function practiceProblemToSolvable(p: Problem): SolvableProblem {
  return {
    key: p.key,
    contestId: p.contestId,
    index: p.index,
    title: p.title ?? p.key,
    rating: p.rating,
    tags: p.tags,
    judgeable: p.judgeable,
  };
}

/** Who (if anyone) has claimed/solved a given problem in this session. */
function winnerOf(session: BlitzSession, key: string): string | null {
  const me = session.handles[0];
  return session.mode === "duel" ? claimedBy(session, key) : session.results[me]?.[key] !== undefined ? me : null;
}

export function deriveSidebarItems(session: BlitzSession): SolveSidebarProblem[] {
  const me = session.handles[0];
  return session.problems.map((p, i) => {
    const key = problemKey(p);
    const winner = winnerOf(session, key);
    return {
      key,
      letter: LETTERS[i] ?? String(i + 1),
      title: p.name,
      rating: p.rating,
      solved: winner !== null,
      solvedByMe: winner === me,
    };
  });
}

export function deriveProgress(session: BlitzSession): { solved: number; total: number } {
  const solved = session.problems.filter((p) => winnerOf(session, problemKey(p)) !== null).length;
  return { solved, total: session.problems.length };
}

export function deriveClaim(session: BlitzSession, key: string): SolveClaim {
  const me = session.handles[0];
  const winner = winnerOf(session, key);
  if (winner === null) return null;
  return {
    mine: winner === me,
    label: session.mode === "duel" ? (session.displayHandles[winner] ?? winner) : "Solved",
  };
}
