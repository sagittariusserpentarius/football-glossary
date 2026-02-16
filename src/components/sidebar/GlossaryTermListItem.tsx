import type { GlossaryTerm } from "../../types/glossary";
import { cn } from "../../lib/utils";

interface GlossaryTermListItemProps {
  term: GlossaryTerm;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function GlossaryTermListItem({
  term,
  isSelected,
  onSelect,
}: GlossaryTermListItemProps) {
  return (
    <button
      onClick={() => onSelect(term.id)}
      className={cn(
        "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
        isSelected
          ? "bg-emerald-600 text-white font-medium"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
    >
      {term.term}
    </button>
  );
}