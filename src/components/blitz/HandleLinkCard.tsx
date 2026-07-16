import React, { useState } from "react";
import { motion } from "motion/react";

interface HandleLinkCardProps {
  validating: boolean;
  error: string | null;
  onLink: (handle: string) => void;
  playSound: (type: "click" | "hover") => void;
}

const STEPS = [
  { n: "01", label: "Link", desc: "your public Codeforces handle" },
  { n: "02", label: "Draw", desc: "a rating-matched problem set" },
  { n: "03", label: "Solve", desc: "on codeforces.com — we watch for it" },
];

export const HandleLinkCard: React.FC<HandleLinkCardProps> = ({ validating, error, onLink, playSound }) => {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || validating) return;
    playSound("click");
    onLink(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full rounded-lg border border-bb-term-line bg-bb-term-surface corner-marks-term overflow-hidden p-10 text-center"
    >
      <span className="eyebrow-term">Codeforces Arena</span>
      <h3 className="editorial text-3xl text-bb-term-text mt-3 mb-3">
        Link your Codeforces handle
      </h3>
      <p className="text-sm text-bb-term-text/55 leading-relaxed max-w-md mx-auto mb-8">
        No password, no OAuth — your public profile and submissions are all this needs to pick
        rating-matched problems and detect when you solve them.
      </p>

      <div className="flex items-stretch justify-center gap-1.5 sm:gap-2.5 max-w-lg mx-auto mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex-1 rounded-lg border border-bb-term-line bg-bb-term-bg/40 p-3 text-left">
              <span className="text-[9px] font-mono font-bold text-bb-term-acc">{s.n}</span>
              <div className="text-xs font-bold text-bb-term-text mt-1">{s.label}</div>
              <div className="text-[9px] font-mono text-bb-term-text/40 mt-1 leading-relaxed">{s.desc}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div aria-hidden="true" className="flex items-center shrink-0 text-bb-term-text/20 text-xs select-none">
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="your codeforces handle"
          disabled={validating}
          className="w-full h-11 px-4 rounded-lg text-xs font-mono text-bb-term-text bg-bb-term-bg placeholder-bb-term-text/30 focus:outline-none border border-bb-term-line focus:border-bb-term-text/25 transition-colors disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={submit}
          onMouseEnter={() => playSound("hover")}
          disabled={validating}
          className="shrink-0 w-full sm:w-auto px-6 h-11 rounded-full bg-bb-term-acc text-bb-term-bg hover:brightness-110 font-bold font-mono text-[11px] uppercase tracking-wider disabled:opacity-60 cursor-pointer transition-all"
        >
          {validating ? "Checking…" : "Link Handle"}
        </motion.button>
      </div>

      {error && <p className="text-xs font-mono text-[#ff5c5c] mt-4">{error}</p>}
    </motion.div>
  );
};
