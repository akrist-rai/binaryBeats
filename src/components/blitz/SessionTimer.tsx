import React, { useEffect, useState } from "react";

interface SessionTimerProps {
  startedAtSeconds: number;
  running: boolean;
}

function formatElapsed(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ startedAtSeconds, running }) => {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = Math.max(0, now - startedAtSeconds);

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-600 mb-1">Elapsed</span>
      <span className="text-3xl font-mono font-black text-[#c3f73a] leading-none tabular-nums">
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
};
