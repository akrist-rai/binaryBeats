import React from "react";
import { motion } from "motion/react";
import { scores, type BlitzSession } from "../../lib/blitzSession";
import { Panel } from "../ui/Panel";
import { Eyebrow } from "../ui/Eyebrow";
import { StatNumeral } from "../ui/StatNumeral";

interface ScoreboardProps {
  session: BlitzSession;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Avatar: React.FC<{ letter: string; className?: string }> = ({ letter, className = "" }) => (
  <div
    className={`w-9 h-9 rounded-full bg-bb-ground border border-bb-line flex items-center justify-center text-xs font-mono font-bold shrink-0 ${className}`}
  >
    {letter}
  </div>
);

export const Scoreboard: React.FC<ScoreboardProps> = ({ session }) => {
  const s = scores(session);
  const me = session.handles[0];
  const total = session.problems.length;
  const rival = session.handles[1];

  const solved = s[me] ?? 0;
  const meScore = s[me] ?? 0;
  const rivalScore = rival ? (s[rival] ?? 0) : 0;

  if (session.mode === "blitz") {
    const pct = total > 0 ? solved / total : 0;

    return (
      <Panel bracket className="p-5">
        <Eyebrow className="mb-4 block">Progress</Eyebrow>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(242,242,237,0.08)" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="var(--bb-yellow)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct) }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <StatNumeral value={solved} countUp size="md" className="text-bb-ink leading-none" />
              <span className="text-[9px] font-mono text-bb-ink/40 uppercase tracking-wider mt-0.5">of {total}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <motion.div
                key={i}
                className="h-2 rounded-sm overflow-hidden bg-bb-ink/[0.06]"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {i < solved && <div className="h-full w-full bg-bb-yellow" />}
              </motion.div>
            ))}
          </div>
        </div>
      </Panel>
    );
  }

  const leading = meScore === rivalScore ? null : meScore > rivalScore ? me : rival;

  return (
    <Panel bracket className="p-5">
      <Eyebrow className="mb-4 block">Duel Scoreboard</Eyebrow>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            letter={me[0]?.toUpperCase() ?? "?"}
            className={leading === me ? "text-bb-yellow border-bb-yellow/40" : "text-bb-ink/60"}
          />
          <span className="text-xs font-mono text-bb-ink truncate">{session.displayHandles[me] ?? me}</span>
        </div>
        <StatNumeral
          value={meScore}
          countUp
          size="md"
          className={`tabular-nums shrink-0 ${leading === me ? "text-bb-yellow" : "text-bb-ink"}`}
        />
      </div>

      {/* Tug-of-war race bar — each side grows from its own edge toward the middle. */}
      <div className="relative h-2.5 rounded-sm bg-bb-ink/[0.06] overflow-hidden mb-3">
        <motion.div
          className="absolute left-0 top-0 h-full bg-bb-yellow"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(meScore / total) * 50}%` : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full bg-bb-rival"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(rivalScore / total) * 50}%` : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-bb-ink/15 -translate-x-1/2" />
      </div>

      <div className="flex items-center justify-between">
        <StatNumeral
          value={rivalScore}
          countUp
          size="md"
          className={`tabular-nums shrink-0 ${leading === rival ? "text-bb-rival" : "text-bb-ink"}`}
        />
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-bb-ink truncate">{session.displayHandles[rival] ?? rival}</span>
          <Avatar
            letter={rival[0]?.toUpperCase() ?? "?"}
            className={leading === rival ? "text-bb-rival border-bb-rival/40" : "text-bb-ink/60"}
          />
        </div>
      </div>
    </Panel>
  );
};
