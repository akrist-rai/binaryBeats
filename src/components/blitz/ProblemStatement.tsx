import React, { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitMathSegments } from "../../lib/mathText";
import { problemUrl } from "../../lib/codeforces";
import type { ProblemStatementData } from "../../lib/problemsApi";
import { RatingBadge } from "./RatingBadge";

interface ProblemStatementProps {
  statement: ProblemStatementData;
  playSound: (type: "click" | "hover") => void;
}

/** Renders statement text: plain segments as React text nodes, math via KaTeX.
 *  KaTeX escapes its input (and we keep its default trusted:false), so the
 *  rendered HTML is safe; dataset text itself never goes through innerHTML. */
const MathText: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((para, pi) => (
        <p key={pi} className="mb-3 last:mb-0 leading-relaxed whitespace-pre-wrap">
          {splitMathSegments(para).map((seg, si) =>
            seg.kind === "text" ? (
              <React.Fragment key={si}>{seg.value}</React.Fragment>
            ) : (
              <span
                key={si}
                className={seg.kind === "blockmath" ? "block my-2 text-center overflow-x-auto" : ""}
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(seg.value, {
                    throwOnError: false,
                    displayMode: seg.kind === "blockmath",
                  }),
                }}
              />
            )
          )}
        </p>
      ))}
    </>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase block mb-2">{title}</span>
    <div className="text-sm text-zinc-300">{children}</div>
  </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable — no-op
        }
      }}
      className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
    >
      {copied ? "copied ✓" : "copy"}
    </button>
  );
};

const hasFigure = (s: string | null) => s !== null && (/\[image\]/i.test(s) || /<img/i.test(s));

export const ProblemStatement: React.FC<ProblemStatementProps> = ({ statement, playSound }) => {
  const figureOmitted =
    hasFigure(statement.description) || hasFigure(statement.inputFormat) || hasFigure(statement.outputFormat) || hasFigure(statement.note);

  return (
    <div className="flex-1 min-h-[460px] rounded-xl border border-white/[0.08] bg-[#0c0c11] p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5 pb-5 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            {statement.contestId}
            {statement.index}
          </span>
          <h3 className="text-2xl font-heading font-extrabold text-white mt-1">{statement.title ?? "Untitled"}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statement.timeLimitMs !== null && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-white/[0.08] bg-white/[0.02] text-zinc-400">
              {statement.timeLimitMs / 1000}s
            </span>
          )}
          {statement.memoryLimitMb !== null && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border border-white/[0.08] bg-white/[0.02] text-zinc-400">
              {statement.memoryLimitMb}MB
            </span>
          )}
          <RatingBadge rating={statement.rating} />
        </div>
      </div>

      {figureOmitted && (
        <div className="mb-5 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-3.5 py-2.5 text-xs font-mono text-amber-200/80">
          This statement references a figure that can't be shown here —{" "}
          <a
            href={problemUrl(statement)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-100"
          >
            view it on Codeforces ↗
          </a>
        </div>
      )}

      {statement.description && (
        <div className="mb-6 text-sm text-zinc-300">
          <MathText text={statement.description} />
        </div>
      )}

      {statement.inputFormat && (
        <Section title="Input">
          <MathText text={statement.inputFormat} />
        </Section>
      )}

      {statement.outputFormat && (
        <Section title="Output">
          <MathText text={statement.outputFormat} />
        </Section>
      )}

      {statement.examples.length > 0 && (
        <Section title="Examples">
          <div className="flex flex-col gap-4">
            {statement.examples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.01]">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">Input {i + 1}</span>
                  <CopyButton text={ex.input} />
                </div>
                <pre className="px-4 py-3 text-zinc-300 whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar">{ex.input}</pre>
                <div className="flex items-center justify-between px-4 py-2 border-y border-white/[0.06] bg-white/[0.01]">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">Output {i + 1}</span>
                  <CopyButton text={ex.output} />
                </div>
                <pre className="px-4 py-3 text-zinc-300 whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar">{ex.output}</pre>
              </div>
            ))}
          </div>
        </Section>
      )}

      {statement.note && (
        <Section title="Note">
          <MathText text={statement.note} />
        </Section>
      )}

      {/* Attribution — required by the dataset's ODC-By 4.0 license */}
      <div className="mt-8 pt-4 border-t border-white/[0.06] text-[10px] font-mono text-zinc-600 leading-relaxed">
        Problem ©{" "}
        <a
          href={problemUrl(statement)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound("click")}
          className="underline hover:text-zinc-400 transition-colors"
        >
          Codeforces
        </a>{" "}
        — statement served locally via the{" "}
        <a
          href="https://huggingface.co/datasets/open-r1/codeforces"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-400 transition-colors"
        >
          open-r1/codeforces
        </a>{" "}
        dataset (ODC-By 4.0).
      </div>
    </div>
  );
};
