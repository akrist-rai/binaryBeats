import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Problem } from "../hooks/useProblems";
import { fetchOrbitProblems, ORBIT_RINGS } from "../lib/orbitData";

interface ProblemOrbitProps {
  solvedKeys: string[];
  onOpen: (key: string) => void;
  playSound: (t: "click" | "hover") => void;
}

interface OrbitNode {
  problem: Problem;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  floatAmp: number;
  floatSpeed: number;
  r: number;
}

const RING_INNER = 70;
const RING_WIDTH = 78;
const NODE_R = 4.2;
const SPRING_K = 22;
const DAMPING = 0.9;
const REPEL_RADIUS = 46;
const REPEL_STRENGTH = 1600;
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 2.6;
const DRAG_THRESHOLD = 5;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function tierColor(rating: number | null, palette: Palette): string {
  if (rating == null) return palette.inkFaint;
  if (rating <= 1300) return palette.lime;
  if (rating <= 1900) return palette.orange;
  return palette.red;
}

interface Palette {
  paper: string;
  ink: string;
  inkFaint: string;
  line: string;
  lineStrong: string;
  orange: string;
  lime: string;
  red: string;
  blue: string;
}

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const g = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    paper: g("--bb-paper", "#F3EEE2"),
    ink: g("--bb-ink", "#17140F"),
    inkFaint: g("--bb-ink-faint", "#8C8371"),
    line: g("--bb-line", "rgba(23,20,15,0.13)"),
    lineStrong: g("--bb-line-strong", "rgba(23,20,15,0.28)"),
    orange: g("--bb-orange", "#E15A20"),
    lime: g("--bb-lime", "#8FB537"),
    red: g("--bb-red", "#C4402E"),
    blue: g("--bb-blue", "#2138C4"),
  };
}

function ringRadius(index: number): number {
  return RING_INNER + index * RING_WIDTH;
}

