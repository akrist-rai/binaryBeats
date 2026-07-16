import React, { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitMathSegments } from "../../lib/mathText";
import { problemUrl } from "../../lib/codeforces";
import type { ProblemStatementData } from "../../lib/problemsApi";
import { RatingBadge } from "../blitz/RatingBadge";

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
  <div className="mb-5">
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-bb-term-text/35 block mb-1.5">{title}</span>
    <div className="text-[13px] text-bb-term-text/70">{children}</div>
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
      className="text-[9px] font-mono uppercase tracking-wider text-bb-term-text/35 hover:text-bb-term-acc transition-colors cursor-pointer shrink-0"
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
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar-dark bg-bb-term-surface [&_.katex]:text-current">
      {/* Sticky meta rail — constraints stay visible while the body scrolls beneath */}
      <div className="sticky top-0 z-10 px-5 pt-3.5 pb-3.5 border-b border-bb-term-line bg-bb-term-surface/95 backdrop-blur-sm">
        <span className="eyebrow-term mb-1.5">
          /01 <span className="text-bb-term-text/25 normal-case">·</span> Problem
        </span>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-bb-term-text/35 tabular-nums">
              {statement.contestId}
              {statement.index}
            </span>
            <h3 className="text-lg font-heading font-bold text-bb-term-text mt-1">{statement.title ?? "Untitled"}</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <RatingBadge rating={statement.rating} />
            {statement.timeLimitMs !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-bb-term-line text-bb-term-text/50">
                {statement.timeLimitMs / 1000}s
              </span>
            )}
            {statement.memoryLimitMb !== null && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-bb-term-line text-bb-term-text/50">
                {statement.memoryLimitMb}MB
              </span>
            )}
            {statement.judgeable && statement.testCount > 0 && (
              <span
                title="Submit compiles and runs your code against every one of these, right here"
                className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-bb-term-acc/25 bg-bb-term-acc/[0.06] text-bb-term-acc"
              >
                {statement.testCount} hidden tests
              </span>
            )}
          </div>
        </div>
        {statement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {statement.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-bb-term-line text-bb-term-text/45">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {figureOmitted && (
          <div className="mb-4 rounded border border-amber-400/25 bg-amber-400/10 px-3.5 py-2.5 text-xs font-mono text-amber-300">
            This statement references a figure that can't be shown here —{" "}
            <a href={problemUrl(statement)} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-200">
              view it on Codeforces ↗
            </a>
          </div>
        )}

        {statement.description && (
          <div className="mb-5 text-[13px] text-bb-term-text/70">
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
            <div className="flex flex-col gap-3">
              {statement.examples.map((ex, i) => (
                <div key={i} className="rounded border border-bb-term-line bg-bb-term-bg/40 overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-bb-term-line bg-bb-term-bg/60">
                    <span className="text-[9px] uppercase tracking-wider text-bb-term-text/35">Input {i + 1}</span>
                    <CopyButton text={ex.input} />
                  </div>
                  <pre className="px-3 py-2.5 text-bb-term-text/80 whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar-dark">{ex.input}</pre>
                  <div className="flex items-center justify-between px-3 py-1.5 border-y border-bb-term-line bg-bb-term-bg/60">
                    <span className="text-[9px] uppercase tracking-wider text-bb-term-text/35">Output {i + 1}</span>
                    <CopyButton text={ex.output} />
                  </div>
                  <pre className="px-3 py-2.5 text-bb-term-text/80 whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar-dark">{ex.output}</pre>
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
        <div className="mt-6 pt-3.5 border-t border-bb-term-line text-[10px] font-mono text-bb-term-text/35 leading-relaxed">
          Problem ©{" "}
          <a
            href={problemUrl(statement)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("click")}
            className="underline hover:text-bb-term-acc2 transition-colors"
          >
            Codeforces
          </a>{" "}
          — statement served locally via the{" "}
          <a
            href="https://huggingface.co/datasets/open-r1/codeforces"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-bb-term-acc2 transition-colors"
          >
            open-r1/codeforces
          </a>{" "}
          dataset (ODC-By 4.0).
        </div>
      </div>
    </div>
  );
};
