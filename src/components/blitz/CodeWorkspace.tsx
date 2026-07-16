import React, { useRef, useState } from "react";
import { useCodeDraft } from "../../hooks/useCodeDraft";
import { runCode, type RunResult } from "../../lib/wandbox";
import { getHighlightedCode } from "../../lib/cppHighlight";

interface CodeWorkspaceProps {
  problemKey: string;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ problemKey }) => {
  const { draft, setCode, setStdin } = useCodeDraft(problemKey);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"output" | "stdin">("output");

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
    setRunning(true);
    setResult(null);
    setConsoleTab("output");
    const r = await runCode(draft.code, draft.stdin);
    setResult(r);
    setRunning(false);
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
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {/* Editor */}
      <div className="flex-1 min-h-[360px] relative rounded-xl border border-white/[0.08] bg-[#0c0c11] overflow-hidden flex flex-col font-mono">
        <div className="h-9 bg-white/[0.01] border-b border-white/[0.08] flex items-center justify-between px-4 select-none">
          <span className="text-xs font-bold text-white">solution.cpp</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
          </div>
        </div>

        <div className="flex-1 relative flex overflow-hidden">
          <div
            ref={gutterRef}
            className="w-11 bg-[#09090d] border-r border-white/[0.04] flex flex-col pt-4 items-end pr-3 text-zinc-600 text-xs select-none overflow-hidden leading-relaxed custom-scrollbar font-mono"
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
              className="absolute inset-0 p-4 text-xs text-zinc-300 leading-relaxed overflow-hidden pointer-events-none select-none font-mono whitespace-pre bg-transparent border-0 outline-none z-0"
              dangerouslySetInnerHTML={{ __html: getHighlightedCode(draft.code) }}
            />
            <textarea
              ref={textareaRef}
              value={draft.code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              className="absolute inset-0 p-4 text-xs text-transparent caret-white selection:bg-[#35e8ff]/20 selection:text-zinc-100 leading-relaxed overflow-auto font-mono whitespace-pre bg-transparent border-0 outline-none resize-none focus:ring-0 focus:border-0 w-full h-full z-10 custom-scrollbar"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="h-7 bg-[#09090d] border-t border-white/[0.08] flex items-center justify-between px-4 text-[10px] font-mono text-zinc-500 select-none">
          <span className="flex items-center gap-1.5 text-[#c3f73a] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a]" />
            C++17
          </span>
          <span>{lines.length} lines</span>
        </div>
      </div>

      {/* Console */}
      <div className="h-40 rounded-xl border border-white/[0.08] bg-[#0c0c11] overflow-hidden flex flex-col font-mono text-xs shrink-0">
        <div className="h-9 bg-white/[0.01] border-b border-white/[0.08] flex items-center justify-between px-4 select-none">
          <div className="flex gap-5 items-center h-full">
            <button
              onClick={() => setConsoleTab("output")}
              className={`h-full text-[10px] font-mono tracking-wider uppercase cursor-pointer border-b-2 flex items-center transition-all ${
                consoleTab === "output" ? "border-[#c3f73a] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setConsoleTab("stdin")}
              className={`h-full text-[10px] font-mono tracking-wider uppercase cursor-pointer border-b-2 flex items-center transition-all ${
                consoleTab === "stdin" ? "border-[#c3f73a] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Custom Input
            </button>
          </div>
          {running && <span className="text-[#c3f73a] animate-pulse text-[10px] font-mono">Compiling…</span>}
        </div>
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-black/10">
          {consoleTab === "stdin" ? (
            <textarea
              value={draft.stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="stdin for this run — optional"
              spellCheck={false}
              className="w-full h-full bg-transparent text-zinc-300 placeholder-zinc-700 focus:outline-none resize-none"
            />
          ) : result ? (
            result.compileError ? (
              <span className="text-rose-400 whitespace-pre-wrap">{result.compileError}</span>
            ) : (
              <>
                <span className="text-zinc-300 whitespace-pre-wrap">{result.output || "(no output)"}</span>
                {result.stderr && <span className="text-rose-400 whitespace-pre-wrap block mt-2">{result.stderr}</span>}
              </>
            )
          ) : (
            <span className="text-zinc-600">
              Run your code to see output here — this checks nothing, it just executes. Submit on Codeforces for
              the real verdict.
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <button
          onClick={handleRun}
          disabled={running}
          className="h-10 px-5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          {running ? "Running…" : "Run"}
        </button>
        <button
          onClick={handleCopy}
          className="h-10 px-5 rounded-lg border border-white/[0.08] hover:border-white/[0.16] bg-[#111116] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
        <span className="text-[9px] font-mono text-zinc-600 ml-auto">
          real compile + run via Wandbox, but no correctness check — submit on Codeforces to actually verify
        </span>
      </div>
    </div>
  );
};
