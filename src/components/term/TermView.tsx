import type { GlossaryTerm } from "../../types/glossary";
import type { Formation } from "../../types/formations";
import { createAutoLinkedText } from "../../lib/autoLink";
import { BookOpen } from "lucide-react";

interface TermViewProps {
  term: GlossaryTerm | null;
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

const CATEGORY_COLORS: Record<string, string> = {
  scoring: "bg-amber-500/20 text-amber-300",
  positions: "bg-blue-500/20 text-blue-300",
  plays: "bg-purple-500/20 text-purple-300",
  rules: "bg-rose-500/20 text-rose-300",
  general: "bg-slate-500/20 text-slate-300",
};

export default function TermView({
  term,
  formations,
  allTerms,
  onSelectFormation,
  onSelectTerm,
}: TermViewProps) {
  if (!term) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 text-lg font-medium">
            Select a term from the sidebar
          </p>
          <p className="text-slate-400 text-sm mt-1">
            to see its definition
          </p>
        </div>
      </div>
    );
  }

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
          {/* Category badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general
              }`}
            >
              {CATEGORY_LABELS[term.category] || term.category}
            </span>
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
            <span className="text-emerald-600">Highlighted terms</span> link to other glossary entries
          </p>
        </div>
      </div>
    </div>
  );
}