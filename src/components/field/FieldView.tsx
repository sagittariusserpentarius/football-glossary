import { useRef, useEffect, useState, useCallback } from "react";
import { type Formation } from "../../types/formations";
import { useFormationAnimation } from "../../hooks/useFormationAnimation";
import { useSettings } from "../../context/SettingsContext";
import PlayerDot from "./PlayerDot";

interface FieldViewProps {
  formation: Formation | null;
}

/**
 * Renders the football-field background and all animated player dots.
 * Automatically sizes to its container via a ResizeObserver.
 */
export default function FieldView({ formation }: FieldViewProps) {
  const { settings } = useSettings();
  const { renderedPlayers } = useFormationAnimation(
    formation,
    settings.animationsEnabled
  );

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

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Field container ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-xl mx-6 my-4 shadow-inner"
        style={{ background: "#2d5a27" }} // grass green
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

        {/* Player dots (absolutely positioned by the hook's output) */}
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
            {formation.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Decorative yard lines ──────────────────────────────────────────────────────
function FieldLines() {
  // Draw 5 evenly spaced vertical dashed lines across the field for visual depth
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