import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCfHandle } from "../../hooks/useCfHandle";
import { useSessionPolling } from "../../hooks/useSessionPolling";
import { useCountUp } from "../../hooks/useCountUp";
import { BlitzApiError, SESSION_ID_KEY, createSession, endSession } from "../../lib/blitzApi";
import { problemKey } from "../../lib/codeforces";
import { claimedBy, scores, type BlitzMode, type BlitzSession } from "../../lib/blitzSession";
import { logSolve } from "../../lib/activityLog";
import { ConfettiBurst } from "../Effects/ConfettiBurst";
import { HandleLinkCard } from "./HandleLinkCard";
import { SessionSetup, type RivalInfo } from "./SessionSetup";
import { ProblemCard } from "./ProblemCard";
import { Scoreboard } from "./Scoreboard";
import { SessionTimer } from "./SessionTimer";
import { RatingBadge } from "./RatingBadge";
import { SolveWorkspace } from "../solve/SolveWorkspace";
import { deriveClaim, deriveProgress, deriveSidebarItems, sessionProblemToSolvable } from "../solve/adapters";

interface BlitzDuelViewProps {
  playSound: (type: "click" | "hover") => void;
}

// Solves are detected via polling — this tracks which ones we've already
// logged for a session so a re-render/reload doesn't log the same solve twice.
function awardedKey(sessionId: string): string {
  return `bb_awarded_${sessionId}`;
}

function readAwarded(sessionId: string): Set<string> {
  try {
    const raw = localStorage.getItem(awardedKey(sessionId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeAwarded(sessionId: string, keys: Set<string>) {
  try {
    localStorage.setItem(awardedKey(sessionId), JSON.stringify([...keys]));
  } catch {
    // ignore quota errors
  }
}

// Decorative deterministic "barcode" of the session id — a shipping-label/
// spec-sheet motif, `currentColor`-driven so it reads on the arena's dark
// surfaces. Purely visual; no data is actually encoded.
const SessionBarcode: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    return Array.from({ length: 16 }, () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return (seed >>> 16) % 3 === 0 ? 2 : 1;
    });
  }, [value]);
  const width = bars.reduce((a, b) => a + b + 1, 0);
  let x = 0;
  return (
    <svg width={width} height={11} viewBox={`0 0 ${width} 11`} className={className} aria-hidden="true">
      {bars.map((w, i) => {
        const rect = <rect key={i} x={x} y={0} width={w} height={11} fill="currentColor" />;
        x += w + 1;
        return rect;
      })}
    </svg>
  );
};

