import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { type Formation, type RenderedPlayer } from "../../types/formations";
import type { GlossaryTerm } from "../../types/glossary";
import { createAutoLinkedText } from "../../lib/autoLink";
import PlayerDot from "./PlayerDot";

interface FieldViewProps {
  formation: Formation | null;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

/**
 * Renders the football-field background and all player dots.
 * Automatically sizes to its container via a ResizeObserver.
 */
export default function FieldView({
  formation,
  formations,
  glossaryTerms,
  onSelectFormation,
  onSelectTerm,
}: FieldViewProps) {
  // Derive the rendered player list directly from the formation.
  const renderedPlayers: RenderedPlayer[] = useMemo(() => {
    if (!formation) return [];
    return formation.players.map((p) => ({ ...p, opacity: 1 }));
  }, [formation]);

  // Measure container so we can convert normalised coords → pixels
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 500 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: width, h: height });
    }
  }, []);

  useEffect(() => {
    updateSize();
    const obs = new ResizeObserver(updateSize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [updateSize]);

  const isOffensive = formation?.category === "offensive";

  // Create auto-linked description
  const linkedDescription = useMemo(() => {
    if (!formation) return null;
    return createAutoLinkedText(
      formation.description,
      formations,
      glossaryTerms,
      onSelectFormation,
      onSelectTerm,
      formation.id
    );
  }, [formation, formations, glossaryTerms, onSelectFormation, onSelectTerm]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Field container ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-xl mx-6 my-4 shadow-inner"
        style={{ background: "#2d5a27" }}
      >
        {/* Yard-line stripes for visual reference */}
        <FieldLines />

        {/* Line-of-scrimmage indicator */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: "62%",
            width: 3,
            background: "rgba(255,255,255,0.35)",
            pointerEvents: "none",
          }}
        >
          <span
            className="absolute text-white text-xs font-semibold tracking-widest"
            style={{ top: 4, left: 6, opacity: 0.6 }}
          >
            LOS
          </span>
        </div>

        {/* Player dots (absolutely positioned) */}
        {renderedPlayers.map((p) => (
          <PlayerDot
            key={p.key}
            player={p}
            isOffensive={isOffensive}
            containerSize={containerSize}
          />
        ))}

        {/* Empty-state overlay */}
        {!formation && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <p className="text-white/70 text-lg font-medium">
              Select a formation from the sidebar
            </p>
          </div>
        )}
      </div>

      {/* ── Description panel below the field ──────────────────────────── */}
      {formation && (
        <div className="px-6 pb-5">
          <h2 className="text-xl font-bold text-slate-800">{formation.name}</h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-2xl">
            {linkedDescription}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Decorative yard lines ──────────────────────────────────────────────────────
function FieldLines() {
  const lines = [0.2, 0.4, 0.6, 0.8];
  return (
    <>
      {lines.map((pct) => (
        <div
          key={pct}
          className="absolute top-0 bottom-0"
          style={{
            left: `${pct * 100}%`,
            width: 1,
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Hash marks along the vertical centre */}
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={`hash-${i}`}
          className="absolute left-0 right-0"
          style={{
            top: `${((i + 1) / 10) * 100}%`,
            height: 1,
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}