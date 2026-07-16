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
      className="max-w-2xl mx-auto w-full rounded-2xl border border-[#c3f73a]/15 bg-[#111116] p-10 text-center glow-acc"
    >
      <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Codeforces Arena</span>
      <h3 className="text-3xl font-heading font-extrabold gradient-text-cool mt-3 mb-3">
        Link your Codeforces handle
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-8">
        No password, no OAuth — your public profile and submissions are all this needs to pick
        rating-matched problems and detect when you solve them.
      </p>

      <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <span className="text-[9px] font-mono text-zinc-600">{s.n}</span>
            <div className="text-xs font-bold text-white mt-1">{s.label}</div>
            <div className="text-[9px] font-mono text-zinc-600 mt-1 leading-relaxed">{s.desc}</div>
          </div>
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
          className="w-full h-11 px-4 rounded-lg text-xs font-mono text-white bg-[#0a0a0f] placeholder-zinc-700 focus:outline-none border border-white/[0.08] focus:border-white/[0.2] transition-colors disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={submit}
          onMouseEnter={() => playSound("hover")}
          disabled={validating}
          className="shrink-0 w-full sm:w-auto px-6 h-11 rounded-lg bg-[#c3f73a] hover:bg-[#b0e230] text-black font-bold font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer"
        >
          {validating ? "Checking…" : "Link Handle"}
        </motion.button>
      </div>

      {error && <p className="text-xs font-mono text-rose-400 mt-4">{error}</p>}
    </motion.div>
  );
};
