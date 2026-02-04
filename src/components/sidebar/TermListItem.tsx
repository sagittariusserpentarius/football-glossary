
import { type Formation } from "../../types/formations";
import { cn } from "../../lib/utils";

interface TermListItemProps {
  formation: Formation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function TermListItem({
  formation,
  isSelected,
  onSelect,
}: TermListItemProps) {
  return (
    <button
      onClick={() => onSelect(formation.id)}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.05] hover:z-10",
        isSelected
          ? "bg-emerald-600 text-white hover:bg-emerald-500"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      )}
    >
      {formation.name}
    </button>
  );
}