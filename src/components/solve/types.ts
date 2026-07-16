import type { PollState } from "../../hooks/useSessionPolling";

/** Minimal problem shape the solve workspace needs — both Blitz's SessionProblem
 *  and practice mode's Problem (useProblems.ts) adapt down to this via adapters.ts. */
export interface SolvableProblem {
  key: string;
  contestId: number;
  index: string;
  title: string;
  rating: number | null;
  tags: string[];
  judgeable: boolean;
}

export interface SolveSidebarProblem {
  key: string;
  letter: string;
  title: string;
  rating: number | null;
  solved: boolean;
  solvedByMe: boolean;
}

export type SolveClaim = { label: string; mine: boolean } | null;

export type SolveWorkspaceProps =
  | {
      mode: "session";
      problem: SolvableProblem;
      orderIndex: number;
      sidebarItems: SolveSidebarProblem[];
      progress: { solved: number; total: number };
      claim: SolveClaim;
      pollState: PollState;
      sessionId: string;
      onBack: () => void;
      onSelectProblem: (index: number) => void;
      onAccepted: () => void;
      playSound: (type: "click" | "hover") => void;
    }
  | {
      mode: "practice";
      problem: SolvableProblem;
      solved: boolean;
      onBack: () => void;
      onAccepted: () => void;
      playSound: (type: "click" | "hover") => void;
    };
