import React, { useEffect, useState } from "react";
import { Panel } from "../ui/Panel";
import { Eyebrow } from "../ui/Eyebrow";
import { Countdown } from "../ui/Countdown";

interface SessionTimerProps {
  startedAtSeconds: number;
  running: boolean;
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
    <Panel bracket className="p-5 flex flex-col items-center text-center">
      <Eyebrow className="mb-3 flex items-center gap-1.5">
        Elapsed
        {running && (
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-bb-yellow animate-pulse-accent" />
            <span className="absolute -inset-1 rounded-full border border-bb-yellow/50 animate-ping" />
          </span>
        )}
      </Eyebrow>
      <Countdown seconds={elapsed} blink={running} className="text-4xl text-bb-ink leading-none" />
    </Panel>
  );
};
