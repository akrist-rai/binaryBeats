import React from "react";
import { motion } from "motion/react";
import { scores, type BlitzSession } from "../../lib/blitzSession";
import { useCountUp } from "../../hooks/useCountUp";

interface ScoreboardProps {
  session: BlitzSession;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Avatar: React.FC<{ letter: string; className?: string }> = ({ letter, className = "" }) => (
  <div
    className={`w-9 h-9 rounded-full bg-bb-term-bg border border-bb-term-line flex items-center justify-center text-xs font-mono font-bold shrink-0 ${className}`}
  >
    {letter}
  </div>
);

export const Scoreboard: React.FC<ScoreboardProps> = ({ session }) => {
  const s = scores(session);
  const me = session.handles[0];
  const total = session.problems.length;
  const rival = session.handles[1];

  // Hooks run unconditionally (rules-of-hooks) even though only one branch's
  // values end up rendered — a session's mode never changes mid-flight, but
  // the component shouldn't rely on that to keep hook order stable.
  const solved = s[me] ?? 0;
  const solvedDisplay = useCountUp(solved, 600);
  const meScore = s[me] ?? 0;
  const rivalScore = rival ? (s[rival] ?? 0) : 0;
  const meDisplay = useCountUp(meScore, 600);
  const rivalDisplay = useCountUp(rivalScore, 600);

  if (session.mode === "blitz") {
    const pct = total > 0 ? solved / total : 0;

    return (
      <div className="rounded-lg border border-bb-term-line bg-bb-term-surface p-5 corner-marks-term">
        <span className="eyebrow-term mb-4 block">Progress</span>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(244,239,228,0.08)" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="var(--bb-term-acc)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct) }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: solved > 0 ? "drop-shadow(0 0 6px rgba(195,247,58,0.6))" : undefined }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="stat-num text-2xl text-bb-term-text leading-none">{solvedDisplay}</span>
              <span className="text-[9px] font-mono text-bb-term-text/40 uppercase tracking-wider mt-0.5">of {total}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <motion.div
                key={i}
                className="h-2 rounded-full overflow-hidden bg-bb-term-text/[0.06]"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {i < solved && <div className="h-full w-full bg-bb-term-acc" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const leading = meScore === rivalScore ? null : meScore > rivalScore ? me : rival;

  return (
    <div className="rounded-lg border border-bb-term-line bg-bb-term-surface p-5 corner-marks-term">
      <span className="eyebrow-term mb-4 block">Duel Scoreboard</span>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar letter={me[0]?.toUpperCase() ?? "?"} className={leading === me ? "text-bb-term-acc border-bb-term-acc/40" : "text-bb-term-text/60"} />
          <span className="text-xs font-mono text-bb-term-text truncate">{session.displayHandles[me] ?? me}</span>
        </div>
        <span className={`stat-num text-2xl tabular-nums shrink-0 ${leading === me ? "text-bb-term-acc glow-text-lime" : "text-bb-term-text"}`}>
          {meDisplay}
        </span>
      </div>

      {/* Tug-of-war race bar — each side grows from its own edge toward the middle. */}
      <div className="relative h-2.5 rounded-full bg-bb-term-text/[0.06] overflow-hidden mb-3">
        <motion.div
          className="absolute left-0 top-0 h-full bg-bb-term-acc rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(meScore / total) * 50}%` : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full bg-bb-term-acc2 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(rivalScore / total) * 50}%` : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-bb-term-text/15 -translate-x-1/2" />
      </div>

      <div className="flex items-center justify-between">
        <span className={`stat-num text-2xl tabular-nums shrink-0 ${leading === rival ? "text-bb-term-acc2 glow-text-blue" : "text-bb-term-text"}`}>
          {rivalDisplay}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-bb-term-text truncate">{session.displayHandles[rival] ?? rival}</span>
          <Avatar letter={rival[0]?.toUpperCase() ?? "?"} className={leading === rival ? "text-bb-term-acc2 border-bb-term-acc2/40" : "text-bb-term-text/60"} />
        </div>
      </div>
    </div>
  );
};
