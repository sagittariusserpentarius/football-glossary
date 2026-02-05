import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { type Formation } from "../../types/formations";
import TermListItem from "./TermListItem";
import { cn } from "../../lib/utils";

interface CategoryGroupProps {
  title: string;
  formations: Formation[];
  selectedFormationId: string | null;
  onSelectFormation: (id: string) => void;
}

export default function CategoryGroup({
  title,
  formations,
  selectedFormationId,
  onSelectFormation,
}: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="py-1">
      {/* Category header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-1.5 group"
      >
        <span className="text-slate-500 group-hover:text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors duration-150">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "text-slate-500 group-hover:text-slate-300",
            "transition-all duration-300",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {/* Collapsible item list */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 space-y-0.5 pb-1">
          {formations.map((formation) => (
            <TermListItem
              key={formation.id}
              formation={formation}
              isSelected={selectedFormationId === formation.id}
              onSelect={onSelectFormation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}