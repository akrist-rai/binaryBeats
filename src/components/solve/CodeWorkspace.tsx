import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "motion/react";
import { useCodeDraft } from "../../hooks/useCodeDraft";
import { useSubmissionHistory } from "../../hooks/useSubmissionHistory";
import { runCode, DEFAULT_CPP_CODE } from "../../lib/wandbox";
import { getHighlightedCode } from "../../lib/cppHighlight";
import {
  createRun,
  pollRun,
  JudgeApiError,
  type CustomOutput,
  type SampleResult,
  type Verdict,
} from "../../lib/judgeApi";
import { DiffViewer } from "./DiffViewer";
import { SubmissionHistoryPanel } from "./SubmissionHistoryPanel";
import { TestGrid, tilesFromProgress, tilesFromVerdict } from "./TestGrid";
import { VERDICT_LABEL, VERDICT_PANEL, VERDICT_TEXT } from "./verdictStyles";

interface CodeWorkspaceProps {
  problemKey: string;
  /** Blitz session to record a solve into — omitted in practice mode, where
   *  Submit still judges against the full suite, it just records nothing. */
  sessionId?: string;
  /** Complete official test suite exists server-side — Submit is available. */
  judgeable?: boolean;
  /** Count of hidden tests Submit judges against — purely for messaging. */
  testCount?: number;
  /** Public examples (from the statement) — enables Run Samples. */
  examples?: { input: string; output: string }[];
  playSound?: (type: "click" | "hover") => void;
  /** Called after an in-app AC has been recorded into the session. */
  onAccepted?: () => void;
}

type ConsoleTab = "output" | "samples" | "stdin" | "history";
type Busy = "custom" | "samples" | "submit" | null;

const LINE_HEIGHT = 21;

