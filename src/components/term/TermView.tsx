import type { GlossaryTerm } from "../../types/glossary";
import type { Formation } from "../../types/formations";
import type { Coverage } from "../../types/coverages";
import { createAutoLinkedText } from "../../lib/autoLink";
import ShareButton from "../ShareButton";

interface TermViewProps {
  term: GlossaryTerm;
  formations: Formation[];
  allTerms: GlossaryTerm[];
  coverages: Coverage[];
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
  onSelectCoverage: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  scoring: "Scoring",
  positions: "Positions",
  plays: "Plays & Actions",
  rules: "Rules & Field",
  general: "General",
};

const CATEGORY_COLORS: Record<string, string> = {
  scoring:
    "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  positions:
    "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  plays:
    "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  rules:
    "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  general:
    "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
};

export default function TermView({
  term,
  formations,
  allTerms,
  coverages,
  onSelectFormation,
  onSelectTerm,
  onSelectCoverage,
}: TermViewProps) {
  const linkedDefinition = createAutoLinkedText(
    term.definition,
    formations,
    allTerms,
    coverages,
    onSelectFormation,
    onSelectTerm,
    onSelectCoverage,
    term.id,
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general
              }`}
            >
              {CATEGORY_LABELS[term.category] || term.category}
            </span>
            <ShareButton key={term.id} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {term.term}
          </h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed">
              {linkedDefinition}
            </p>
          </div>

          <p className="text-slate-400 dark:text-slate-500 text-sm mt-4 text-center">
            <span className="text-emerald-600 dark:text-emerald-400">
              Highlighted terms
            </span>{" "}
            link to other glossary entries
          </p>
        </div>
      </div>
    </div>
  );
}