export const BlitzDuelView: React.FC<BlitzDuelViewProps> = ({ playSound }) => {
  const { handle, user, status, error, linkHandle, unlinkHandle } = useCfHandle();

  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_ID_KEY));
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openProblemIndex, setOpenProblemIndex] = useState<number | null>(null);

  const { session, pollState, notFound, refetch } = useSessionPolling(sessionId);

  // A fresh session (or leaving one) always starts back at the problem list.
  useEffect(() => {
    setOpenProblemIndex(null);
  }, [sessionId]);

  // Server-side session vanished (expired/swept) — forget it locally and go back to setup.
  useEffect(() => {
    if (notFound) {
      localStorage.removeItem(SESSION_ID_KEY);
      setSessionId(null);
    }
  }, [notFound]);

  // Log the solve the moment a problem is won. Idempotent across polls/reloads
  // via a small locally-persisted "already logged" set, keyed by session id.
  // Nothing here touches rating — like Codeforces itself, practice (solo Blitz
  // or a Duel) never moves your rating, only real rated contests do.
  useEffect(() => {
    if (!session) return;
    const me = session.handles[0];
    const awarded = readAwarded(session.id);
    let changed = false;

    for (const p of session.problems) {
      const key = problemKey(p);
      const winner =
        session.mode === "duel" ? claimedBy(session, key) : session.results[me]?.[key] !== undefined ? me : null;
      if (winner === me && !awarded.has(key)) {
        logSolve({
          source: "codeforces",
          key,
          title: p.name,
          meta: String(p.rating),
          solvedAtSeconds: session.results[me]?.[key] ?? Math.floor(Date.now() / 1000),
        });
        awarded.add(key);
        changed = true;
      }
    }

    if (changed) {
      playSound("click");
      writeAwarded(session.id, awarded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleStart = useCallback(
    async (mode: BlitzMode, rival: RivalInfo | null) => {
      if (!handle) return;
      setStarting(true);
      setStartError(null);

      try {
        const newSession = await createSession(mode, handle, rival?.handle);
        localStorage.setItem(SESSION_ID_KEY, newSession.id);
        setSessionId(newSession.id);
      } catch (e) {
        if (e instanceof BlitzApiError && (e.kind === "NO_PROBLEMS" || e.kind === "NOT_FOUND")) {
          setStartError(e.message);
        } else if (e instanceof BlitzApiError && e.kind === "RATE_LIMITED") {
          setStartError("Codeforces is rate-limiting requests — wait a few seconds and retry.");
        } else {
          setStartError("Something went wrong preparing the session — retry.");
        }
      } finally {
        setStarting(false);
      }
    },
    [handle]
  );

  const handleNewSession = () => {
    localStorage.removeItem(SESSION_ID_KEY);
    setSessionId(null);
    setStartError(null);
  };

  const handleUnlink = () => {
    unlinkHandle();
    setSessionId(null);
  };

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await endSession(sessionId);
      } catch {
        // best-effort — the server sweeps stale sessions on its own regardless
      }
    }
    localStorage.removeItem(SESSION_ID_KEY);
    setSessionId(null);
    setConfirmingEnd(false);
  };

  const handleCopyLinks = async () => {
    if (!session) return;
    const text = session.problems
      .map((p) => `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const linked = !!handle;

  return (
    <div className="w-full min-h-[calc(100vh-56px)] relative pb-12 arena-bg">
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 arena-grid" />
        <div className="arena-glow-b w-[420px] h-[420px] -top-32 -right-20" />
      </div>

      {session && session.status === "active" && openProblemIndex !== null ? (
        /* ── WORKSPACE VIEW — full-bleed, no page max-width, desktop IDE layout ── */
        <div
          className="w-full px-2.5 lg:px-4 pt-2.5 lg:pt-3 flex flex-col relative z-10"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          <SolveWorkspace
            mode="session"
            problem={sessionProblemToSolvable(session.problems[openProblemIndex])}
            orderIndex={openProblemIndex}
            sidebarItems={deriveSidebarItems(session)}
            progress={deriveProgress(session)}
            claim={deriveClaim(session, problemKey(session.problems[openProblemIndex]))}
            pollState={pollState}
            sessionId={session.id}
            onBack={() => setOpenProblemIndex(null)}
            onSelectProblem={setOpenProblemIndex}
            onAccepted={() => void refetch()}
            playSound={playSound}
          />
        </div>
      ) : (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none select-none absolute -top-8 -left-1 -z-10 text-[110px] font-heading font-black text-bb-term-text/[0.04] leading-none"
            >
              02
            </span>
            <span className="eyebrow-term">/02 <span className="text-bb-term-text/25 normal-case">·</span> Codeforces Arena</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-bb-term-text mt-2 tracking-tight">
              Blitz &amp; Duel
            </h2>
            <p className="text-xs font-mono text-bb-term-text/45 mt-1.5">Real problems. Real verdicts. Rating-matched.</p>
          </div>

          {linked && (
            <div className="flex items-center gap-2 rounded-lg border border-bb-term-line bg-bb-term-surface px-3 py-1.5">
              <span className="font-mono text-xs text-bb-term-text">{handle}</span>
              <RatingBadge rating={user?.rating ?? null} />
              <button
                onClick={handleUnlink}
                className="text-[10px] font-mono uppercase tracking-wider text-bb-term-text/40 hover:text-bb-term-text transition-colors cursor-pointer"
              >
                change
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!linked ? (
            <motion.div key="link" exit={{ opacity: 0 }}>
              <HandleLinkCard
                validating={status === "validating"}
                error={error}
                onLink={linkHandle}
                playSound={playSound}
              />
            </motion.div>
          ) : !sessionId || !session ? (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SessionSetup
                meHandle={handle}
                meRating={user?.rating ?? null}
                starting={starting}
                startError={startError}
                playSound={playSound}
                onStart={handleStart}
              />
            </motion.div>
          ) : session.status === "active" ? (
            <motion.div
              key="active-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 rounded-lg border border-bb-term-line bg-bb-term-surface overflow-hidden corner-marks-term">
                <div className="flex items-center justify-between px-6 py-4 border-b border-bb-term-line gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="eyebrow-term shrink-0">
                      Problem Set
                    </h3>
                    <span className="hidden sm:flex items-center gap-2 min-w-0 text-bb-term-text/30">
                      <SessionBarcode value={session.id} className="shrink-0" />
                      <span className="text-[9px] font-mono tracking-wider truncate">
                        #{session.id.slice(0, 8).toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className={`absolute inset-0 rounded-full ${pollState === "live" ? "bg-bb-term-acc2 animate-pulse" : "bg-bb-term-text/30"}`} />
                      {pollState === "live" && <span className="absolute -inset-1 rounded-full border border-bb-term-acc2/50 animate-ping" />}
                    </span>
                    <span className="text-[10px] font-mono text-bb-term-text/40">
                      {pollState === "live"
                        ? "server watching submissions"
                        : pollState === "paused"
                          ? "paused — tab hidden"
                          : "retrying — rate limited"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  {session.problems.map((p, i) => (
                    <ProblemCard
                      key={problemKey(p)}
                      session={session}
                      problem={p}
                      orderIndex={i}
                      playSound={playSound}
                      onOpen={() => setOpenProblemIndex(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <SessionTimer startedAtSeconds={session.createdAtSeconds} running />

                <Scoreboard session={session} />

                {session.mode === "duel" && (
                  <button
                    onClick={handleCopyLinks}
                    className="h-10 rounded-lg border border-bb-term-line hover:border-bb-term-text/25 text-bb-term-text/70 hover:text-bb-term-text text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {copied ? "Copied ✓" : "Copy problem links"}
                  </button>
                )}

                <button
                  onClick={() => setConfirmingEnd(true)}
                  className="h-10 rounded-lg border border-bb-term-line text-bb-term-text/40 hover:text-[#ff5c5c] hover:border-[#ff5c5c]/40 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative max-w-xl mx-auto w-full rounded-lg border border-bb-term-line bg-bb-term-surface corner-marks-term overflow-hidden p-8 text-center"
            >
              {session.mode === "duel" ? (
                <FinishedDuelBanner session={session} />
              ) : (
                <FinishedBlitzBanner session={session} />
              )}
              <FinishedRecap session={session} />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playSound("click");
                  handleNewSession();
                }}
                className="relative z-10 mt-6 px-5 h-10 rounded-full bg-bb-term-acc text-bb-term-bg hover:brightness-110 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                New Session
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      <AnimatePresence>
        {confirmingEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm rounded-lg border border-bb-term-line bg-bb-term-surface p-6"
            >
              <h4 className="text-sm font-bold font-heading text-bb-term-text mb-2">End this session?</h4>
              <p className="text-xs font-mono text-bb-term-text/50 mb-5 leading-relaxed">
                Progress on unsolved problems will be discarded. Solved problems stay logged in your activity.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmingEnd(false)}
                  className="flex-1 h-9 rounded-lg border border-bb-term-line hover:border-bb-term-text/25 text-bb-term-text/70 hover:text-bb-term-text text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 h-9 rounded-lg border border-[#ff5c5c]/40 hazard-stripes text-xs font-mono uppercase tracking-wider text-[#ff5c5c] hover:bg-[#ff5c5c]/10 transition-colors cursor-pointer"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FinishedDuelBanner: React.FC<{ session: BlitzSession }> = ({ session }) => {
  const sc = scores(session);
  const me = session.handles[0];
  const rival = session.handles[1];
  const meScore = sc[me] ?? 0;
  const rivalScore = sc[rival] ?? 0;
  const verdict = meScore === rivalScore ? "DRAW" : meScore > rivalScore ? "VICTORY" : "DEFEAT";
  const meDisplay = useCountUp(meScore, 900);
  const rivalDisplay = useCountUp(rivalScore, 900);

  return (
    <>
      {verdict === "VICTORY" && <ConfettiBurst burstKey={session.id} count={40} />}
      <span className="eyebrow-term relative z-10">Duel Complete</span>
      <h3
        className={`editorial text-5xl mt-3 mb-2 relative z-10 ${
          verdict === "VICTORY" ? "text-bb-term-acc glow-text-lime" : verdict === "DEFEAT" ? "text-[#ff5c5c] glow-text-red" : "text-bb-term-acc2 glow-text-blue"
        }`}
      >
        {verdict}
      </h3>
      <p className="text-lg font-mono text-bb-term-text/70 stat-num relative z-10">
        {meDisplay} — {rivalDisplay}
      </p>
    </>
  );
};

const FinishedBlitzBanner: React.FC<{ session: BlitzSession }> = ({ session }) => {
  const total = session.problems.length;
  const solved = scores(session)[session.handles[0]] ?? 0;
  const allSolved = solved === total && total > 0;
  const display = useCountUp(solved, 900);

  return (
    <>
      {allSolved && <ConfettiBurst burstKey={session.id} count={40} />}
      <span className="eyebrow-term relative z-10">Session Complete</span>
      <h3 className={`text-2xl font-heading font-extrabold mt-3 mb-1 relative z-10 stat-num ${allSolved ? "text-bb-term-acc glow-text-lime" : "text-bb-term-text"}`}>
        {display} / {total} solved
      </h3>
    </>
  );
};

const FinishedRecap: React.FC<{ session: BlitzSession }> = ({ session }) => {
  const me = session.handles[0];
  const isDuel = session.mode === "duel";

  return (
    <div className="relative z-10 mt-6 pt-6 border-t border-bb-term-line flex flex-col gap-2.5 text-left">
      {session.problems.map((p) => {
        const key = problemKey(p);
        const winner = isDuel ? claimedBy(session, key) : session.results[me]?.[key] !== undefined ? me : null;
        return (
          <div key={key} className="flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <RatingBadge rating={p.rating} />
              <span className="text-bb-term-text/60 truncate">{p.name}</span>
            </div>
            <span
              className={`shrink-0 ${
                winner === me ? "text-bb-term-acc font-bold" : winner ? "text-bb-term-text/50" : "text-bb-term-text/30"
              }`}
            >
              {winner ? (isDuel ? (session.displayHandles[winner] ?? winner) : "Solved ✓") : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
