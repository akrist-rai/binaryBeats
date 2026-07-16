import React from "react";

// Mirrors Codeforces' own rating-color convention — kept as a deliberate
// exception to the one-accent design system: color here is domain vocabulary
// any Codeforces user reads instantly. Rendered as bold colored mono text with
// a status dot (not a bordered chip) so it reads correctly on both the paper
// and terminal registers.
function colorForRating(rating: number): string {
  if (rating < 1200) return "#8C8371";
  if (rating < 1400) return "#3FA34D";
  if (rating < 1600) return "#1AA6A0";
  if (rating < 1900) return "#2A5FE0";
  if (rating < 2100) return "#8B3FD6";
  if (rating < 2400) return "#E0821A";
  return "#D6331E";
}

interface RatingBadgeProps {
  rating: number | null | undefined;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className = "" }) => {
  if (rating == null) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-bb-ink-faint ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
        Unrated
      </span>
    );
  }

  const color = colorForRating(rating);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tabular-nums ${className}`}
      style={{ color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {rating}
    </span>
  );
};
