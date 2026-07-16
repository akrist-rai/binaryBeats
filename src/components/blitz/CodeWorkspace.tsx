import React, { useRef, useState } from "react";
import { useCodeDraft } from "../../hooks/useCodeDraft";
import { runCode } from "../../lib/wandbox";
import { getHighlightedCode } from "../../lib/cppHighlight";
import {
  createRun,
  pollRun,
  JudgeApiError,
  type CustomOutput,
  type SampleResult,
  type Verdict,
} from "../../lib/judgeApi";

interface CodeWorkspaceProps {
  problemKey: string;
  sessionId?: string;
  /** Complete official test suite exists server-side — Submit is available. */
  judgeable?: boolean;
  /** Public examples (from the statement) — enables Run Samples. */
  examples?: { input: string; output: string }[];
  playSound?: (type: "click" | "hover") => void;
  /** Called after an in-app AC has been recorded into the session. */
  onAccepted?: () => void;
}

type ConsoleTab = "output" | "samples" | "stdin";
type Busy = "custom" | "samples" | "submit" | null;

const VERDICT_LABEL: Record<Verdict["status"], string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  RE: "Runtime Error",
  CE: "Compilation Error",
};

// Bright, saturated verdict colors tuned to read on the near-black terminal
// surface — AC gets the full neon accent, failures get a hot red, TLE gets
// amber so it reads distinctly from a hard failure at a glance.
const VERDICT_TEXT: Record<Verdict["status"], string> = {
  AC: "text-bb-term-acc",
  WA: "text-[#ff5c5c]",
  TLE: "text-amber-400",
  RE: "text-[#ff5c5c]",
  CE: "text-[#ff5c5c]",
};

