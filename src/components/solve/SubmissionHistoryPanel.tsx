import React from "react";
import type { SubmissionRecord } from "../../hooks/useSubmissionHistory";
import { VERDICT_DOT, VERDICT_LABEL, VERDICT_TEXT } from "./verdictStyles";

interface SubmissionHistoryPanelProps {
  history: SubmissionRecord[];
  onRestore: (code: string) => void;
}

function formatTime(seconds: number): string {
  const d = new Date(seconds * 1000);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const SubmissionHistoryPanel: React.FC<SubmissionHistoryPanelProps> = ({ history, onRestore }) => {
  if (history.length === 0) {
    return <span className="text-bb-term-text/40">Submit a solution to start building this problem's attempt history.</span>;
  }

  return (
    <div className="flex flex-col divide-y divide-dashed divide-bb-term-line">
      {history.map((r) => (
        <div key={r.id} className="group flex items-center gap-3 py-2 first:pt-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${VERDICT_DOT[r.status]}`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 w-8 ${VERDICT_TEXT[r.status]}`}>
            {r.status}
          </span>
          <span className="text-bb-term-text/50 text-[10px] shrink-0 hidden sm:inline">{VERDICT_LABEL[r.status]}</span>
          <span className="text-bb-term-text/35 text-[10px] tabular-nums shrink-0 ml-auto">
            {r.status !== "CE" ? `${r.passedCount}/${r.totalCount} · ` : ""}
            {r.timeMs}ms
            {r.peakMemoryMb !== undefined ? ` · ${r.peakMemoryMb}MB` : ""}
          </span>
          <span className="text-bb-term-text/30 text-[10px] tabular-nums shrink-0">{formatTime(r.submittedAtSeconds)}</span>
          <button
            onClick={() => onRestore(r.code)}
            className="text-[9px] font-mono uppercase tracking-wider text-bb-term-text/0 group-hover:text-bb-term-acc transition-colors cursor-pointer shrink-0"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  );
};
