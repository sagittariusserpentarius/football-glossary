import { useMemo, useRef, useEffect } from "react";
import type {
  Formation,
  FormationCategory,
  RenderedPlayer,
} from "../../types/formations";
import type { GlossaryTerm } from "../../types/glossary";
import { createAutoLinkedText } from "../../lib/autoLink";
import { assignStableSlots } from "../../lib/assignStableSlots";
import PlayerDot from "./PlayerDot";
import ShareButton from "../ShareButton";

interface FieldViewProps {
  formation: Formation;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

/**
 * Renders the field and player dots. Keys are `{category}-slot-{N}`;
 * slot values are reassigned per-render by matching against the
 * previous formation so same-unit switches animate the right pairs.
 */
export default function FieldView({
  formation,
  formations,
  glossaryTerms,
  onSelectFormation,
  onSelectTerm,
}: FieldViewProps) {
  // Holds assigned slots, not author slots — lets A→B→C chain correctly.
  const prevPlayersRef = useRef<RenderedPlayer[] | null>(null);
  const prevCategoryRef = useRef<FormationCategory | null>(null);

  const renderedPlayers: RenderedPlayer[] = useMemo(() => {
    // Cross-category = full remount anyway; don't match against it.
    const prev =
      prevCategoryRef.current === formation.category
        ? prevPlayersRef.current
        : null;

    return assignStableSlots(prev, formation.players)
      .map((p) => ({ ...p, opacity: 1 }))
      .sort((a, b) => a.slot - b.slot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation]);

  useEffect(() => {
    prevPlayersRef.current = renderedPlayers;
    prevCategoryRef.current = formation.category;
  }, [renderedPlayers, formation.category]);

  const linkedDescription = useMemo(() => {
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
      <div
        className="relative flex-1 overflow-hidden rounded-xl mx-6 my-4 shadow-inner"
        style={{ background: "#2d5a27" }}
      >
        <FieldLines />
        <LineOfScrimmage />

        {renderedPlayers.map((p) => (
          <PlayerDot
            key={`${formation.category}-slot-${p.slot}`}
            player={p}
            category={formation.category}
          />
        ))}
      </div>

      <div className="px-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800">
            {formation.name}
          </h2>
          <ShareButton key={formation.id} className="shrink-0 mt-0.5" />
        </div>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-2xl">
          {linkedDescription}
        </p>
      </div>
    </div>
  );
}

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

function LineOfScrimmage() {
  return (
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
  );
}