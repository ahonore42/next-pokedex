import React, { useState, useRef, useEffect } from 'react';

// Stat order: clockwise from top
const STAT_ORDER = ['hp', 'attack', 'defense', 'speed', 'special-defense', 'special-attack'];

const STAT_ABBR: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  speed: 'Spe',
  'special-defense': 'SpD',
  'special-attack': 'SpA',
};

// Accepts any array with { stat: { name }, baseStat } — compatible with PokemonStats
export interface StatEntry {
  stat: { name: string };
  baseStat: number;
}

/**
 * Drag bounds for one stat axis.
 * minStat = computed stat at iv=0, ev=0
 * maxStat = computed stat at iv=31, ev=maxPossibleEV
 */
export interface StatDragInfo {
  minStat: number;
  maxStat: number;
}

function statToHex(value: number, colorMax: number): string {
  const pct = (value / colorMax) * 100;
  if (pct >= 60) return '#22c55e';
  if (pct >= 50) return '#84cc16';
  if (pct >= 40) return '#eab308';
  if (pct >= 25) return '#f97316';
  return '#ef4444';
}

function polarToXY(cx: number, cy: number, r: number, rad: number): [number, number] {
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

interface StatHexagonProps {
  stats: StatEntry[];
  size?: number;
  /** Extra class names forwarded to the <svg> element (e.g. "w-full h-auto"). */
  className?: string;
  /** Chart scaling ceiling — vertices reach edge at this value. Default: 260 (base stat max). */
  maxValue?: number;
  /** Denominator for colour thresholds. Default: 200. */
  colorMax?: number;
  /**
   * When provided, each vertex becomes a draggable handle constrained to the
   * range [minStat, maxStat] on its axis.  Must be in STAT_ORDER index order.
   */
  dragInfo?: StatDragInfo[];
  /** Called during drag. fraction is 0 = minStat position, 1 = maxStat position. */
  onDragStat?: (statIndex: number, fraction: number) => void;
}

export default function StatHexagon({
  stats,
  size = 260,
  className,
  maxValue = 260,
  colorMax = 200,
  dragInfo,
  onDragStat,
}: StatHexagonProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // useRef for synchronous access inside pointer handlers; useState for visual re-render
  const activeDragRef = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // Track rendered pixel width so font/dot sizes stay visually constant on CSS scaling
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setRenderedWidth(w);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  // renderScale > 1 when CSS makes the SVG wider than its viewBox size
  const renderScale = renderedWidth != null ? renderedWidth / size : 1;

  const isInteractive = !!(dragInfo && onDragStat);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  // Fixed visual sizes: divide viewBox units by renderScale so they stay ~constant in CSS pixels
  const fontSize = 10 / renderScale;
  const lineH = fontSize * 1.25;
  const labelR = radius + fontSize * 2.4;
  const dotR = 3 / renderScale;
  const hitR = 10 / renderScale;

  const statMap = Object.fromEntries(stats.map((s) => [s.stat.name, s.baseStat]));

  const statData = STAT_ORDER.map((name, i) => {
    const baseStat = statMap[name] ?? 0;
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
    return { name, baseStat, label: STAT_ABBR[name] ?? name, color: statToHex(baseStat, colorMax), angle };
  });

  const fullVerts = statData.map((s) => polarToXY(cx, cy, radius, s.angle));
  const statVerts = statData.map((s) =>
    polarToXY(cx, cy, Math.min(s.baseStat / maxValue, 1) * radius, s.angle),
  );

  // Pre-compute each axis's drag range as radii
  const dragRadii = dragInfo?.map((info) => ({
    rMin: Math.min(info.minStat / maxValue, 1) * radius,
    rMax: Math.min(info.maxStat / maxValue, 1) * radius,
  }));

  // ── Pointer handlers ───────────────────────────────────────────────────────

  const projectToAxis = (clientX: number, clientY: number, idx: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((clientX - rect.left) / rect.width) * size;
    const my = ((clientY - rect.top) / rect.height) * size;
    const angle = statData[idx].angle;
    // Dot product projects the mouse offset onto the axis direction
    return (mx - cx) * Math.cos(angle) + (my - cy) * Math.sin(angle);
  };

  const onPointerDown = (e: React.PointerEvent<SVGCircleElement>, idx: number) => {
    if (!dragRadii) return;
    const { rMin, rMax } = dragRadii[idx];
    if (rMax <= rMin) return; // nothing to drag
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    activeDragRef.current = idx;
    setDraggingIdx(idx);
  };

  const onPointerMove = (e: React.PointerEvent<SVGCircleElement>, idx: number) => {
    if (activeDragRef.current !== idx || !dragRadii || !onDragStat) return;
    const { rMin, rMax } = dragRadii[idx];
    const dot = projectToAxis(e.clientX, e.clientY, idx);
    const clamped = Math.max(rMin, Math.min(rMax, dot));
    const fraction = (clamped - rMin) / (rMax - rMin);
    onDragStat(idx, fraction);
  };

  const onPointerUp = (idx: number) => {
    if (activeDragRef.current === idx) {
      activeDragRef.current = null;
      setDraggingIdx(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Stat hexagon chart"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {statData.map((s, i) => {
          const next = statData[(i + 1) % 6];
          const [x1, y1] = fullVerts[i];
          const [x2, y2] = fullVerts[(i + 1) % 6];
          return (
            <linearGradient
              key={i}
              id={`shex-grad-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={x1} y1={y1} x2={x2} y2={y2}
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.82} />
              <stop offset="100%" stopColor={next.color} stopOpacity={0.82} />
            </linearGradient>
          );
        })}
      </defs>

      {/* Background grid rings */}
      {gridRings.map((pct) => {
        const pts = statData
          .map((s) => { const [x, y] = polarToXY(cx, cy, radius * pct, s.angle); return `${x},${y}`; })
          .join(' ');
        return (
          <polygon key={pct} points={pts} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
        );
      })}

      {/* Axis lines */}
      {fullVerts.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
      ))}

      {/* Drag tracks — visible range along each axis */}
      {isInteractive && dragRadii && statData.map((s, i) => {
        const { rMin, rMax } = dragRadii[i];
        if (rMax <= rMin) return null;
        const [x1, y1] = polarToXY(cx, cy, rMin, s.angle);
        const [x2, y2] = polarToXY(cx, cy, rMax, s.angle);
        // Tick mark direction: perpendicular to axis
        const perpX = -Math.sin(s.angle);
        const perpY = Math.cos(s.angle);
        const tickLen = 4;
        return (
          <g key={`track-${i}`}>
            {/* Track line */}
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={s.color} strokeOpacity={0.3} strokeWidth={4} strokeLinecap="round"
            />
            {/* Min tick */}
            <line
              x1={x1 - perpX * tickLen} y1={y1 - perpY * tickLen}
              x2={x1 + perpX * tickLen} y2={y1 + perpY * tickLen}
              stroke={s.color} strokeOpacity={0.5} strokeWidth={1.5} strokeLinecap="round"
            />
            {/* Max tick */}
            <line
              x1={x2 - perpX * tickLen} y1={y2 - perpY * tickLen}
              x2={x2 + perpX * tickLen} y2={y2 + perpY * tickLen}
              stroke={s.color} strokeOpacity={0.5} strokeWidth={1.5} strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Stat area — 6 sectors */}
      {statData.map((_, i) => {
        const [x1, y1] = statVerts[i];
        const [x2, y2] = statVerts[(i + 1) % 6];
        return (
          <polygon key={i} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill={`url(#shex-grad-${i})`} />
        );
      })}

      {/* Stat area border */}
      <polygon
        points={statVerts.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none" stroke="white" strokeOpacity={0.55} strokeWidth={1.5} strokeLinejoin="round"
      />

      {/* Vertex dots (always small) + invisible hit area when draggable */}
      {statVerts.map(([vx, vy], i) => {
        const canDrag = isInteractive && !!dragRadii && dragRadii[i].rMax > dragRadii[i].rMin;
        const isDragging = draggingIdx === i;
        return (
          <g key={i}>
            {/* Visible dot — fixed visual size regardless of CSS scaling */}
            <circle
              cx={vx} cy={vy} r={dotR}
              fill={statData[i].color}
              stroke="white"
              strokeOpacity={0.7}
              strokeWidth={1 / renderScale}
              style={{ pointerEvents: 'none' }}
            />
            {/* Invisible hit area — only rendered when draggable */}
            {canDrag && (
              <circle
                cx={vx} cy={vy} r={hitR}
                fill="transparent"
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={(e) => onPointerDown(e, i)}
                onPointerMove={(e) => onPointerMove(e, i)}
                onPointerUp={() => onPointerUp(i)}
                onPointerCancel={() => onPointerUp(i)}
              />
            )}
          </g>
        );
      })}

      {/* Labels */}
      {statData.map((s, i) => {
        const [lx, ly] = polarToXY(cx, cy, labelR, s.angle);
        const deg = (s.angle * 180) / Math.PI;
        const anchor: React.SVGAttributes<SVGTextElement>['textAnchor'] =
          deg > -60 && deg < 60 ? 'start' : deg > 120 || deg < -120 ? 'end' : 'middle';
        const sin = Math.sin(s.angle);
        const vShift = sin < -0.7 ? -lineH * 0.5 : sin > 0.7 ? lineH * 0.5 : 0;
        const y1 = ly + vShift - lineH * 0.5;
        const y2 = ly + vShift + lineH * 0.6;
        return (
          <g key={i}>
            <text x={lx} y={y1} textAnchor={anchor} fontSize={fontSize} fontWeight={600} fill="currentColor" opacity={0.75}>
              {s.label}
            </text>
            <text x={lx} y={y2} textAnchor={anchor} fontSize={fontSize * 0.95} fontWeight={700} fill={s.color}>
              {s.baseStat}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
