import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Coverage,
  Point,
  Responsibility,
} from "../../types/coverages";
import type { Formation, RenderedPlayer } from "../../types/formations";
import type { GlossaryTerm } from "../../types/glossary";
import { createAutoLinkedText } from "../../lib/autoLink";
import { LOS_X } from "../../lib/fieldConstants";
import PlayerDot from "./PlayerDot";
import ShareButton from "../ShareButton";
import { FieldBackground } from "./FieldBackground";

interface CoverageViewProps {
  coverage: Coverage;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

const OFFENSE_OPACITY = 0.55;

/**
 * Renders a coverage on top of both a defensive and an offensive formation.
 * The offense is reflected around the line of scrimmage so the two units
 * face each other on the same field, even though each formation is authored
 * showing only its own side.
 */
export default function CoverageView({
  coverage,
  formations,
  glossaryTerms,
  onSelectFormation,
  onSelectTerm,
}: CoverageViewProps) {
  const defensiveFormation = formations.find(
    (f) => f.id === coverage.defensiveFormationId
  );
  const offensiveFormation = formations.find(
    (f) => f.id === coverage.offensiveFormationId
  );

  const defenders: RenderedPlayer[] = useMemo(() => {
    if (!defensiveFormation) return [];
    return defensiveFormation.players.map((p) => ({ ...p, opacity: 1 }));
  }, [defensiveFormation]);

  const offenders: RenderedPlayer[] = useMemo(() => {
    if (!offensiveFormation) return [];
    return offensiveFormation.players.map((p) => ({
      ...p,
      x: 2 * LOS_X - p.x, // reflect across the LOS
      opacity: OFFENSE_OPACITY,
    }));
  }, [offensiveFormation]);

  // Used so responsibilities can resolve their starting point from a playerKey.
  const playerPositions = useMemo(() => {
    const map = new Map<string, Point>();
    for (const p of offenders) map.set(p.key, { x: p.x, y: p.y });
    for (const p of defenders) map.set(p.key, { x: p.x, y: p.y });
    return map;
  }, [defenders, offenders]);

  const linkedDescription = useMemo(() => {
    return createAutoLinkedText(
      coverage.description,
      formations,
      glossaryTerms,
      onSelectFormation,
      onSelectTerm,
      coverage.id
    );
  }, [coverage, formations, glossaryTerms, onSelectFormation, onSelectTerm]);

  if (!defensiveFormation || !offensiveFormation) {
    return (
      <div className="p-6 text-slate-500">
        Coverage “{coverage.name}” is missing a referenced formation.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div
        className="relative flex-1 overflow-hidden rounded-xl mx-6 my-4 shadow-inner"
        style={{ background: "#2d5a27" }}
      >
        <FieldBackground />

        <CoverageOverlay
          responsibilities={coverage.responsibilities}
          playerPositions={playerPositions}
        />

        {/* Offense first so defenders render on top where things overlap. */}
        {offenders.map((p) => (
          <PlayerDot
            key={`off-${p.key}`}
            player={p}
            category="offensive"
          />
        ))}
        {defenders.map((p) => (
          <PlayerDot
            key={`def-${p.key}`}
            player={p}
            category="defensive"
          />
        ))}
      </div>

      <div className="px-6 pb-5">
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
/* Overlay                                                             */
/* ------------------------------------------------------------------ */

interface CoverageOverlayProps {
  responsibilities: Responsibility[];
  playerPositions: Map<string, Point>;
}

/**
 * An SVG overlay sized to the parent via ResizeObserver so we can author
 * responsibility coordinates in 0–1 space while still drawing clean,
 * aspect-correct strokes and arrowheads.
 */
function CoverageOverlay({
  responsibilities,
  playerPositions,
}: CoverageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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

  const W = size.width;
  const H = size.height;
  const toX = (x: number) => x * W;
  const toY = (y: number) => y * H;

  // Distinct arrow colours need distinct <marker> definitions.
  const arrowColors = useMemo(() => {
    const set = new Set<string>();
    for (const r of responsibilities) {
      if (r.type === "arrow") set.add(r.color ?? "#ffffff");
    }
    return Array.from(set);
  }, [responsibilities]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {W > 0 && H > 0 && (
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            {arrowColors.map((color) => (
              <marker
                key={color}
                id={`arrowhead-${encodeColor(color)}`}
                markerUnits="userSpaceOnUse"
                markerWidth={14}
                markerHeight={14}
                refX={12}
                refY={7}
                orient="auto"
              >
                <path d="M0,0 L14,7 L0,14 Z" fill={color} />
              </marker>
            ))}
          </defs>

          {responsibilities.map((r, i) => {
            const color = r.color ?? "#ffffff";

            if (r.type === "zone") {
              const d = polygonPath(r.points, toX, toY);
              const c = polygonCentroid(r.points);
              return (
                <g key={i}>
                  <path
                    d={d}
                    fill={color}
                    fillOpacity={0.22}
                    stroke={color}
                    strokeOpacity={0.75}
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

            const origin = r.from ?? playerPositions.get(r.playerKey);
            if (!origin) return null;

            const x1 = toX(origin.x);
            const y1 = toY(origin.y);
            const x2 = toX(r.to.x);
            const y2 = toY(r.to.y);

            if (r.type === "line") {
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeOpacity={0.85}
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
              );
            }

            // arrow
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeOpacity={0.9}
                strokeWidth={3}
                strokeLinecap="round"
                markerEnd={`url(#arrowhead-${encodeColor(color)})`}
              />
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
  toY: (y: number) => number
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

function encodeColor(color: string): string {
  return color.replace(/[^a-zA-Z0-9]/g, "");
}