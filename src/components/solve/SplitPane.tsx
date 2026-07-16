import React, { useEffect, useRef, useState } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftLabel: string;
  rightLabel: string;
  /** localStorage key the drag ratio is persisted under. */
  storageKey: string;
  defaultRatio?: number;
  min?: number;
  max?: number;
}

/** Mirrors Tailwind's default `lg:` breakpoint — below it, the split collapses to tabs. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * Resizable statement|editor split, used by both Blitz and practice mode.
 * Below `lg:` it collapses to the app's existing tab-bar pattern instead of
 * cramming both panes — a real layout fallback, not just a squeeze.
 */
export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  leftLabel,
  rightLabel,
  storageKey,
  defaultRatio = 0.42,
  min = 0.28,
  max = 0.62,
}) => {
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<"left" | "right">("left");
  const [ratio, setRatio] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? Number(raw) : NaN;
      return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : defaultRatio;
    } catch {
      return defaultRatio;
    }
  });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = Math.min(max, Math.max(min, (e.clientX - rect.left) / rect.width));
      ratioRef.current = next;
      setRatio(next);
    };
    const handleUp = () => {
      setDragging(false);
      try {
        localStorage.setItem(storageKey, String(ratioRef.current));
      } catch {
        // ignore quota errors
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, min, max, storageKey]);

  if (!isDesktop) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1 h-9 border-b border-bb-term-line select-none shrink-0 bg-bb-term-surface px-1">
          {(["left", "right"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`h-full px-3.5 text-[11px] font-bold cursor-pointer border-b-2 flex items-center transition-all font-mono ${
                tab === id ? "border-b-bb-term-acc text-bb-term-text" : "border-transparent text-bb-term-text/40 hover:text-bb-term-text/70"
              }`}
            >
              {id === "left" ? leftLabel : rightLabel}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-h-0">{tab === "left" ? left : right}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex min-h-0 relative"
      style={{ cursor: dragging ? "col-resize" : undefined, userSelect: dragging ? "none" : undefined }}
    >
      <div className="flex flex-col min-h-0 overflow-hidden" style={{ width: `calc(${ratio * 100}% - 1px)` }}>
        {left}
      </div>
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        role="separator"
        aria-orientation="vertical"
        className={`w-[2px] shrink-0 cursor-col-resize relative group/divider transition-colors ${
          dragging ? "bg-bb-orange" : "bg-bb-term-line hover:bg-bb-term-text/25"
        }`}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div className="flex flex-col min-h-0 overflow-hidden flex-1">{right}</div>
    </div>
  );
};