/** Indents/outdents every line touched by [selStart, selEnd] by one tab-stop. */
function reindentBlock(code: string, selStart: number, selEnd: number, outdent: boolean) {
  const lineStart = code.lastIndexOf("\n", selStart - 1) + 1;
  let lineEndIdx = code.indexOf("\n", selEnd);
  if (lineEndIdx === -1) lineEndIdx = code.length;

  const before = code.slice(0, lineStart);
  const block = code.slice(lineStart, lineEndIdx);
  const after = code.slice(lineEndIdx);
  const lines = block.split("\n");

  let firstDelta = 0;
  let cumulativeDelta = 0;
  const newLines = lines.map((line, i) => {
    let delta: number;
    let newLine: string;
    if (outdent) {
      const removed = line.match(/^ {1,4}/)?.[0].length ?? 0;
      delta = -removed;
      newLine = line.slice(removed);
    } else {
      delta = 4;
      newLine = "    " + line;
    }
    if (i === 0) firstDelta = delta;
    cumulativeDelta += delta;
    return newLine;
  });

  const newCode = before + newLines.join("\n") + after;
  const newSelStart = Math.max(lineStart, selStart + firstDelta);
  const newSelEnd = Math.max(newSelStart, selEnd + cumulativeDelta);
  return { newCode, newSelStart, newSelEnd };
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  problemKey,
  sessionId,
  judgeable = false,
  testCount = 0,
  examples = [],
  playSound,
  onAccepted,
}) => {
  const { draft, setCode, setStdin } = useCodeDraft(problemKey);
  const { history, addRecord } = useSubmissionHistory(problemKey);
  const [busy, setBusy] = useState<Busy>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("output");
  const [copied, setCopied] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [scrollTop, setScrollTop] = useState(0);

  const [customOut, setCustomOut] = useState<CustomOutput | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleResult[] | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = history.length > 0 && history[0].code !== draft.code;
  const memoryDisplay = verdict?.peakMemoryMb ?? customOut?.peakMemoryMb;

  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop: st, scrollLeft } = textareaRef.current;
    if (gutterRef.current) gutterRef.current.scrollTop = st;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = st;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    setScrollTop(st);
  };

  const updateCursor = () => {
    const el = textareaRef.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const linesBefore = before.split("\n");
    setCursor({ line: linesBefore.length, col: linesBefore[linesBefore.length - 1].length + 1 });
  };

  const OPEN_TO_CLOSE: Record<string, string> = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
  const CLOSERS = new Set(Object.values(OPEN_TO_CLOSE));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    // Ctrl/Cmd+Enter — run without leaving the keyboard.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (busy === null) void handleRun();
      return;
    }

    // Every branch below synthesizes an edit + moves the caret. The textarea
    // is a controlled component (value={draft.code}), so setCode() alone
    // only schedules a re-render — el.value wouldn't reflect the change
    // until React commits it. Reading/writing el.value or el.selectionStart
    // before that commit (e.g. from the very next rapid keystroke, or a
    // requestAnimationFrame callback) races the update and can scramble
    // text. flushSync forces the commit synchronously before we touch the
    // DOM again, so every branch here is safe against back-to-back keys.
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = el;
      if (selectionStart === selectionEnd && !e.shiftKey) {
        const newCode = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
        const pos = selectionStart + 4;
        flushSync(() => setCode(newCode));
        el.selectionStart = el.selectionEnd = pos;
      } else {
        const { newCode, newSelStart, newSelEnd } = reindentBlock(value, selectionStart, selectionEnd, e.shiftKey);
        flushSync(() => setCode(newCode));
        el.selectionStart = newSelStart;
        el.selectionEnd = newSelEnd;
      }
      updateCursor();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = el;
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart, selectionStart);
      let indent = currentLine.match(/^\s*/)?.[0] ?? "";
      if (currentLine.trim().endsWith("{")) indent += "    ";
      const insert = "\n" + indent;
      const newCode = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      const pos = selectionStart + insert.length;
      flushSync(() => setCode(newCode));
      el.selectionStart = el.selectionEnd = pos;
      updateCursor();
      return;
    }

    // Type-through a closing bracket/quote that's already there instead of
    // inserting a duplicate.
    if (CLOSERS.has(e.key)) {
      const { selectionStart, selectionEnd, value } = el;
      if (selectionStart === selectionEnd && value[selectionStart] === e.key) {
        e.preventDefault();
        el.selectionStart = el.selectionEnd = selectionStart + 1;
        updateCursor();
        return;
      }
    }

    // Auto-pair brackets/quotes — wrap the selection if there is one.
    if (OPEN_TO_CLOSE[e.key]) {
      const { selectionStart, selectionEnd, value } = el;
      const close = OPEN_TO_CLOSE[e.key];
      e.preventDefault();
      if (selectionStart !== selectionEnd) {
        const selected = value.slice(selectionStart, selectionEnd);
        const newCode = value.slice(0, selectionStart) + e.key + selected + close + value.slice(selectionEnd);
        flushSync(() => setCode(newCode));
        el.selectionStart = selectionStart + 1;
        el.selectionEnd = selectionEnd + 1;
      } else {
        const newCode = value.slice(0, selectionStart) + e.key + close + value.slice(selectionEnd);
        const pos = selectionStart + 1;
        flushSync(() => setCode(newCode));
        el.selectionStart = el.selectionEnd = pos;
      }
      updateCursor();
    }
  };

  const handleRun = async () => {
    setBusy("custom");
    setCompileError(null);
    setCustomOut(null);
    setProgress(null);
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
      setProgress(null);
    }
  };

  const handleRunSamples = async () => {
    setBusy("samples");
    setCompileError(null);
    setSamples(null);
    setProgress(null);
    setConsoleTab("samples");
    setStatusLine("Compiling…");

    try {
      const runId = await createRun({ kind: "samples", code: draft.code, problemKey });
      const run = await pollRun(runId, (r) => {
        if (r.state === "running" && r.progress) {
          setStatusLine(`Sample ${Math.min(r.progress.done + 1, r.progress.total)} / ${r.progress.total}…`);
          setProgress(r.progress);
        }
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
      setProgress(null);
    }
  };

  const handleSubmit = async () => {
    setBusy("submit");
    setCompileError(null);
    setVerdict(null);
    setShowDiff(false);
    setProgress(null);
    setStatusLine("Compiling…");

    try {
      const runId = await createRun({ kind: "submit", code: draft.code, problemKey, sessionId });
      const run = await pollRun(runId, (r) => {
        if (r.state === "running" && r.progress) {
          setStatusLine(`Running test ${Math.min(r.progress.done + 1, r.progress.total)} / ${r.progress.total}…`);
          setProgress(r.progress);
        }
      });
      if (run.verdict) {
        setVerdict(run.verdict);
        addRecord({
          submittedAtSeconds: Math.floor(Date.now() / 1000),
          status: run.verdict.status,
          passedCount: run.verdict.passedCount,
          totalCount: run.verdict.totalCount,
          timeMs: run.verdict.timeMs,
          peakMemoryMb: run.verdict.peakMemoryMb,
          code: draft.code,
        });
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
      setProgress(null);
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

  const handleReset = () => {
    if (busy !== null) return;
    setCode(DEFAULT_CPP_CODE);
  };

  const lines = draft.code.split("\n");

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 p-3 bg-bb-term-bg">
      {/* Verdict stamp */}
      {verdict && (
        <div className={`rounded border px-4 py-3 flex flex-col gap-2.5 font-mono ${VERDICT_PANEL[verdict.status]}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className={`shrink-0 w-9 h-9 rounded border-2 border-current flex items-center justify-center ${VERDICT_TEXT[verdict.status]}`}
            >
              <span className="text-[11px] font-black tracking-tighter">{verdict.status}</span>
            </motion.div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm font-black uppercase tracking-wider ${VERDICT_TEXT[verdict.status]} ${verdict.status === "AC" ? "term-text-glow" : ""}`}>
                {VERDICT_LABEL[verdict.status]}
              </span>
              {verdict.status !== "CE" && (
                <span className="text-xs text-bb-term-text/60">
                  {verdict.passedCount} / {verdict.totalCount} tests
                  {verdict.failedTestIndex !== undefined && ` · failed on test ${verdict.failedTestIndex}`}
                  {verdict.status === "AC" && ` · ${verdict.timeMs} ms`}
                  {verdict.peakMemoryMb !== undefined && ` · ${verdict.peakMemoryMb} MB`}
                </span>
              )}
              {verdict.status === "WA" && verdict.failedTest && (
                <button
                  onClick={() => setShowDiff((s) => !s)}
                  className={`text-[10px] font-mono uppercase tracking-wider underline underline-offset-2 cursor-pointer ${VERDICT_TEXT[verdict.status]} opacity-80 hover:opacity-100 transition-opacity`}
                >
                  {showDiff ? "Hide Diff" : "View Diff"}
                </button>
              )}
            </div>
            {verdict.status === "AC" && verdict.solveRecorded && (
              <span className="ml-auto text-[10px] uppercase tracking-wider text-bb-term-acc/80 whitespace-nowrap">solve recorded ✓</span>
            )}
          </div>

          {verdict.totalCount > 0 && (
            <TestGrid
              tiles={tilesFromVerdict(verdict)}
              failedIndex={verdict.failedTestIndex !== undefined ? verdict.failedTestIndex - 1 : undefined}
              onSelectFailed={verdict.failedTest ? () => setShowDiff(true) : undefined}
            />
          )}

          {showDiff && verdict.failedTest && (
            <DiffViewer expected={verdict.failedTest.expected} actual={verdict.failedTest.actual} />
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-[360px] relative rounded border border-bb-term-line bg-bb-term-surface overflow-hidden flex flex-col font-mono">
        <div className="h-8 bg-bb-term-bg/40 border-b border-bb-term-line flex items-center justify-between px-3 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11.5px] font-bold text-bb-term-text shrink-0 flex items-center gap-1.5">
              solution.cpp
              {hasUnsavedChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-bb-term-acc2" title="Changed since your last submission" />
              )}
            </span>
          </div>
          <button
            onClick={handleReset}
            disabled={busy !== null}
            title="Reset to starter template"
            className="text-bb-term-text/35 hover:text-bb-term-acc transition-colors disabled:opacity-30 cursor-pointer shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="flex-1 relative flex overflow-hidden scanlines">
          <div
            ref={gutterRef}
            className="w-11 bg-bb-term-bg border-r border-bb-term-line flex flex-col pt-4 items-end pr-3 text-bb-term-text/35 text-xs select-none overflow-hidden font-mono"
          >
            {lines.map((_, idx) => (
              <div
                key={idx}
                className={`w-full h-[21px] flex items-center justify-end font-bold transition-colors ${idx === cursor.line - 1 ? "text-bb-term-acc" : ""}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden bg-transparent">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 bg-bb-term-acc/[0.06] pointer-events-none z-[1]"
              style={{ top: (cursor.line - 1) * LINE_HEIGHT - scrollTop, height: LINE_HEIGHT }}
            />
            <pre
              ref={highlightRef}
              className="absolute inset-0 p-4 pt-4 text-xs text-bb-term-text overflow-hidden pointer-events-none select-none font-mono whitespace-pre bg-transparent border-0 outline-none z-0"
              style={{ lineHeight: `${LINE_HEIGHT}px` }}
              dangerouslySetInnerHTML={{ __html: getHighlightedCode(draft.code) }}
            />
            <textarea
              ref={textareaRef}
              value={draft.code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCursor}
              onClick={updateCursor}
              onSelect={updateCursor}
              className="absolute inset-0 p-4 pt-4 text-xs text-transparent caret-bb-term-acc selection:bg-bb-term-acc2/20 selection:text-bb-term-text overflow-auto font-mono whitespace-pre bg-transparent border-0 outline-none resize-none focus:ring-0 focus:border-0 w-full h-full z-10 custom-scrollbar-dark"
              style={{ lineHeight: `${LINE_HEIGHT}px` }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="h-6 bg-bb-term-bg border-t border-bb-term-line flex items-center justify-between px-3 text-[10px] font-mono text-bb-term-text/50 select-none">
          <span className="flex items-center gap-1.5 text-bb-term-acc font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-bb-term-acc" />
            C++17
          </span>
          <span className="tabular-nums">Ln {cursor.line}, Col {cursor.col}</span>
          <span className="flex items-center gap-3 tabular-nums">
            {memoryDisplay !== undefined && <span>{memoryDisplay} MB</span>}
            <span>{lines.length} lines · UTF-8</span>
          </span>
        </div>
      </div>

      {/* Console */}
      <div className="h-44 rounded border border-bb-term-line bg-bb-term-surface overflow-hidden flex flex-col font-mono text-xs shrink-0">
        <div className="h-8 bg-bb-term-bg/40 border-b border-bb-term-line flex items-center justify-between px-3 select-none">
          <div className="flex gap-5 items-center h-full">
            {(
              [
                { id: "output" as const, label: "Output" },
                ...(examples.length > 0 ? [{ id: "samples" as const, label: "Samples" }] : []),
                { id: "stdin" as const, label: "Custom Input" },
                { id: "history" as const, label: "History" },
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
          {statusLine && (
            <div className="flex items-center gap-2.5">
              {progress ? (
                <TestGrid tiles={tilesFromProgress(progress)} />
              ) : (
                <div className="flex gap-[3px]">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-2.5 h-1.5 rounded-[1px] bg-bb-term-acc"
                      animate={{ opacity: [0.15, 1, 0.15] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              )}
              <motion.span
                key={statusLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-bb-term-acc text-[10px] font-mono"
              >
                <span className="text-bb-term-text/30">$</span> {statusLine}
                <span className="caret-inline text-bb-term-acc" />
              </motion.span>
            </div>
          )}
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
          ) : consoleTab === "history" ? (
            <SubmissionHistoryPanel
              history={history}
              onRestore={(code) => {
                setCode(code);
                playSound?.("click");
              }}
            />
          ) : consoleTab === "samples" ? (
            samples ? (
              <div className="flex flex-col gap-2.5">
                {samples.map((s) => (
                  <div key={s.index} className="rounded border border-bb-term-line overflow-hidden">
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
                      <span className="text-bb-term-text/40 tabular-nums">
                        {s.timeMs} ms{s.peakMemoryMb !== undefined ? ` · ${s.peakMemoryMb} MB` : ""}
                      </span>
                    </div>
                    {!s.pass &&
                      (s.outcome === "ok" ? (
                        <DiffViewer expected={s.expected} actual={s.actual} />
                      ) : (
                        <pre className="p-2.5 text-[11px] text-bb-term-text/90 whitespace-pre-wrap max-h-28 overflow-y-auto custom-scrollbar-dark">{s.actual}</pre>
                      ))}
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
            <>
              <span className="text-bb-term-text/40">
                {judgeable
                  ? `Run executes against your custom input; Submit compiles and runs your code against all ${testCount} official hidden tests, right here.`
                  : "Run executes against your custom input. This problem has no local test suite — submit on Codeforces for the verdict."}
              </span>
              <span className="caret-inline text-bb-term-acc" />
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {judgeable && (
          <button
            onClick={handleSubmit}
            disabled={busy !== null}
            className="h-9 px-5 rounded bg-bb-term-acc hover:brightness-110 text-bb-term-bg font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy === "submit" ? "Judging…" : "Submit"}
          </button>
        )}
        {examples.length > 0 && (
          <button
            onClick={handleRunSamples}
            disabled={busy !== null}
            className="h-9 px-4 rounded bg-bb-term-text hover:brightness-90 text-bb-term-bg font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy === "samples" ? "Running…" : "Run Samples"}
          </button>
        )}
        <button
          onClick={handleRun}
          disabled={busy !== null}
          className={`h-9 px-4 rounded font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 ${
            examples.length > 0
              ? "border border-bb-term-line hover:border-bb-term-text/25 bg-bb-term-surface text-bb-term-text/70 hover:text-bb-term-text"
              : "bg-bb-term-text hover:brightness-90 text-bb-term-bg"
          }`}
        >
          {busy === "custom" ? "Running…" : "Run"}
          <span className={`hidden sm:inline text-[9px] font-mono ${examples.length > 0 ? "text-bb-term-text/35" : "opacity-50"}`}>⌘⏎</span>
        </button>
        <button
          onClick={handleCopy}
          className="h-9 px-4 rounded border border-bb-term-line hover:border-bb-term-text/25 bg-bb-term-surface text-xs font-mono uppercase tracking-wider text-bb-term-text/70 hover:text-bb-term-text transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
        <span className="text-[9px] font-mono text-bb-term-text/35 ml-auto hidden md:inline">
          {judgeable
            ? "judged locally against the official Codeforces test suite (open-r1 dataset)"
            : "compile + run only — no local test suite for this problem, verify on Codeforces"}
        </span>
      </div>
    </div>
  );
};
