import type { Verdict } from "../../lib/judgeApi";

export const VERDICT_LABEL: Record<Verdict["status"], string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  RE: "Runtime Error",
  CE: "Compilation Error",
};

// Bright, saturated verdict colors tuned to read on the near-black terminal
// surface — AC gets the full neon accent, failures get a hot red, TLE gets
// amber so it reads distinctly from a hard failure at a glance.
export const VERDICT_TEXT: Record<Verdict["status"], string> = {
  AC: "text-bb-term-acc",
  WA: "text-[#ff5c5c]",
  TLE: "text-amber-400",
  RE: "text-[#ff5c5c]",
  CE: "text-[#ff5c5c]",
};

export const VERDICT_PANEL: Record<Verdict["status"], string> = {
  AC: "border-bb-term-acc/30 bg-bb-term-acc/[0.07]",
  WA: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
  TLE: "border-amber-400/30 bg-amber-400/[0.07]",
  RE: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
  CE: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
};

export const VERDICT_DOT: Record<Verdict["status"], string> = {
  AC: "bg-bb-term-acc",
  WA: "bg-[#ff5c5c]",
  TLE: "bg-amber-400",
  RE: "bg-[#ff5c5c]",
  CE: "bg-[#ff5c5c]",
};
