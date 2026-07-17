# Binary Beats — Design Philosophy

**Scoreboard Brutalism.** Stadium-jumbotron / arcade-high-score-table energy,
chosen because the product's actual content — ranks, live timers, pass/fail
verdicts — maps directly onto a scoreboard metaphor. This is the second
full redesign of the app; it replaces the earlier "paper shell, glass
terminal core" system (warm cream + burnt-orange + a separate dark
terminal register) with a different set of first principles entirely, not
an iteration on it.

## The core idea

The old system ran two simultaneous registers — a calm light "paper" shell
for chrome, and a separate, always-dark "terminal" register for the code
editor — because paper and terminal were deliberately opposite polarities.

**That duality is gone.** Dark is the app's one primary register,
app-wide, not just inside the code editor. A jumbotron doesn't have a calm
mode and a live mode running side by side; the whole screen is the
scoreboard. Light mode still exists (inverted, via the theme toggle) but
dark is the default and the intended primary experience — `:root` carries
the dark values directly, `:root[data-theme='light']` overrides them
(the reverse of the old structure).

The code editor keeps its own theme-constant "code register"
(`--bb-code-*`), fixed dark in both app themes — but in dark mode it's
now identical to the app tokens by design. There's only one dark register
left; the code register just doesn't flip when the app around it goes
light, because code needs a stable reading surface regardless.

## Tokens

**Neutrals:**
- `--bb-ground: #0B0C0E` (dark) / `#F2F2ED` (light) — page background
- `--bb-surface: #16181C` / `#FFFFFF` — card/panel background
- `--bb-surface-2` — nested/hover surface
- `--bb-ink` / `--bb-ink-soft` / `--bb-ink-faint` — text, three weights
- `--bb-line` / `--bb-line-strong` — hairline / emphasized border
- `--bb-border-hard` — the sticker-shadow and focus-ring color (matches ink)

**Accent — exactly one loud color, app-wide, including inside code:**
- `--bb-yellow: #FFD400` — CTAs, links, active states, brand mark, and
  (unlike the old system, which had a second "neon" terminal accent) the
  code editor's keyword/cursor/live-indicator color too. One accent, no
  exceptions.
- `--bb-yellow-dim` / `--bb-yellow-fill` — hover/pressed and tint variants