export const ProblemOrbit: React.FC<ProblemOrbitProps> = ({ solvedKeys, onOpen, playSound }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<OrbitNode[]>([]);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.62 });
  const mouseScreenRef = useRef({ x: -9999, y: -9999 });
  const mouseWorldRef = useRef({ x: -9999, y: -9999 });
  const dragRef = useRef({ down: false, dragging: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const solvedSetRef = useRef(new Set(solvedKeys));
  const hoveredRef = useRef<OrbitNode | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [hovered, setHovered] = useState<Problem | null>(null);

  useEffect(() => {
    solvedSetRef.current = new Set(solvedKeys);
  }, [solvedKeys]);

  useEffect(() => {
    let cancelled = false;
    fetchOrbitProblems().then((p) => {
      if (!cancelled) setProblems(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const nextUpKey = useMemo(() => {
    if (!problems) return null;
    return problems.find((p) => !solvedKeys.includes(p.key))?.key ?? null;
  }, [problems, solvedKeys]);

  // Build the static orbital layout once problems arrive: radius encodes
  // rating (your progression outward from center), angle clusters by topic
  // (a stable hash of the primary tag), with jitter so a topic reads as a
  // loose constellation rather than a single spoke.
  useEffect(() => {
    if (!problems) return;
    nodesRef.current = problems.map((p) => {
      let ringIdx = ORBIT_RINGS.length - 1;
      for (let i = 0; i < ORBIT_RINGS.length; i++) {
        if ((p.rating ?? 0) <= ORBIT_RINGS[i].max) { ringIdx = i; break; }
      }
      const ring = ORBIT_RINGS[ringIdx];
      const t = Math.max(0, Math.min(1, ((p.rating ?? ring.min) - ring.min) / (ring.max - ring.min || 1)));
      const radius = ringRadius(ringIdx) + t * RING_WIDTH * 0.82 + RING_WIDTH * 0.09;

      const tag = p.tags[0] ?? "misc";
      const baseAngle = (hashStr(tag) % 3600) / 3600 * Math.PI * 2;
      const jitter = ((hashStr(p.key) % 1000) / 1000 - 0.5) * (Math.PI / 5);
      const angle = baseAngle + jitter;

      const baseX = Math.cos(angle) * radius;
      const baseY = Math.sin(angle) * radius;
      const seed = hashStr(p.key + "seed");

      return {
        problem: p,
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        vx: 0,
        vy: 0,
        phase: (seed % 628) / 100,
        floatAmp: 3 + (seed % 400) / 100,
        floatSpeed: 0.35 + (seed % 250) / 1000,
        r: NODE_R,
      };
    });
  }, [problems]);

  // Resize handling — canvas is DPR-scaled for crisp rendering at any zoom.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { w: rect.width, h: rect.height };
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // The animation loop — idle floating + mouse-repel spring physics, then a
  // full redraw every frame. Positions live in refs, never React state, so
  // this runs at display refresh rate without triggering re-renders.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const { w, h } = sizeRef.current;
      const cam = cameraRef.current;
      const mouseWorld = mouseWorldRef.current;
      const nodes = nodesRef.current;

      for (const n of nodes) {
        const floatX = Math.cos(t * n.floatSpeed + n.phase) * n.floatAmp;
        const floatY = Math.sin(t * n.floatSpeed * 1.3 + n.phase) * n.floatAmp;
        const targetX = n.baseX + floatX;
        const targetY = n.baseY + floatY;

        let ax = (targetX - n.x) * SPRING_K;
        let ay = (targetY - n.y) * SPRING_K;

        // A hovered node parts from nearby neighbors but settles into a calm
        // "eye" right under the cursor instead of fleeing it forever — without
        // this deadzone, hovering a star pushes it just far enough to dodge
        // the very click meant to open it.
        const dx = n.x - mouseWorld.x;
        const dy = n.y - mouseWorld.y;
        const dist = Math.hypot(dx, dy);
        const REPEL_DEADZONE = n.r * 2.5;
        if (dist < REPEL_RADIUS && dist > REPEL_DEADZONE) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          ax += (dx / dist) * force;
          ay += (dy / dist) * force;
        }

        n.vx = (n.vx + ax * dt) * DAMPING;
        n.vy = (n.vy + ay * dt) * DAMPING;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 + cam.x, h / 2 + cam.y);
      ctx.scale(cam.zoom, cam.zoom);

      const pal = readPalette();

      // Rings + labels
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < ORBIT_RINGS.length; i++) {
        const r = ringRadius(i) + RING_WIDTH;
        ctx.beginPath();
        ctx.setLineDash([2, 6]);
        ctx.lineWidth = 1 / cam.zoom;
        ctx.strokeStyle = pal.lineStrong;
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `700 ${11 / cam.zoom}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = pal.inkFaint;
        ctx.fillText(
          `${ORBIT_RINGS[i].label.toUpperCase()} · ${ORBIT_RINGS[i].min}–${ORBIT_RINGS[i].max}`,
          0,
          -r + 12 / cam.zoom
        );
      }

      // Center "home" node
      ctx.beginPath();
      ctx.arc(0, 0, 9 / cam.zoom, 0, Math.PI * 2);
      ctx.fillStyle = pal.ink;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 15 / cam.zoom, 0, Math.PI * 2);
      ctx.strokeStyle = pal.lineStrong;
      ctx.lineWidth = 1 / cam.zoom;
      ctx.stroke();

      // Nodes
      let hoveredNode: OrbitNode | null = null;
      const hitThreshold = 10 / cam.zoom;
      let closestDist = Infinity;

      for (const n of nodes) {
        const solved = solvedSetRef.current.has(n.problem.key);
        const isNext = n.problem.key === nextUpKey;
        const dx = n.x - mouseWorld.x;
        const dy = n.y - mouseWorld.y;
        const d = Math.hypot(dx, dy);
        const isHover = d < hitThreshold + n.r;
        if (isHover && d < closestDist) {
          closestDist = d;
          hoveredNode = n;
        }

        const color = solved ? pal.lime : isNext ? pal.orange : tierColor(n.problem.rating, pal);
        const radius = (isHover ? n.r * 1.9 : n.r) / 1;

        if (solved || isNext || isHover) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = (isNext ? 16 : 10) / cam.zoom;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = solved ? color : isNext ? color : pal.paper;
        ctx.globalAlpha = solved || isNext || isHover ? 1 : 0.85;
        ctx.fill();
        ctx.lineWidth = (isHover ? 2 : 1.3) / cam.zoom;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1;
        ctx.stroke();

        if (solved || isNext || isHover) ctx.restore();
      }

      ctx.restore();

      if (hoveredNode !== hoveredRef.current) {
        hoveredRef.current = hoveredNode;
        setHovered(hoveredNode ? hoveredNode.problem : null);
      }

      if (tooltipRef.current) {
        const m = mouseScreenRef.current;
        tooltipRef.current.style.transform = `translate(${m.x + 16}px, ${m.y + 16}px)`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextUpKey]);

  const toWorld = (sx: number, sy: number) => {
    const { w, h } = sizeRef.current;
    const cam = cameraRef.current;
    return { x: (sx - w / 2 - cam.x) / cam.zoom, y: (sy - h / 2 - cam.y) / cam.zoom };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    mouseScreenRef.current = { x: sx, y: sy };
    mouseWorldRef.current = toWorld(sx, sy);

    if (dragRef.current.down) {
      const ddx = e.clientX - dragRef.current.startX;
      const ddy = e.clientY - dragRef.current.startY;
      if (!dragRef.current.dragging && Math.hypot(ddx, ddy) > DRAG_THRESHOLD) {
        dragRef.current.dragging = true;
      }
      if (dragRef.current.dragging) {
        cameraRef.current.x = dragRef.current.camX + ddx;
        cameraRef.current.y = dragRef.current.camY + ddy;
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    console.log('[orbit debug] pointerdown', e.target, hoveredRef.current?.problem.key);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      down: true,
      dragging: false,
      startX: e.clientX,
      startY: e.clientY,
      camX: cameraRef.current.x,
      camY: cameraRef.current.y,
    };
  };

  const handlePointerUp = () => {
    console.log('[orbit debug] pointerup', dragRef.current.dragging, hoveredRef.current?.problem.key);
    const wasDragging = dragRef.current.dragging;
    dragRef.current.down = false;
    dragRef.current.dragging = false;
    if (!wasDragging && hoveredRef.current) {
      playSound("click");
      onOpen(hoveredRef.current.problem.key);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const before = toWorld(sx, sy);
    const cam = cameraRef.current;
    const factor = Math.exp(-e.deltaY * 0.0012);
    cam.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.zoom * factor));
    const { w, h } = sizeRef.current;
    cam.x = sx - w / 2 - before.x * cam.zoom;
    cam.y = sy - h / 2 - before.y * cam.zoom;
  };

  const handleMouseLeave = () => {
    mouseWorldRef.current = { x: -99999, y: -99999 };
  };

  const prevHoveredKey = useRef<string | null>(null);
  useEffect(() => {
    if (hovered && hovered.key !== prevHoveredKey.current) playSound("hover");
    prevHoveredKey.current = hovered?.key ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  const diffLabel = (r: number | null) => (!r ? "Unrated" : r <= 1300 ? "Easy" : r <= 1900 ? "Medium" : "Hard");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="eyebrow">Circular Roadmap · drag to pan · scroll to zoom · click a star to solve</span>
        {problems && (
          <span className="text-[10px] font-mono text-bb-ink-faint tabular-nums">
            {problems.length.toLocaleString()} problems mapped across the full rating range
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[640px] spec-card corner-marks overflow-hidden select-none"
        style={{ cursor: hovered ? "pointer" : "grab" }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 grid-paper pointer-events-none" />
        <canvas ref={canvasRef} className="absolute inset-0" />

        {!problems && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="label-caps"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              Charting the galaxy…
            </motion.span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 pointer-events-none">
          <span className="flex items-center gap-1.5 text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-bb-lime" /> Solved
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-bb-orange" /> Next up
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-mono text-bb-ink-faint uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full border border-bb-line-strong bg-bb-paper" /> Unsolved
          </span>
        </div>

        {/* Cursor-following tooltip — positioned imperatively via ref for 60fps tracking */}
        <div
          ref={tooltipRef}
          className="absolute top-0 left-0 pointer-events-none z-20 transition-opacity duration-100"
          style={{ opacity: hovered ? 1 : 0, willChange: "transform" }}
        >
          {hovered && (
            <div className="spec-card px-3 py-2.5 max-w-[220px] shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono text-bb-ink-faint tabular-nums">
                  {hovered.contestId}{hovered.index}
                </span>
                <span className="pill text-[8px] font-mono px-1.5 py-0.5 border border-bb-line text-bb-ink-faint">
                  {diffLabel(hovered.rating)}
                </span>
              </div>
              <div className="text-xs font-bold text-bb-ink leading-snug mb-1">{hovered.title ?? hovered.key}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-bb-ink-faint">
                <span>{hovered.tags.slice(0, 2).join(" · ") || "misc"}</span>
                <span className="tabular-nums">{hovered.rating ?? "—"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
