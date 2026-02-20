import type { GlossaryTerm } from "../../types/glossary";
import type { Formation } from "../../types/formations";
import { createAutoLinkedText } from "../../lib/autoLink";
import ShareButton from "../ShareButton";

interface TermViewProps {
  term: GlossaryTerm;
  formations: Formation[];
  allTerms: GlossaryTerm[];
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  scoring: "Scoring",
  positions: "Positions",
  plays: "Plays & Actions",
  rules: "Rules & Field",
  general: "General",
};

// Improved contrast: solid/semi-solid backgrounds with darker text
const CATEGORY_COLORS: Record<string, string> = {
  scoring: "bg-amber-100 text-amber-800 border border-amber-300",
  positions: "bg-blue-100 text-blue-800 border border-blue-300",
  plays: "bg-purple-100 text-purple-800 border border-purple-300",
  rules: "bg-rose-100 text-rose-800 border border-rose-300",
  general: "bg-slate-100 text-slate-700 border border-slate-300",
};

export default function TermView({
  term,
  formations,
  allTerms,
  onSelectFormation,
  onSelectTerm,
}: TermViewProps) {
  const linkedDefinition = createAutoLinkedText(
    term.definition,
    formations,
    allTerms,
    onSelectFormation,
    onSelectTerm,
    term.id
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Header row: category badge + share button */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general
              }`}
            >
              {CATEGORY_LABELS[term.category] || term.category}
            </span>
            <ShareButton />
          </div>

          {/* Term name */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            {term.term}
          </h1>

          {/* Definition with auto-linked terms */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
              {linkedDefinition}
            </p>
          </div>

          {/* Hint about links */}
          <p className="text-slate-400 text-sm mt-4 text-center">
            <span className="text-emerald-600">Highlighted terms</span> link to
            other glossary entries
          </p>
        </div>
      </div>
    </div>
  );
}