**Status — scoreboard traffic lights, constant across both themes (a
stadium's colored bulbs don't change with daylight, and a verdict
shouldn't either):**
- `--bb-success: #35D46A` — AC
- `--bb-danger: #E8362B` — WA / RE / CE / destructive actions
- `--bb-warning: #FF9F1C` — TLE / pending / caution

**Documented exceptions — narrow, deliberate, not casual reuse of the palette:**
- **Rival identity** (`--bb-rival: #3AA0FF` / `#1D6FE0`) — Duel mode needs a
  second identity color to distinguish "me" from "the opponent." Scoped
  strictly to opponent-identity contexts: rival avatar ring/fill, rival's
  half of a scoreboard bar, a "watching" pulse dot. Never a general
  secondary brand color, and never used for anything decorative.
- **Codeforces rating color** (`ui/RatingBadge.tsx`'s `colorForRating()`) —
  the 7 Codeforces-standard rating bands (`#8C8371` Newbie →
  `#D6331E` Grandmaster), unchanged from the previous system. Domain
  vocabulary any Codeforces user reads instantly, independent of the app
  palette. Reused for problem-difficulty coloring everywhere a difficulty
  needs a color (`ProblemCard`, `SolveSidebar`, `ProblemOrbit`) instead of a
  bespoke 3-step ramp — that ramp used to collide with real status/rival
  colors (a "Hard" tag and a WA verdict could both read red).
- **Syntax highlighting** (`cppHighlight.ts` / `.syntax-*` classes) — a
  legible C++ highlighter needs more hue variety than the one-accent rule
  allows. Keywords use the app's one accent; strings/numbers/functions map
  onto success/warning/rival by loose editor convention; `type`/`builtin`
  keep two narrow, muted syntax-only hues that exist nowhere else in the
  app.

## Typography

- **Display — Big Shoulders Display.** Heavy, condensed, industrial —
  its heritage is literally Chicago municipal/skyscraper signage
  lettering. Ships a real 400–900 weight range, so it carries the entire
  heading hierarchy (h1 hero down to nav-active labels) without falling
  back to a second face at smaller sizes, the way a single-weight display
  face (Anton, Archivo Black) would have forced.
- **HUD numerals — Orbitron**, scoped tightly to `StatNumeral`/`Countdown`
  digits only (ratings, timers, scores, ranks) — never prose, labels, or
  buttons. It reads more "sci-fi dashboard" than "stadium LED board," so
  keeping it narrow lets that flavor register as "special instrument
  readout" instead of becoming the app's everyday voice.
- **Body — Inter.** Kept, unchanged — neutral, no reason to touch it.
- **Mono — JetBrains Mono.** Kept, and the old system's discipline of
  "every label/stat/timestamp/spec-value is mono" carries over unchanged —
  it fits a scoreboard's data-forward voice even better than it fit paper.

Fraunces (the old system's editorial serif-italic accent) is dropped
entirely — there's no elegant-warmth role left for it. Moments that used
to lean on italic serif (a duel's victory/defeat banner, empty states) now
get a boxed, bold `font-display` "stamp" treatment instead.

## Shape language

Brutalist: sharp corners almost everywhere (`rounded` = 4px, `rounded-sm`
= 2px — the hard cap), thick borders (1.5–2px), and **hard offset
"sticker" shadows** (`4px 4px 0 <color>`) instead of any blur. `rounded-full`
is reserved for actual circles — avatars, small status dots — never cards,
buttons, or tags.

No blur, anywhere. This is the biggest structural break from the old
system, which used blurred glow/shadow throughout its dark terminal
register (`card-glow-*`, `glow-text-*`, aurora-gradient backgrounds). All
of it is gone, replaced by flat status-color fills, thick borders, and
sticker shadows. The one narrow exception: a small functional
`shadowBlur` on `ProblemOrbit`'s hovered tile, which marks the exact
clickable target under the cursor — a pragmatic affordance, not
decoration, and everywhere else on the same board uses a crisp doubled-
square outline instead.

## Structural motifs

- **Numbered section eyebrows** — `/01 · PROBLEMS` style labels (the
  `Eyebrow` primitive). Carried over from the old system; fits the
  brutalist "systemized/cataloged" register even better than it fit paper.
- **Bracket frames** — `.bracket-frame`, a thicker two-corner
  viewfinder/broadcast-frame bracket (currentColor-driven, works in both
  the app and code registers). Replaces the old system's four-corner
  print/crop-mark motif — "framed monitor" fits a scoreboard better than
  "technical drawing."
- **Boxed `[TAGS]`** — the `Tag` primitive defaults to a bordered box, not
  a soft pill; an optional `bracket` prop wraps the label in literal `[ ]`
  characters for standalone status chips (verdicts, `[LIVE]`) — reserved
  for exactly that use, since wrapping every tag in a dense list would
  read as clutter. True pill radius survives only on round avatars.
- **Scoreboard grid** — `.scoreboard-grid`, a flat pixel-grid background
  texture, rendered once app-wide (`App.tsx`), replacing both the old
  paper "blueprint grid" and the old Blitz-only "arena" aurora-glow
  background — there's no longer a separate theatrical register for Blitz
  to have its own background at all.
- **Hazard stripes** — kept from the old system, retinted to
  `--bb-danger`; still reserved for one genuine danger zone (end-session
  confirmation), not decoration.
- **Grain/noise texture** — dropped. It was an analog/print/halftone
  device tied to the discarded paper system; a jumbotron's texture is
  pixels and LEDs, not film grain.

## Shared primitives (`src/components/ui/`)

A real architectural change alongside the visual one: every screen used to
hand-roll Tailwind utility strings against ad hoc CSS classes
(`.spec-card`, `.pill`, `.btn-primary`, `.eyebrow`...). Those are now
backed by actual React components — `Button`, `Panel`, `Tag`,
`VerdictBadge`, `StatNumeral`, `Countdown`, `Eyebrow`, `Divider`, plus
`RatingBadge` (moved here from `blitz/`, since six-plus files across three
folders were already consuming it like a shared primitive). `VerdictBadge`
and `TestGrid` both route through one `lib/verdictTone.ts` status→color
function — the old system had this logic independently hardcoded in five
different files, a real duplication bug this redesign fixed, not just a
cosmetic one.

## What NOT to do

- No blur — shadows are hard-offset "stickers," glows don't exist outside
  one documented functional exception.
- No more than one loud accent color per screen — yellow leads everywhere,
  including inside code; status colors and the rival exception are
  reserved for real semantic meaning, never decoration.
- No soft pill shapes on cards, buttons, panels, or dense tag lists —
  sharp corners are the default; `rounded-full` is for circles only.
- No reusing status/rival colors for anything that isn't an actual
  verdict or duel-opponent identity (this is precisely the bug the
  difficulty-color unification fixed — see the rating-color exception
  above).
- No italic serif, foil/laminate/glossy card textures, or rotated
  rubber-stamp effects — those were paper- and passport-card-specific
  devices with no role in a flat, LED-lit scoreboard.
