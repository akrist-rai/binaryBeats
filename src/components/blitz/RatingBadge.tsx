import React from "react";

// Mirrors Codeforces' own rating-color convention, tuned for a dark background.
// Used as a deliberate exception to the monochrome system: color here is domain
// vocabulary any Codeforces user reads instantly.
function colorForRating(rating: number): string {
  if (rating < 1200) return "#9ca3af";
  if (rating < 1400) return "#4ade80";
  if (rating < 1600) return "#22d3ee";
  if (rating < 1900) return "#60a5fa";
  if (rating < 2100) return "#c084fc";
  if (rating < 2400) return "#fb923c";
  return "#f87171";
}

interface RatingBadgeProps {
  rating: number | null | undefined;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className = "" }) => {
  if (rating == null) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-500 ${className}`}
      >
        UNRATED
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums ${className}`}
      style={{ color: colorForRating(rating) }}
    >
      {rating}
    </span>
  );
};
