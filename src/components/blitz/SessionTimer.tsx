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
    <div className="rounded-lg border border-bb-term-line bg-bb-term-surface p-5 corner-marks-term flex flex-col items-center text-center">
      <span className="eyebrow-term mb-3 flex items-center gap-1.5">
        Elapsed
        {running && (
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-bb-term-acc animate-pulse-lime" />
            <span className="absolute -inset-1 rounded-full border border-bb-term-acc/50 animate-ping" />
          </span>
        )}
      </span>
      <span className="stat-num text-4xl text-bb-term-text leading-none glow-text-lime tabular-nums">
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
};
