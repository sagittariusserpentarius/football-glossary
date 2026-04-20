import { useEffect, useMemo, useRef } from "react";
import type {
  Formation,
  FormationCategory,
  RenderedPlayer,
} from "../../types/formations";
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

const OPPONENT_OPACITY = 0.4;

/**
 * Map a formation category to the category that lines up on the other
 * side of the ball.  Special-teams has no natural opposite.
 */
function oppositeCategory(
  cat: FormationCategory,
): "offensive" | "defensive" | null {
  if (cat === "offensive") return "defensive";
  if (cat === "defensive") return "offensive";
  return null;
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface FieldViewProps {
  formation: Formation;
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  /** id persisted in the `?vs=` search param (may be stale / wrong category) */
  opponentId: string | null;
  onOpponentChange: (id: string | null) => void;
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function FieldView({
  formation,
  formations,
  glossaryTerms,
  opponentId,
  onOpponentChange,
  onSelectFormation,
  onSelectTerm,
}: FieldViewProps) {
  /* ---------- Opponent resolution ---------- */
  const oppCategory = oppositeCategory(formation.category);
  const opponentFormation = opponentId
    ? formations.find((f) => f.id === opponentId) ?? null
    : null;
  // Only accept the opponent when it's from the right category.
  const validOpponent =
    opponentFormation?.category === oppCategory ? opponentFormation : null;

  const hasOpponent = validOpponent !== null;
  const primaryIsOffense = formation.category === "offensive";

  /* ---------- Opponent option list ---------- */
  const opponentOptions = useMemo(
    () => (oppCategory ? formations.filter((f) => f.category === oppCategory) : []),
    [formations, oppCategory],
  );

  /* ---------- Raw player positions ----------
   *
   * Both formations are authored "facing right" (line on the high-x
   * side, backfield / secondary on the low-x side).  To face them
   * off across the LOS the *offensive* side is always mirrored —
   * exactly the same convention CoverageView uses.
   *
   * When there is no opponent the primary formation keeps its
   * authored positions so the standalone view looks unchanged.
   */
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

  /* ---------- Stable-slot assignment for smooth transitions ---------- */
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

  /* ---------- Auto-linked description ---------- */
  const linkedDescription = useMemo(
    () =>
      createAutoLinkedText(
        formation.description,
        formations,
        glossaryTerms,
        onSelectFormation,
        onSelectTerm,
        formation.id,
      ),
    [formation, formations, glossaryTerms, onSelectFormation, onSelectTerm],
  );

  /* ---------- Render ---------- */
  return (
    <div className="flex flex-col h-full w-full">
      {/* Opponent selector — hidden for special-teams formations */}
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

      {/* Field */}
      <div
        className={`relative flex-1 overflow-hidden rounded-xl mx-6 ${
          oppCategory ? "mt-1" : "mt-4"
        } mb-2 shadow-inner`}
        style={{ background: "#2d5a27" }}
      >
        <FieldBackground />

        {/* Opponent dots rendered first so primary dots paint on top */}
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

      {/* Description */}
      <div className="px-6 pt-2 pb-5">
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
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
        Opponent
      </span>
      <select
        className={`
          text-sm bg-white border rounded-lg px-2.5 py-1 text-slate-700 truncate
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
          hover:border-slate-300 transition-colors cursor-pointer
          ${selectedId ? "border-amber-400 ring-1 ring-amber-300/50" : "border-slate-200"}
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