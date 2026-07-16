# Binary Beats — Design Philosophy

Synthesized from 55 moodboard references in `design/` (three independent passes,
cross-checked). This is the design system for the full redesign — every token and
pattern below is derived from a signal that repeated across the majority of the
board, not a one-off.

## The signal, distilled

Across all three batches, two things were true almost everywhere:

1. **Warm neutral "paper," never pure white or pure black.** Cream, ivory,
   parchment, warm greige recurred far more than `#fff`/`#000`/grey. Black ink
   text on warm paper, not dark-grey-on-white.
2. **Exactly one loud saturated accent against that neutral.** Never two or
   three competing brand colors — one confident hue doing all the work. The
   single most-repeated accent across all three batches was **burnt-orange /
   terracotta**, with **acid lime-green** and **electric blue** as the next most
   common signature accents.

Layered onto that neutral+accent formula, one typographic pairing showed up
constantly regardless of a piece's overall mood: **bold condensed grotesque
display type** for headlines, next to **small monospace type** used for
metadata, specs, coordinates, timestamps, hex codes — i.e. treating structural/
meta information as visible decorative content instead of hiding it.

A third recurring thread was **corner radius as a mood signal**: sharp corners
and hairline borders read as technical/serious (spec sheets, terminal readouts,
isometric diagrams, dotted-grid "blueprint" backgrounds); soft pill shapes and
generous radius read as friendly/product (tags, buttons, avatar chips). The
strongest boards used both, deliberately, in the same layout.

## Why this maps onto Binary Beats specifically

Binary Beats is a competitive-programming judge — problem statements, a real
C++ compiler, live session polling, rating math. The "industrial-technical
minimalism" register from the moodboard (isometric line art, spec tables,
monospace data chrome, dotted blueprint grids, numbered sections) is a natural
fit for a product whose actual content *is* specs, verdicts, and numbers. The
previous UI already leaned into a dark hacker-terminal identity; this redesign
keeps that instinct but relocates it: the **terminal becomes a component, not
the whole app**.

## Core decision: Paper shell, glass terminal core

The app shell — nav, hero, dashboard, cards, badges, marketing chrome — runs on
the **warm paper** register: cream background, ink-black text, one accent
color, sharp-ish cards with hairline borders. The **code editor, judge console,
and verdict output** run on a **dark glass terminal** register: near-black,
JetBrains Mono, lime glow — a literal "window into the machine" set inside the
paper layout, styled like the framed-browser-window and terminal-readout motifs
that recurred throughout the board. Corner radius tells you which register
you're in: 6–10px sharp cards outside, 12px soft "glass" panel inside.

This isn't a compromise between two moods — it's the single most consistent
device across the whole board: bounding a technical/dark artifact inside a
calmer, warmer frame.

## Tokens

**Paper (primary surface):**
- `--bb-paper: #F3EEE2` — page background
- `--bb-paper-raised: #FBF8F0` — card/surface background
- `--bb-ink: #17140F` — primary text, warm black (never pure `#000`)
- `--bb-ink-soft: #57503F` — secondary text
- `--bb-ink-faint: #8C8371` — tertiary/placeholder text
- `--bb-line: rgba(23,20,15,0.13)` — hairline border
- `--bb-line-strong: rgba(23,20,15,0.28)` — emphasized border

**Accents (used with strict hierarchy — orange leads, lime is a status color, blue is rare):**
- `--bb-orange: #E15A20` — primary accent: CTAs, links, active states, brand mark
- `--bb-orange-soft: #F3A468` — orange tint for hover fills/backgrounds
- `--bb-lime: #8FB537` — success / AC verdict / XP / streak (muted vs. the old
  neon `#c3f73a` so it reads on paper — full neon lime is reserved for the dark
  terminal register below)
- `--bb-blue: #2138C4` — rare tertiary accent: info, secondary links only
- `--bb-red: #C4402E` — error / WA / destructive

**Terminal (dark register — code editor, judge console, inset stat chips):**
- `--bb-term-bg: #14110C`
- `--bb-term-surface: #1D1811`
- `--bb-term-line: rgba(244,239,228,0.10)`
- `--bb-term-text: #F3EEE2`
- `--bb-term-acc: #C3F73A` — full neon lime lives here (this is the old brand
  color, kept exactly, now scoped to where it always made the most sense)
- `--bb-term-acc2: #35E8FF`

## Typography

- **Display/heading — Space Grotesk** (kept from before; bold 700–800, tight
  tracking, often upper-cased for eyebrows). Matches the "bold condensed
  grotesque" signal directly.
- **Editorial accent — Fraunces** (new; serif, italic-capable). Used sparingly
  for big emotive one-off statements — duel verdicts, empty states, session
  results — the same role elegant serif italics played against sans-driven
  layouts on the board.
- **Body — Inter** (kept).
- **Mono — JetBrains Mono** (kept, and leaned into harder). Every label, stat,
  timestamp, rating, section eyebrow, and spec value uses mono. This is the
  single most repeated device across the entire board and Binary Beats already
  had the right font loaded — it just wasn't used consistently enough.

## Structural motifs

- **Numbered section eyebrows** — `/01 · PROBLEMS` style labels above section
  headers. Recurring "cataloged/systemized" device.
- **Corner marks** — small L-shaped registration/crosshair marks on card
  corners in the paper register, nodding to print/technical-drawing crop marks.
- **Grid-paper texture** — faint blueprint grid behind hero/dashboard sections,
  masked so it fades at the edges.
- **Oversized numerals as graphics** — rating, XP, streak, stats are large bold
  mono numerals treated as hero visual elements, not just data.
- **Pills for status, sharp cards for structure** — difficulty tags, verdicts,
  rating badges: full pill radius. Containing cards/panels: 6–10px radius,
  hairline border, flat (no blur shadow) in the paper register.
- **Grain** — the existing SVG noise overlay is kept; it matches the grain/
  halftone texture that recurred throughout the board.

## What NOT to do

- No pure white/pure black surfaces — always the warm paper/ink pair.
- No more than one loud accent color per screen — orange leads, lime signals
  success/XP only, blue is reserved for rare secondary links.
- No blurred glow/shadow in the paper register — that effect is scoped to the
  dark terminal register only, where it reads as a CRT/screen glow instead of
  generic soft-UI drama.
- No decorative illustration beyond what's listed above — the board's strength
  was restraint plus one strong motif per piece, not maximalist collage.
