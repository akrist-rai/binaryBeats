import React, { useState } from "react";
import { useCodeDraft } from "../../hooks/useCodeDraft";
import { runCode, type RunResult } from "../../lib/wandbox";

interface CodeWorkspaceProps {
  problemKey: string;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ problemKey }) => {
  const { draft, setCode, setStdin } = useCodeDraft(problemKey);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
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

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0a0a0f] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[#c3f73a]/25 bg-[#c3f73a]/5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#c3f73a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c3f73a]" />
          C++17
        </div>
        <span className="text-[9px] font-mono text-zinc-600">
          real compile + run via Wandbox — sample/custom input only, not the judge's tests
        </span>
      </div>

      <textarea
        value={draft.code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="w-full h-48 rounded-lg border border-white/[0.08] bg-[#111116] p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-white/[0.2] custom-scrollbar resize-y"
      />

      <textarea
        value={draft.stdin}
        onChange={(e) => setStdin(e.target.value)}
        placeholder="custom input (stdin) — optional"
        spellCheck={false}
        className="w-full h-16 rounded-lg border border-white/[0.08] bg-[#111116] p-3 text-xs font-mono text-zinc-400 placeholder-zinc-700 focus:outline-none focus:border-white/[0.2] resize-y"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleRun}
          disabled={running}
          className="h-9 px-4 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
        >
          {running ? "Running…" : "Run"}
        </button>
        <button
          onClick={handleCopy}
          className="h-9 px-4 rounded-lg border border-white/[0.08] hover:border-white/[0.16] bg-[#111116] text-[11px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy Code"}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-white/[0.08] bg-[#111116] p-3 font-mono text-xs whitespace-pre-wrap max-h-40 overflow-auto custom-scrollbar">
          {result.compileError ? (
            <span className="text-rose-400">{result.compileError}</span>
          ) : (
            <>
              <span className="text-zinc-300">{result.output || "(no output)"}</span>
              {result.stderr && <span className="text-rose-400 block mt-2">{result.stderr}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
};
