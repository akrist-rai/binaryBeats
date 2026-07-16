import React, { useMemo } from "react";

/**
 * Decorative deterministic "barcode" of a string — the spec-sheet/shipping-
 * label motif reused across the solve workspace (editor tab, verdict stamp,
 * header serial). Purely visual; no data is actually encoded.
 */
export const Barcode: React.FC<{ value: string; bars?: number; height?: number; className?: string }> = ({
  value,
  bars: barCount = 20,
  height = 12,
  className,
}) => {
  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    return Array.from({ length: barCount }, () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return (seed >>> 16) % 3 === 0 ? 2 : 1;
    });
  }, [value, barCount]);
  const width = bars.reduce((a, b) => a + b + 1, 0);
  let x = 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      {bars.map((w, i) => {
        const rect = <rect key={i} x={x} y={0} width={w} height={height} fill="currentColor" />;
        x += w + 1;
        return rect;
      })}
    </svg>
  );
};
