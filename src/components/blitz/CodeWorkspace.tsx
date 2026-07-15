import React, { useState } from "react";
import { useCodeDraft } from "../../hooks/useCodeDraft";
import { LANGUAGE_META, runCode, type BlitzLanguage, type RunResult } from "../../lib/wandbox";

interface CodeWorkspaceProps {
  problemKey: string;
}

const LANGUAGES: BlitzLanguage[] = ["cpp", "python", "java"];

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ problemKey }) => {
  const { draft, setLanguage, setCode, setStdin } = useCodeDraft(problemKey);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    const r = await runCode(draft.language, draft.code, draft.stdin);
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
        <div className="flex rounded-lg border border-white/[0.08] bg-[#111116] p-0.5 font-mono text-[11px] gap-0.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                draft.language === lang ? "bg-white text-zinc-950 font-bold" : "text-zinc-500 hover:text-white"
              }`}
            >
              {LANGUAGE_META[lang].label}
            </button>
          ))}
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
