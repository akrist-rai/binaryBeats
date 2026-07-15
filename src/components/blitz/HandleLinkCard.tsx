import React, { useState } from "react";
import { motion } from "motion/react";

interface HandleLinkCardProps {
  validating: boolean;
  error: string | null;
  onLink: (handle: string) => void;
  playSound: (type: "click" | "hover") => void;
}

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
      className="max-w-xl mx-auto w-full rounded-xl border border-white/[0.08] bg-[#111116] p-8 text-center"
    >
      <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Step 01 — Connect</span>
      <h3 className="text-xl font-heading font-bold text-white mt-3 mb-2">Link your Codeforces handle</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
        No password, no OAuth — your public profile and submissions are all this needs to pick
        rating-matched problems and detect when you solve them.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="your codeforces handle"
          disabled={validating}
          className="w-full h-10 px-3.5 rounded-lg text-xs font-mono text-white bg-[#0a0a0f] placeholder-zinc-700 focus:outline-none border border-white/[0.08] focus:border-white/[0.2] transition-colors disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={submit}
          onMouseEnter={() => playSound("hover")}
          disabled={validating}
          className="shrink-0 w-full sm:w-auto px-5 h-10 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold font-mono text-[11px] uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer"
        >
          {validating ? "Checking…" : "Link Handle"}
        </motion.button>
      </div>

      {error && <p className="text-xs font-mono text-rose-400 mt-4">{error}</p>}
    </motion.div>
  );
};
