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
    <span className="label-caps block mb-2">{title}</span>
    <div className="text-sm text-bb-ink-soft">{children}</div>
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
      className="text-[9px] font-mono uppercase tracking-wider text-bb-ink-faint hover:text-bb-ink transition-colors cursor-pointer shrink-0"
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
    <div className="flex-1 min-h-[460px] spec-card p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5 pb-5 border-b border-bb-line">
        <div>
          <span className="label-caps">
            {statement.contestId}
            {statement.index}
          </span>
          <h3 className="text-2xl font-heading font-extrabold text-bb-ink mt-1">{statement.title ?? "Untitled"}</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statement.timeLimitMs !== null && (
            <span className="pill text-[10px] font-mono px-2 py-1 border border-bb-line bg-bb-paper text-bb-ink-soft">
              {statement.timeLimitMs / 1000}s
            </span>
          )}
          {statement.memoryLimitMb !== null && (
            <span className="pill text-[10px] font-mono px-2 py-1 border border-bb-line bg-bb-paper text-bb-ink-soft">
              {statement.memoryLimitMb}MB
            </span>
          )}
          <RatingBadge rating={statement.rating} />
        </div>
      </div>

      {figureOmitted && (
        <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-mono text-amber-800">
          This statement references a figure that can't be shown here —{" "}
          <a
            href={problemUrl(statement)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-950"
          >
            view it on Codeforces ↗
          </a>
        </div>
      )}

      {statement.description && (
        <div className="mb-6 text-sm text-bb-ink-soft">
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
              <div key={i} className="rounded-lg border border-bb-line bg-bb-paper overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 border-b border-bb-line bg-bb-paper-raised">
                  <span className="text-[10px] uppercase tracking-wider text-bb-ink-faint">Input {i + 1}</span>
                  <CopyButton text={ex.input} />
                </div>
                <pre className="px-4 py-3 text-bb-ink-soft whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar">{ex.input}</pre>
                <div className="flex items-center justify-between px-4 py-2 border-y border-bb-line bg-bb-paper-raised">
                  <span className="text-[10px] uppercase tracking-wider text-bb-ink-faint">Output {i + 1}</span>
                  <CopyButton text={ex.output} />
                </div>
                <pre className="px-4 py-3 text-bb-ink-soft whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar">{ex.output}</pre>
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
      <div className="mt-8 pt-4 border-t border-bb-line text-[10px] font-mono text-bb-ink-faint leading-relaxed">
        Problem ©{" "}
        <a
          href={problemUrl(statement)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound("click")}
          className="underline hover:text-bb-orange transition-colors"
        >
          Codeforces
        </a>{" "}
        — statement served locally via the{" "}
        <a
          href="https://huggingface.co/datasets/open-r1/codeforces"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-bb-orange transition-colors"
        >
          open-r1/codeforces
        </a>{" "}
        dataset (ODC-By 4.0).
      </div>
    </div>
  );
};
