import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCfHandle } from "../../hooks/useCfHandle";
import { useSessionPolling } from "../../hooks/useSessionPolling";
import { BlitzApiError, SESSION_ID_KEY, createSession, endSession } from "../../lib/blitzApi";
import { problemKey } from "../../lib/codeforces";
import { DUEL_VICTORY_BONUS_XP, xpForRating } from "../../lib/blitzAlgorithm";
import { claimedBy, scores, type BlitzMode, type BlitzSession } from "../../lib/blitzSession";
import { logSolve } from "../../lib/activityLog";
import { HandleLinkCard } from "./HandleLinkCard";
import { SessionSetup, type RivalInfo } from "./SessionSetup";
import { ProblemCard } from "./ProblemCard";
import { ProblemWorkspace } from "./ProblemWorkspace";
import { Scoreboard } from "./Scoreboard";
import { SessionTimer } from "./SessionTimer";
import { RatingBadge } from "./RatingBadge";

interface BlitzDuelViewProps {
  playSound: (type: "click" | "hover") => void;
  onAddXp: (amount: number) => void;
}

function awardedKey(sessionId: string): string {
  return `bb_xp_awarded_${sessionId}`;
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

export const BlitzDuelView: React.FC<BlitzDuelViewProps> = ({ playSound, onAddXp }) => {
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

  // Award XP the moment a problem is won. Idempotent across polls/reloads via a
  // small locally-persisted "already awarded" set, keyed by session id.
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
        onAddXp(xpForRating(p.rating));
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

    if (session.status === "finished" && session.mode === "duel") {
      const sc = scores(session);
      const rival = session.handles[1];
      if ((sc[me] ?? 0) > (sc[rival] ?? 0) && !awarded.has("duel_bonus")) {
        onAddXp(DUEL_VICTORY_BONUS_XP);
        awarded.add("duel_bonus");
        changed = true;
      }
    }

    if (changed) {
      playSound("click");
      writeAwarded(session.id, awarded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const xpEarned = useMemo(() => {
    if (!session) return 0;
    const awarded = readAwarded(session.id);
    let total = 0;
    for (const p of session.problems) {
      if (awarded.has(problemKey(p))) total += xpForRating(p.rating);
    }
    if (awarded.has("duel_bonus")) total += DUEL_VICTORY_BONUS_XP;
    return total;
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
    <div className="w-full min-h-[calc(100vh-56px)] text-bb-ink relative pb-12">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Codeforces Arena</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-bb-ink mt-2 tracking-tight">
              Blitz &amp; Duel
            </h2>
            <p className="text-xs font-mono text-bb-ink-faint mt-1.5">Real problems. Real verdicts. Rating-matched.</p>
          </div>

          {linked && (
            <div className="flex items-center gap-2 rounded-lg border border-bb-line bg-bb-paper-raised px-3 py-1.5">
              <span className="font-mono text-xs text-bb-ink">{handle}</span>
              <RatingBadge rating={user?.rating ?? null} />
              <button
                onClick={handleUnlink}
                className="text-[10px] font-mono uppercase tracking-wider text-bb-ink-faint hover:text-bb-ink transition-colors cursor-pointer"
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
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {openProblemIndex === null ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    <div className="lg:col-span-2 spec-card corner-marks overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-bb-line">
                        <h3 className="label-caps">
                          Problem Set
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pollState === "live" ? "bg-bb-lime animate-pulse" : "bg-bb-ink-faint"
                            }`}
                          />
                          <span className="text-[10px] font-mono text-bb-ink-faint">
                            {pollState === "live"
                              ? "server watching submissions"
                              : pollState === "paused"
                                ? "paused — tab hidden"
                                : "retrying — rate limited"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col divide-y divide-bb-line">
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
                      <div className="spec-card p-5">
                        <SessionTimer startedAtSeconds={session.createdAtSeconds} running />
                      </div>

                      <Scoreboard session={session} xpEarned={xpEarned} />

                      {session.mode === "duel" && (
                        <button
                          onClick={handleCopyLinks}
                          className="btn-outline h-10 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
                        >
                          {copied ? "Copied ✓" : "Copy problem links"}
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmingEnd(true)}
                        className="h-10 rounded-full border border-bb-line text-bb-ink-faint hover:text-bb-red hover:border-bb-red/40 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        End Session
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                    <ProblemWorkspace
                      session={session}
                      problem={session.problems[openProblemIndex]}
                      orderIndex={openProblemIndex}
                      pollState={pollState}
                      playSound={playSound}
                      onBack={() => setOpenProblemIndex(null)}
                      onSelectProblem={setOpenProblemIndex}
                      onAccepted={() => void refetch()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto w-full spec-card corner-marks p-8 text-center"
            >
              {session.mode === "duel" ? (
                <FinishedDuelBanner session={session} />
              ) : (
                <>
                  <span className="eyebrow">Session Complete</span>
                  <h3 className="text-2xl font-heading font-extrabold text-bb-ink mt-3 mb-1">
                    {session.problems.length} / {session.problems.length} solved
                  </h3>
                </>
              )}
              <p className="text-sm font-mono font-bold text-bb-lime mt-2">+{xpEarned} XP</p>
              <FinishedRecap session={session} />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playSound("click");
                  handleNewSession();
                }}
                className="btn-primary mt-6 px-5 h-10 font-bold font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                New Session
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmingEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bb-ink/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm spec-card p-6"
            >
              <h4 className="text-sm font-bold font-heading text-bb-ink mb-2">End this session?</h4>
              <p className="text-xs font-mono text-bb-ink-faint mb-5 leading-relaxed">
                Progress on unsolved problems will be discarded. XP already earned stays.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmingEnd(false)}
                  className="btn-outline flex-1 h-9 text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 h-9 rounded-full border border-bb-red/40 text-xs font-mono uppercase tracking-wider text-bb-red hover:bg-bb-red/10 transition-colors cursor-pointer"
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

  return (
    <>
      <span className="eyebrow">Duel Complete</span>
      <h3
        className={`editorial text-4xl mt-3 mb-1 ${
          verdict === "VICTORY" ? "text-bb-lime" : verdict === "DEFEAT" ? "text-bb-ink-faint" : "text-bb-ink-soft"
        }`}
      >
        {verdict}
      </h3>
      <p className="text-sm font-mono text-bb-ink-soft">
        {meScore} — {rivalScore}
      </p>
    </>
  );
};

const FinishedRecap: React.FC<{ session: BlitzSession }> = ({ session }) => {
  const me = session.handles[0];
  const isDuel = session.mode === "duel";

  return (
    <div className="mt-6 pt-6 border-t border-bb-line flex flex-col gap-2.5 text-left">
      {session.problems.map((p) => {
        const key = problemKey(p);
        const winner = isDuel ? claimedBy(session, key) : session.results[me]?.[key] !== undefined ? me : null;
        return (
          <div key={key} className="flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <RatingBadge rating={p.rating} />
              <span className="text-bb-ink-soft truncate">{p.name}</span>
            </div>
            <span
              className={`shrink-0 ${
                winner === me ? "text-bb-lime font-bold" : winner ? "text-bb-ink-soft" : "text-bb-ink-faint"
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
