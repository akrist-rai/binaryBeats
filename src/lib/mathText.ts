// Splits dataset statement text into plain-text and LaTeX-math segments so the
// text parts can be rendered as React text nodes (never raw HTML) and only the
// math parts go through KaTeX.

export interface MathSegment {
  kind: "text" | "math" | "blockmath";
  value: string;
}

/**
 * Splits on $$...$$ (block math) first, then $...$ (inline math) within the
 * remaining text. `\$` escapes are respected; an unterminated delimiter is
 * treated as literal text.
 */
export function splitMathSegments(input: string): MathSegment[] {
  const out: MathSegment[] = [];

  const pushText = (t: string) => {
    if (t.length > 0) out.push({ kind: "text", value: t.replace(/\\\$/g, "$") });
  };

  let i = 0;
  let textStart = 0;

  const findDelim = (from: number, delim: string): number => {
    let pos = from;
    while (pos < input.length) {
      const idx = input.indexOf(delim, pos);
      if (idx === -1) return -1;
      if (input[idx - 1] === "\\") {
        pos = idx + 1;
        continue;
      }
      return idx;
    }
    return -1;
  };

  while (i < input.length) {
    if (input[i] === "$" && input[i - 1] !== "\\") {
      const isBlock = input.startsWith("$$", i);
      const delim = isBlock ? "$$" : "$";
      const close = findDelim(i + delim.length, delim);
      if (close === -1) {
        // unterminated — treat the rest as literal text
        i += delim.length;
        continue;
      }
      pushText(input.slice(textStart, i));
      const body = input.slice(i + delim.length, close);
      if (body.trim().length > 0) {
        out.push({ kind: isBlock ? "blockmath" : "math", value: body });
      }
      i = close + delim.length;
      textStart = i;
      continue;
    }
    i++;
  }
  pushText(input.slice(textStart));

  return out;
}