const VERDICT_PANEL: Record<Verdict["status"], string> = {
  AC: "border-bb-term-acc/30 bg-bb-term-acc/[0.07]",
  WA: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
  TLE: "border-amber-400/30 bg-amber-400/[0.07]",
  RE: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
  CE: "border-[#ff5c5c]/30 bg-[#ff5c5c]/[0.07]",
};

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  problemKey,
  sessionId,
  judgeable = false,
  examples = [],
  playSound,
  onAccepted,
}) => {
  const { draft, setCode, setStdin } = useCodeDraft(problemKey);
  const [busy, setBusy] = useState<Busy>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("output");
  const [copied, setCopied] = useState(false);

  const [customOut, setCustomOut] = useState<CustomOutput | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleResult[] | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleRun = async () => {
    setBusy("custom");
    setCompileError(null);
    setCustomOut(null);
    setConsoleTab("output");
    setStatusLine("Compiling…");

    try {
      const runId = await createRun({ kind: "custom", code: draft.code, stdin: draft.stdin });
      const run = await pollRun(runId, (r) => {
        setStatusLine(r.state === "compiling" || r.state === "queued" ? "Compiling…" : "Running…");
      });
      if (run.compileError) setCompileError(run.compileError);
      else if (run.output) setCustomOut(run.output);
    } catch (e) {
      if (e instanceof JudgeApiError && (e.kind === "NETWORK" || e.kind === "JUDGE_BUSY" || e.kind === "API_FAILED")) {
        // Local judge unreachable/busy — fall back to Wandbox so Run always works.
        setStatusLine("Running via Wandbox…");
        const r = await runCode(draft.code, draft.stdin);
        if (r.compileError) setCompileError(r.compileError);
        else setCustomOut({ stdout: r.output, stderr: r.stderr, timeMs: 0, exitCode: r.success ? 0 : null, timedOut: false });
      } else {
        setCompileError((e as Error).message);
      }
    } finally {
      setBusy(null);
      setStatusLine(null);
    }
  };

  const handleRunSamples = async () => {
    setBusy("samples");
    setCompileError(null);
    setSamples(null);
    setConsoleTab("samples");
    setStatusLine("Compiling…");

    try {
      const runId = await createRun({ kind: "samples", code: draft.code, problemKey });
      const run = await pollRun(runId, (r) => {
        if (r.state === "running" && r.progress) setStatusLine(`Sample ${Math.min(r.progress.done + 1, r.progress.total)} / ${r.progress.total}…`);
      });
      if (run.compileError) {
        setCompileError(run.compileError);
        setConsoleTab("output");
      } else if (run.samples) {
        setSamples(run.samples);
      }
    } catch (e) {
      setCompileError((e as Error).message);
      setConsoleTab("output");
    } finally {
      setBusy(null);
      setStatusLine(null);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    setBusy("submit");
    setCompileError(null);
    setVerdict(null);
    setStatusLine("Compiling…");

    try {
      const runId = await createRun({ kind: "submit", code: draft.code, problemKey, sessionId });
      const run = await pollRun(runId, (r) => {
        if (r.state === "running" && r.progress) {
          setStatusLine(`Running test ${Math.min(r.progress.done + 1, r.progress.total)} / ${r.progress.total}…`);
        }
      });
      if (run.verdict) {
        setVerdict(run.verdict);
        if (run.verdict.status === "CE" && run.compileError) {
          setCompileError(run.compileError);
          setConsoleTab("output");
        }
        if (run.verdict.status === "AC") {
          playSound?.("click");
          onAccepted?.();
        }
      }
    } catch (e) {
      if (e instanceof JudgeApiError) {
        setCompileError(e.message);
        setConsoleTab("output");
      } else {
        setCompileError("Submitting failed — retry in a moment.");
        setConsoleTab("output");
      }
    } finally {
      setBusy(null);
      setStatusLine(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const lines = draft.code.split("\n");

  return (
    <div className="terminal-panel flex-1 flex flex-col gap-4 min-h-0 p-4">
      {/* Verdict banner */}
      {verdict && (
        <div
          className={`rounded-lg border px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap font-mono ${VERDICT_PANEL[verdict.status]}`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black uppercase tracking-wider ${VERDICT_TEXT[verdict.status]} ${verdict.status === "AC" ? "term-text-glow" : ""}`}>
              {VERDICT_LABEL[verdict.status]}
            </span>
            {verdict.status !== "CE" && (
              <span className="text-xs text-bb-term-text/60">
                {verdict.passedCount} / {verdict.totalCount} tests
                {verdict.failedTestIndex !== undefined && ` · failed on test ${verdict.failedTestIndex}`}
                {verdict.status === "AC" && ` · ${verdict.timeMs} ms`}
              </span>
            )}
          </div>
          {verdict.status === "AC" && verdict.solveRecorded && (
            <span className="text-[10px] uppercase tracking-wider text-bb-term-acc/80">solve recorded ✓</span>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-[360px] relative rounded-lg border border-bb-term-line bg-bb-term-surface overflow-hidden flex flex-col font-mono">
        <div className="h-9 bg-bb-term-bg/40 border-b border-bb-term-line flex items-center justify-between px-4 select-none">
          <span className="text-xs font-bold text-bb-term-text">solution.cpp</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5c5c]/25" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/25" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/25" />
          </div>
        </div>

        <div className="flex-1 relative flex overflow-hidden">
          <div
            ref={gutterRef}
            className="w-11 bg-bb-term-bg border-r border-bb-term-line flex flex-col pt-4 items-end pr-3 text-bb-term-text/35 text-xs select-none overflow-hidden leading-relaxed custom-scrollbar-dark font-mono"
          >
            {lines.map((_, idx) => (
              <div key={idx} className="h-[21px] flex items-center font-bold">
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden bg-transparent">
            <pre
              ref={highlightRef}
              className="absolute inset-0 p-4 text-xs text-bb-term-text leading-relaxed overflow-hidden pointer-events-none select-none font-mono whitespace-pre bg-transparent border-0 outline-none z-0"
              dangerouslySetInnerHTML={{ __html: getHighlightedCode(draft.code) }}
            />
            <textarea
              ref={textareaRef}
              value={draft.code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              className="absolute inset-0 p-4 text-xs text-transparent caret-bb-term-acc selection:bg-bb-term-acc2/20 selection:text-bb-term-text leading-relaxed overflow-auto font-mono whitespace-pre bg-transparent border-0 outline-none resize-none focus:ring-0 focus:border-0 w-full h-full z-10 custom-scrollbar-dark"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="h-7 bg-bb-term-bg border-t border-bb-term-line flex items-center justify-between px-4 text-[10px] font-mono text-bb-term-text/50 select-none">
          <span className="flex items-center gap-1.5 text-bb-term-acc font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-bb-term-acc" />
            C++17
          </span>
          <span>{lines.length} lines</span>
        </div>
      </div>

      {/* Console */}
      <div className="h-48 rounded-lg border border-bb-term-line bg-bb-term-surface overflow-hidden flex flex-col font-mono text-xs shrink-0">
        <div className="h-9 bg-bb-term-bg/40 border-b border-bb-term-line flex items-center justify-between px-4 select-none">
          <div className="flex gap-5 items-center h-full">
            {(
              [
                { id: "output" as const, label: "Output" },
                ...(examples.length > 0 ? [{ id: "samples" as const, label: "Samples" }] : []),
                { id: "stdin" as const, label: "Custom Input" },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setConsoleTab(tab.id)}
                className={`h-full text-[10px] font-mono tracking-wider uppercase cursor-pointer border-b-2 flex items-center transition-all ${
                  consoleTab === tab.id ? "border-bb-term-acc text-bb-term-text" : "border-transparent text-bb-term-text/40 hover:text-bb-term-text/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {statusLine && <span className="text-bb-term-acc animate-pulse text-[10px] font-mono">{statusLine}</span>}
        </div>

        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar-dark bg-bb-term-bg/30">
          {consoleTab === "stdin" ? (
            <textarea
              value={draft.stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="stdin for Run — optional"
              spellCheck={false}
              className="w-full h-full bg-transparent text-bb-term-text placeholder-bb-term-text/30 focus:outline-none resize-none"
            />
          ) : consoleTab === "samples" ? (
            samples ? (
              <div className="flex flex-col gap-2.5">
                {samples.map((s) => (
                  <div key={s.index} className="rounded-lg border border-bb-term-line overflow-hidden">
                    <div
                      className={`flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider ${
                        s.pass
                          ? "text-bb-term-acc bg-bb-term-acc/[0.06]"
                          : s.outcome === "tle"
                            ? "text-amber-400 bg-amber-400/[0.06]"
                            : "text-[#ff5c5c] bg-[#ff5c5c]/[0.06]"
                      }`}
                    >
                      <span>
                        Sample {s.index + 1} — {s.pass ? "pass ✓" : s.outcome === "tle" ? "time limit" : s.outcome === "re" ? "runtime error" : "fail ✗"}
                      </span>
                      <span className="text-bb-term-text/40">{s.timeMs} ms</span>
                    </div>
                    {!s.pass && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-bb-term-line text-[11px]">
                        <div className="p-2.5">
                          <span className="text-bb-term-text/40 block mb-1">expected</span>
                          <pre className="text-bb-term-text/90 whitespace-pre-wrap max-h-28 overflow-y-auto custom-scrollbar-dark">{s.expected}</pre>
                        </div>
                        <div className="p-2.5">
                          <span className="text-bb-term-text/40 block mb-1">your output</span>
                          <pre className="text-bb-term-text/90 whitespace-pre-wrap max-h-28 overflow-y-auto custom-scrollbar-dark">{s.actual || "(empty)"}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-bb-term-text/40">Run Samples to check your code against the statement's examples.</span>
            )
          ) : compileError ? (
            <span className="text-[#ff5c5c] whitespace-pre-wrap">{compileError}</span>
          ) : customOut ? (
            <>
              <span className="text-bb-term-text/90 whitespace-pre-wrap">
                {customOut.timedOut ? "(time limit exceeded)" : customOut.stdout || "(no output)"}
              </span>
              {customOut.stderr && <span className="text-[#ff5c5c] whitespace-pre-wrap block mt-2">{customOut.stderr}</span>}
            </>
          ) : (
            <span className="text-bb-term-text/40">
              {judgeable
                ? "Run executes against your custom input; Submit judges against the full official test suite, right here."
                : "Run executes against your custom input. This problem has no local test suite — submit on Codeforces for the verdict."}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {judgeable && sessionId && (
          <button
            onClick={handleSubmit}
            disabled={busy !== null}
            className="h-10 px-6 rounded-lg bg-bb-term-acc hover:brightness-110 text-bb-term-bg font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy === "submit" ? "Judging…" : "Submit"}
          </button>
        )}
        {examples.length > 0 && (
          <button
            onClick={handleRunSamples}
            disabled={busy !== null}
            className="h-10 px-5 rounded-lg bg-bb-term-text hover:brightness-90 text-bb-term-bg font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy === "samples" ? "Running…" : "Run Samples"}
          </button>
        )}
        <button
          onClick={handleRun}
          disabled={busy !== null}
          className={`h-10 px-5 rounded-lg font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
            examples.length > 0
              ? "border border-bb-term-line hover:border-bb-term-text/25 bg-bb-term-surface text-bb-term-text/70 hover:text-bb-term-text"
              : "bg-bb-term-text hover:brightness-90 text-bb-term-bg"
          }`}
        >
          {busy === "custom" ? "Running…" : "Run"}
        </button>
        <button
          onClick={handleCopy}
          className="h-10 px-5 rounded-lg border border-bb-term-line hover:border-bb-term-text/25 bg-bb-term-surface text-xs font-mono uppercase tracking-wider text-bb-term-text/70 hover:text-bb-term-text transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
        <span className="text-[9px] font-mono text-bb-term-text/35 ml-auto">
          {judgeable
            ? "judged locally against the official Codeforces test suite (open-r1 dataset)"
            : "compile + run only — no local test suite for this problem, verify on Codeforces"}
        </span>
      </div>
    </div>
  );
};
