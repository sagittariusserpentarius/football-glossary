import { useEffect, useMemo, useRef } from "react";
import type {
  Formation,
  FormationCategory,
  RenderedPlayer,
} from "../../types/formations";
import type { GlossaryTerm } from "../../types/glossary";
import type { Coverage } from "../../types/coverages";
import { createAutoLinkedText } from "../../lib/autoLink";
import { LOS_X } from "../../lib/fieldConstants";
import { assignStableSlots } from "../../lib/assignStableSlots";
import PlayerDot from "./PlayerDot";
import ShareButton from "../ShareButton";
import { FieldBackground } from "./FieldBackground";

const OPPONENT_OPACITY = 0.4;

function oppositeCategory(
  cat: FormationCategory,
): "offensive" | "defensive" | null {
  if (cat === "offensive") return "defensive";
  if (cat === "defensive") return "offensive";
  return null;
}

interface FieldViewProps {
  formation: Formation;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  coverages: Coverage[];
  opponentId: string | null;
  onOpponentChange: (id: string | null) => void;
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
  onSelectCoverage: (id: string) => void;
}

export default function FieldView({
  formation,
  formations,
  glossaryTerms,
  coverages,
  opponentId,
  onOpponentChange,
  onSelectFormation,
  onSelectTerm,
  onSelectCoverage,
}: FieldViewProps) {
  const oppCategory = oppositeCategory(formation.category);
  const opponentFormation = opponentId
    ? formations.find((f) => f.id === opponentId) ?? null
    : null;
  const validOpponent =
    opponentFormation?.category === oppCategory ? opponentFormation : null;

  const hasOpponent = validOpponent !== null;
  const primaryIsOffense = formation.category === "offensive";

  const opponentOptions = useMemo(
    () =>
      oppCategory
        ? formations.filter((f) => f.category === oppCategory)
        : [],
    [formations, oppCategory],
  );

  const rawPrimary: RenderedPlayer[] = useMemo(() => {
    const mirror = hasOpponent && primaryIsOffense;
    return formation.players.map((p) => ({
      ...p,
      x: mirror ? 2 * LOS_X - p.x : p.x,
      opacity: 1,
    }));
  }, [formation.players, hasOpponent, primaryIsOffense]);

  const rawOpponent: RenderedPlayer[] = useMemo(() => {
    if (!validOpponent) return [];
    const mirror = validOpponent.category === "offensive";
    return validOpponent.players.map((p) => ({
      ...p,
      x: mirror ? 2 * LOS_X - p.x : p.x,
      opacity: OPPONENT_OPACITY,
    }));
  }, [validOpponent]);

  const prevPriRef = useRef<RenderedPlayer[] | null>(null);
  const prevOppRef = useRef<RenderedPlayer[] | null>(null);

  const primaryPlayers = useMemo(
    () => assignStableSlots(prevPriRef.current, rawPrimary),
    [rawPrimary],
  );
  const opponentPlayers = useMemo(
    () => assignStableSlots(prevOppRef.current, rawOpponent),
    [rawOpponent],
  );

  useEffect(() => {
    prevPriRef.current = primaryPlayers;
  }, [primaryPlayers]);
  useEffect(() => {
    prevOppRef.current = opponentPlayers;
  }, [opponentPlayers]);

  const linkedDescription = useMemo(
    () =>
      createAutoLinkedText(
        formation.description,
        formations,
        glossaryTerms,
        coverages,
        onSelectFormation,
        onSelectTerm,
        onSelectCoverage,
        formation.id,
      ),
    [
      formation,
      formations,
      glossaryTerms,
      coverages,
      onSelectFormation,
      onSelectTerm,
      onSelectCoverage,
    ],
  );

  return (
    <div className="flex flex-col h-full w-full">
      {oppCategory && (
        <div
          className={`flex items-center px-6 pt-3 pb-1 ${
            primaryIsOffense ? "justify-start" : "justify-end"
          }`}
        >
          <OpponentSelect
            formations={opponentOptions}
            selectedId={validOpponent?.id ?? null}
            onChange={onOpponentChange}
          />
        </div>
      )}

      <div
        id="field-container"
        className={`relative flex-1 overflow-hidden rounded-xl mx-6 ${
          oppCategory ? "mt-1" : "mt-4"
        } mb-2 shadow-inner`}
        style={{ background: "#2d5a27" }}
      >
        <FieldBackground />

        {opponentPlayers.map((p) => (
          <PlayerDot
            key={`opp-${p.slot}`}
            player={p}
            category={validOpponent!.category}
          />
        ))}
        {primaryPlayers.map((p) => (
          <PlayerDot
            key={`pri-${p.slot}`}
            player={p}
            category={formation.category}
          />
        ))}
      </div>

      <div className="field-description px-6 pt-2 pb-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {formation.name}
          </h2>
          <ShareButton key={formation.id} className="shrink-0 mt-0.5" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed max-w-2xl">
          {linkedDescription}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OpponentSelect                                                      */
/* ------------------------------------------------------------------ */

interface OpponentSelectProps {
  formations: Formation[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

function OpponentSelect({
  formations,
  selectedId,
  onChange,
}: OpponentSelectProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
        Opponent
      </span>
      <select
        className={`
          text-sm bg-white dark:bg-slate-800 border rounded-lg px-2.5 py-1
          text-slate-700 dark:text-slate-200 truncate
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
          hover:border-slate-300 dark:hover:border-slate-500 transition-colors cursor-pointer
          ${
            selectedId
              ? "border-amber-400 ring-1 ring-amber-300/50 dark:border-amber-500 dark:ring-amber-500/30"
              : "border-slate-200 dark:border-slate-600"
          }
        `}
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">None</option>
        {formations.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}