import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ArrowKind,
  Coverage,
  Point,
  Responsibility,
  ZoneKind,
} from "../../types/coverages";
import type { Formation, RenderedPlayer } from "../../types/formations";
import type { GlossaryTerm } from "../../types/glossary";
import { createAutoLinkedText } from "../../lib/autoLink";
import { LOS_X } from "../../lib/fieldConstants";
import { assignStableSlots } from "../../lib/assignStableSlots";
import PlayerDot from "./PlayerDot";
import ShareButton from "../ShareButton";
import { FieldBackground } from "./FieldBackground";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const OFFENSE_OPACITY = 0.55;

const ZONE_STYLES: Record<ZoneKind, { color: string; label: string }> = {
  deep: { color: "#3b82f6", label: "Deep Zone" },
  hook: { color: "#eab308", label: "Hook / Curl" },
  flat: { color: "#8b5cf6", label: "Flat" },
};

interface ArrowStyle {
  color: string;
  label: string;
  strokeWidth: number;
  markerId: string;
  defaultLineLabel: string | null;
}

const ARROW_STYLES: Record<ArrowKind, ArrowStyle> = {
  man: {
    color: "#ef4444",
    label: "Man Coverage",
    strokeWidth: 2.5,
    markerId: "arrowhead-man",
    defaultLineLabel: null,
  },
  blitz: {
    color: "#f97316",
    label: "Blitz / Rush",
    strokeWidth: 4,
    markerId: "arrowhead-blitz",
    defaultLineLabel: "BLITZ",
  },
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface CoverageViewProps {
  coverage: Coverage;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  offensiveFormationOverride: string | null;
  defensiveFormationOverride: string | null;
  onOffensiveFormationChange: (id: string | null) => void;
  onDefensiveFormationChange: (id: string | null) => void;
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function CoverageView({
  coverage,
  formations,
  glossaryTerms,
  offensiveFormationOverride,
  defensiveFormationOverride,
  onOffensiveFormationChange,
  onDefensiveFormationChange,
  onSelectFormation,
  onSelectTerm,
}: CoverageViewProps) {
  /* ---------- Effective formation IDs ---------- */
  const effectiveDefId =
    defensiveFormationOverride ?? coverage.defensiveFormationId;
  const effectiveOffId =
    offensiveFormationOverride ?? coverage.offensiveFormationId;

  /* ---------- Formation lookups ---------- */
  const defensiveFormation = formations.find((f) => f.id === effectiveDefId);
  const offensiveFormation = formations.find((f) => f.id === effectiveOffId);
  const defaultDefFormation = formations.find(
    (f) => f.id === coverage.defensiveFormationId,
  );
  const defaultOffFormation = formations.find(
    (f) => f.id === coverage.offensiveFormationId,
  );

  /* ---------- Formation lists for dropdowns ---------- */
  const defensiveFormations = useMemo(
    () => formations.filter((f) => f.category === "defensive"),
    [formations],
  );
  const offensiveFormations = useMemo(
    () => formations.filter((f) => f.category === "offensive"),
    [formations],
  );

  /* ---------- Raw player positions ---------- */
  const rawDefenders: RenderedPlayer[] = useMemo(() => {
    if (!defensiveFormation) return [];
    const overrides = coverage.alignments ?? {};
    return defensiveFormation.players.map((p) => {
      const o = overrides[p.key];
      return {
        ...p,
        x: o?.x ?? p.x,
        y: o?.y ?? p.y,
        opacity: 1,
      };
    });
  }, [defensiveFormation, coverage.alignments]);

  const rawOffenders: RenderedPlayer[] = useMemo(() => {
    if (!offensiveFormation) return [];
    return offensiveFormation.players.map((p) => ({
      ...p,
      x: 2 * LOS_X - p.x,
      opacity: OFFENSE_OPACITY,
    }));
  }, [offensiveFormation]);

  /* ---------- Stable-slot assignment for smooth transitions ---------- */
  const prevDefRef = useRef<RenderedPlayer[] | null>(null);
  const prevOffRef = useRef<RenderedPlayer[] | null>(null);

  const defenders = useMemo(
    () => assignStableSlots(prevDefRef.current, rawDefenders),
    [rawDefenders],
  );
  const offenders = useMemo(
    () => assignStableSlots(prevOffRef.current, rawOffenders),
    [rawOffenders],
  );

  useEffect(() => {
    prevDefRef.current = defenders;
  }, [defenders]);
  useEffect(() => {
    prevOffRef.current = offenders;
  }, [offenders]);

  /* ---------- Player-position map for overlay ---------- */
  const playerPositions = useMemo(() => {
    const map = new Map<string, Point>();
    for (const p of offenders) map.set(p.key, { x: p.x, y: p.y });
    for (const p of defenders) map.set(p.key, { x: p.x, y: p.y });
    return map;
  }, [defenders, offenders]);

  /* ---------- Legend items ---------- */
  const { zoneKinds, arrowKinds } = useMemo(() => {
    const zones = new Set<ZoneKind>();
    const arrows = new Set<ArrowKind>();
    for (const r of coverage.responsibilities) {
      if (r.type === "zone") zones.add(r.kind);
      if (r.type === "arrow") arrows.add(r.kind);
    }
    return { zoneKinds: zones, arrowKinds: arrows };
  }, [coverage.responsibilities]);

  /* ---------- Auto-linked description ---------- */
  const linkedDescription = useMemo(
    () =>
      createAutoLinkedText(
        coverage.description,
        formations,
        glossaryTerms,
        onSelectFormation,
        onSelectTerm,
        coverage.id,
      ),
    [coverage, formations, glossaryTerms, onSelectFormation, onSelectTerm],
  );

  /* ---------- Guard: missing formation ---------- */
  if (!defensiveFormation || !offensiveFormation) {
    return (
      <div className="p-6 text-slate-500">
        Coverage &ldquo;{coverage.name}&rdquo; references a formation that could
        not be found.
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="flex flex-col h-full w-full">
      {/* Formation selectors */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 gap-4">
        <FormationSelect
          label="Defense"
          formations={defensiveFormations}
          defaultFormation={defaultDefFormation ?? null}
          overrideId={defensiveFormationOverride}
          onChange={onDefensiveFormationChange}
        />
        <FormationSelect
          label="Offense"
          formations={offensiveFormations}
          defaultFormation={defaultOffFormation ?? null}
          overrideId={offensiveFormationOverride}
          onChange={onOffensiveFormationChange}
        />
      </div>

      {/* Field */}
      <div
        className="relative flex-1 overflow-hidden rounded-xl mx-6 mt-1 mb-2 shadow-inner"
        style={{ background: "#2d5a27" }}
      >
        <FieldBackground />

        <CoverageOverlay
          coverageId={coverage.id}
          responsibilities={coverage.responsibilities}
          playerPositions={playerPositions}
        />

        {offenders.map((p) => (
          <PlayerDot
            key={`off-${p.slot}`}
            player={p}
            category="offensive"
            animate
          />
        ))}
        {defenders.map((p) => (
          <PlayerDot
            key={`def-${p.slot}`}
            player={p}
            category="defensive"
            animate
          />
        ))}
      </div>

      <Legend zoneKinds={zoneKinds} arrowKinds={arrowKinds} />

      <div className="px-6 pt-2 pb-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800">{coverage.name}</h2>
          <ShareButton key={coverage.id} className="shrink-0 mt-0.5" />
        </div>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-2xl">
          {linkedDescription}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FormationSelect                                                     */
/* ------------------------------------------------------------------ */

interface FormationSelectProps {
  label: string;
  formations: Formation[];
  defaultFormation: Formation | null;
  overrideId: string | null;
  onChange: (id: string | null) => void;
}

function FormationSelect({
  label,
  formations,
  defaultFormation,
  overrideId,
  onChange,
}: FormationSelectProps) {
  const isOverridden = overrideId !== null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <select
        className={`
          text-sm bg-white border rounded-lg px-2.5 py-1 text-slate-700 truncate
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
          hover:border-slate-300 transition-colors cursor-pointer
          ${isOverridden ? "border-amber-400 ring-1 ring-amber-300/50" : "border-slate-200"}
        `}
        value={overrideId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">
          {defaultFormation ? defaultFormation.name : "Default"} (default)
        </option>
        {formations.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlay                                                             */
/* ------------------------------------------------------------------ */

interface CoverageOverlayProps {
  coverageId: string;
  responsibilities: Responsibility[];
  playerPositions: Map<string, Point>;
}

function CoverageOverlay({
  coverageId,
  responsibilities,
  playerPositions,
}: CoverageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const prevCoverageIdRef = useRef(coverageId);

  /* Resize tracking */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Subtle fade-in when the coverage changes */
  useEffect(() => {
    if (prevCoverageIdRef.current !== coverageId && svgRef.current) {
      svgRef.current.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 300, easing: "ease-out" },
      );
    }
    prevCoverageIdRef.current = coverageId;
  }, [coverageId]);

  const W = size.width;
  const H = size.height;
  const toX = (x: number) => x * W;
  const toY = (y: number) => y * H;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {W > 0 && H > 0 && (
        <svg ref={svgRef} className="absolute inset-0 w-full h-full">
          <defs>
            {/* Man: slim filled triangle */}
            <marker
              id={ARROW_STYLES.man.markerId}
              markerUnits="userSpaceOnUse"
              markerWidth={12}
              markerHeight={12}
              refX={11}
              refY={6}
              orient="auto"
            >
              <path d="M0,0 L12,6 L0,12 Z" fill={ARROW_STYLES.man.color} />
            </marker>

            {/* Blitz: double-chevron arrowhead */}
            <marker
              id={ARROW_STYLES.blitz.markerId}
              markerUnits="userSpaceOnUse"
              markerWidth={18}
              markerHeight={14}
              refX={17}
              refY={7}
              orient="auto"
            >
              <path
                d="M0,2 L8,7 L0,12 Z M9,2 L17,7 L9,12 Z"
                fill={ARROW_STYLES.blitz.color}
              />
            </marker>
          </defs>

          {responsibilities.map((r, i) => {
            if (r.type === "zone") {
              const { color } = ZONE_STYLES[r.kind];
              const d = polygonPath(r.points, toX, toY);
              const c = polygonCentroid(r.points);
              return (
                <g key={i}>
                  <path
                    d={d}
                    fill={color}
                    fillOpacity={0.24}
                    stroke={color}
                    strokeOpacity={0.85}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {r.label && (
                    <text
                      x={toX(c.x)}
                      y={toY(c.y)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="white"
                      stroke="rgba(0,0,0,0.65)"
                      strokeWidth={3}
                      paintOrder="stroke"
                      style={{ letterSpacing: "0.02em" }}
                    >
                      {r.label}
                    </text>
                  )}
                </g>
              );
            }

            if (r.type === "line") {
              const color = r.color ?? "#ffffff";
              const origin = r.from ?? playerPositions.get(r.playerKey);
              if (!origin) return null;
              return (
                <line
                  key={i}
                  x1={toX(origin.x)}
                  y1={toY(origin.y)}
                  x2={toX(r.to.x)}
                  y2={toY(r.to.y)}
                  stroke={color}
                  strokeOpacity={0.85}
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
              );
            }

            // arrow
            const style = ARROW_STYLES[r.kind];
            const origin = r.from ?? playerPositions.get(r.playerKey);
            if (!origin) return null;
            const x1 = toX(origin.x);
            const y1 = toY(origin.y);
            const x2 = toX(r.to.x);
            const y2 = toY(r.to.y);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const label = r.label ?? style.defaultLineLabel;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={style.color}
                  strokeOpacity={0.95}
                  strokeWidth={style.strokeWidth}
                  strokeLinecap="round"
                  markerEnd={`url(#${style.markerId})`}
                />
                {label && (
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontWeight={800}
                    fill="white"
                    stroke="rgba(15,23,42,0.9)"
                    strokeWidth={3.5}
                    paintOrder="stroke"
                    style={{ letterSpacing: "0.06em" }}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function polygonPath(
  points: Point[],
  toX: (x: number) => number,
  toY: (y: number) => number,
): string {
  if (points.length === 0) return "";
  return (
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x)},${toY(p.y)}`)
      .join(" ") + " Z"
  );
}

function polygonCentroid(points: Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

/* ------------------------------------------------------------------ */
/* Legend                                                              */
/* ------------------------------------------------------------------ */

interface LegendProps {
  zoneKinds: Set<ZoneKind>;
  arrowKinds: Set<ArrowKind>;
}

function Legend({ zoneKinds, arrowKinds }: LegendProps) {
  if (zoneKinds.size === 0 && arrowKinds.size === 0) return null;

  return (
    <div className="mx-6 mb-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
      {Array.from(zoneKinds).map((kind) => {
        const { color, label } = ZONE_STYLES[kind];
        return (
          <div key={`z-${kind}`} className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-3 rounded-sm"
              style={{
                backgroundColor: color,
                opacity: 0.45,
                boxShadow: `inset 0 0 0 1.5px ${color}`,
              }}
            />
            <span className="font-medium">{label}</span>
          </div>
        );
      })}

      {Array.from(arrowKinds).map((kind) => {
        const { color, label, strokeWidth } = ARROW_STYLES[kind];
        const isBlitz = kind === "blitz";
        return (
          <div key={`a-${kind}`} className="flex items-center gap-1.5">
            <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">
              <line
                x1={0}
                y1={6}
                x2={isBlitz ? 12 : 16}
                y2={6}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {isBlitz ? (
                <path
                  d="M12,1 L17,6 L12,11 Z M17,1 L22,6 L17,11 Z"
                  fill={color}
                />
              ) : (
                <path d="M16,2 L24,6 L16,10 Z" fill={color} />
              )}
            </svg>
            <span className="font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}