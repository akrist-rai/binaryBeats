import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { buildDuelTargets, buildSoloTargets } from "../../lib/blitzAlgorithm";
import { CfApiError, fetchUserInfo, isValidHandleFormat, type CfUser } from "../../lib/codeforces";
import type { BlitzMode } from "../../lib/blitzSession";
import { RatingBadge } from "./RatingBadge";

export interface RivalInfo {
  handle: string;
  rating: number | null;
}

interface SessionSetupProps {
  meHandle: string;
  meRating: number | null;
  starting: boolean;
  startError: string | null;
  playSound: (type: "click" | "hover") => void;
  onStart: (mode: BlitzMode, rival: RivalInfo | null) => void;
}

export const SessionSetup: React.FC<SessionSetupProps> = ({
  meHandle,
  meRating,
  starting,
  startError,
  playSound,
  onStart,
}) => {
  const [mode, setMode] = useState<BlitzMode>("blitz");
  const [rivalInput, setRivalInput] = useState("");
  const [rival, setRival] = useState<CfUser | null>(null);
  const [rivalStatus, setRivalStatus] = useState<"idle" | "validating" | "error">("idle");
  const [rivalError, setRivalError] = useState<string | null>(null);

  const fetchRival = async () => {
    const trimmed = rivalInput.trim();
    if (!isValidHandleFormat(trimmed)) {
      setRivalStatus("error");
      setRivalError("Enter a valid Codeforces handle.");
      return;
    }
    if (trimmed.toLowerCase() === meHandle.toLowerCase()) {
      setRivalStatus("error");
      setRivalError("Pick someone other than yourself to duel.");
      return;
    }

    setRivalStatus("validating");
    setRivalError(null);
    playSound("click");

    try {
      const [fetched] = await fetchUserInfo([trimmed]);
      if (!fetched) {
        setRivalStatus("error");
        setRivalError(`No Codeforces user "${trimmed}" found.`);
        return;
      }
      setRival(fetched);
      setRivalStatus("idle");
    } catch (e) {
      setRivalStatus("error");
      setRivalError(
        e instanceof CfApiError && e.kind === "NOT_FOUND"
          ? `No Codeforces user "${trimmed}" found.`
          : "Could not reach Codeforces. Retry in a moment."
      );
    }
  };

  const targets = useMemo(() => {
    if (mode === "blitz") return buildSoloTargets(meRating ?? 800);
    if (rival) return buildDuelTargets(meRating ?? 800, rival.rating ?? 800);
    return null;
  }, [mode, meRating, rival]);

  const canStart = mode === "blitz" || (mode === "duel" && rival !== null);

  const handleStart = () => {
    if (!canStart || starting) return;
    playSound("click");
    onStart(mode, mode === "duel" && rival ? { handle: rival.handle, rating: rival.rating ?? null } : null);
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">{meHandle} is linked</span>
        <h3 className="editorial text-3xl text-bb-ink mt-3">
          Ready to compete?
        </h3>
        <p className="text-sm text-bb-ink-soft mt-1.5">Pick a mode and we'll draw a rating-matched problem set.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="spec-card corner-marks p-6"
          >
            <h4 className="label-caps mb-4 border-b border-bb-line pb-2">
              Choose a mode
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["blitz", "duel"] as BlitzMode[]).map((m) => {
                const selected = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      playSound("click");
                      setMode(m);
                    }}
                    onMouseEnter={() => playSound("hover")}
                    className={`relative text-left rounded-lg border p-5 transition-colors cursor-pointer ${
                      selected ? "border-bb-orange bg-bb-orange/[0.05]" : "border-bb-line hover:border-bb-line-strong"
                    }`}
                  >
                    {selected && (
                      <motion.div
                        layoutId="modeIndicator"
                        className="absolute inset-0 rounded-lg border border-bb-orange pointer-events-none"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="text-2xl block mb-2">{m === "blitz" ? "⚡" : "⚔️"}</span>
                    <span className="text-base font-bold font-heading text-bb-ink block mb-1">
                      {m === "blitz" ? "Solo Blitz" : "Duel"}
                    </span>
                    <span className="text-xs font-mono text-bb-ink-faint leading-relaxed block">
                      {m === "blitz"
                        ? "4 problems · ladder around your rating"
                        : "5 problems · first AC claims each"}
                    </span>
                  </button>
                );
              })}
            </div>

          <AnimatePresence>
            {mode === "duel" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-bb-line">
                  <p className="text-xs font-mono text-bb-ink-faint mb-3">
                    Your rival doesn't need an account here — any public Codeforces handle works.
                  </p>
                  {rival ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative spec-card p-5"
                    >
                      <button
                        onClick={() => {
                          setRival(null);
                          setRivalInput("");
                        }}
                        className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-wider text-bb-ink-faint hover:text-bb-orange transition-colors cursor-pointer"
                      >
                        change
                      </button>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
                        {/* Me */}
                        <div className="flex flex-col items-center text-center gap-2 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-bb-ink text-bb-term-acc flex items-center justify-center text-base font-bold font-mono shrink-0">
                            {meHandle[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-bb-ink truncate max-w-full">{meHandle}</span>
                          <RatingBadge rating={meRating} />
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center gap-1 px-1">
                          <span className="editorial text-2xl sm:text-3xl text-bb-orange leading-none">VS</span>
                          <span className="label-caps">Duel</span>
                        </div>

                        {/* Rival */}
                        <div className="flex flex-col items-center text-center gap-2 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-bb-ink text-bb-orange-soft flex items-center justify-center text-base font-bold font-mono shrink-0">
                            {rival.handle[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-bb-ink truncate max-w-full">{rival.handle}</span>
                          <RatingBadge rating={rival.rating ?? null} />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        value={rivalInput}
                        onChange={(e) => setRivalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") fetchRival();
                        }}
                        placeholder="rival's codeforces handle"
                        disabled={rivalStatus === "validating"}
                        className="flex-1 h-9 px-3 rounded-lg text-xs font-mono text-bb-ink bg-bb-paper-raised placeholder-bb-ink-faint focus:outline-none border border-bb-line focus:border-bb-line-strong transition-colors disabled:opacity-50"
                      />
                      <button
                        onClick={fetchRival}
                        disabled={rivalStatus === "validating"}
                        className="btn-outline shrink-0 h-9 px-4 text-[10px] font-mono uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      >
                        {rivalStatus === "validating" ? "Checking…" : "Fetch"}
                      </button>
                    </div>
                  )}
                  {rivalError && <p className="text-xs font-mono text-bb-red mt-2">{rivalError}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {targets && (
            <div className="mt-5 pt-5 dashed-rule">
              <span className="label-caps block mb-2.5">
                Target draw
              </span>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {targets.map((t, i) => (
                  <RatingBadge key={i} rating={t} />
                ))}
              </div>
              <p className="text-[11px] font-mono text-bb-ink-faint leading-relaxed">
                {mode === "blitz"
                  ? "Staircase from just-below your rating up to a stretch problem."
                  : "Anchored 60/40 toward the lower rating, capped so the gap never dominates."}
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: canStart ? 1.02 : 1 }}
            whileTap={{ scale: canStart ? 0.98 : 1 }}
            onClick={handleStart}
            onMouseEnter={() => canStart && playSound("hover")}
            disabled={!canStart || starting}
            className="btn-primary w-full mt-6 h-11 font-bold font-mono text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {starting ? "Drawing problems…" : "Start Session"}
          </motion.button>
          {startError && <p className="text-xs font-mono text-bb-red mt-3 text-center">{startError}</p>}
        </motion.div>
      </div>

      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="spec-card p-6"
        >
          <div className="flex items-center justify-between mb-5 border-b border-bb-line pb-2">
            <h4 className="label-caps">Detection Pipeline</h4>
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-bb-lime">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-bb-lime animate-pulse-lime" />
                <span className="absolute -inset-1 rounded-full border border-bb-lime/50 animate-ping" />
              </span>
              live
            </span>
          </div>

          <div className="relative pl-1">
            <div
              aria-hidden
              className="absolute left-[14px] top-3 bottom-3 w-px"
              style={{ backgroundImage: "repeating-linear-gradient(to bottom, var(--bb-line-strong) 0 3px, transparent 3px 7px)" }}
            />
            {[
              { text: "Solve on codeforces.com using your linked handle.", meta: null },
              { text: "Accepted verdicts are detected automatically.", meta: "~15s poll · codeforces api" },
              { text: "Only submissions made after the draw count.", meta: "timestamp-gated" },
              { text: "Problems either of you already solved are excluded.", meta: "dedup vs. solve history" },
            ].map((step, i, arr) => (
              <div key={i} className={`relative flex gap-3 ${i < arr.length - 1 ? "pb-5" : ""}`}>
                <div className="relative z-10 w-7 h-7 rounded-full border border-bb-line-strong bg-bb-paper-raised flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-bb-orange">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pt-0.5 min-w-0">
                  <p className="text-sm text-bb-ink-soft leading-snug">{step.text}</p>
                  {step.meta && (
                    <span className="inline-block mt-1.5 text-[9px] font-mono uppercase tracking-wider text-bb-ink-faint border border-bb-line rounded px-1.5 py-0.5">
                      {step.meta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};
