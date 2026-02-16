import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GlossaryTerm } from "../../types/glossary";
import GlossaryTermListItem from "./GlossaryTermListItem";
import { cn } from "../../lib/utils";

interface GlossaryTermGroupProps {
  title: string;
  terms: GlossaryTerm[];
  selectedTermId: string | null;
  onSelectTerm: (id: string) => void;
}

export default function GlossaryTermGroup({
  title,
  terms,
  selectedTermId,
  onSelectTerm,
}: GlossaryTermGroupProps) {
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
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 space-y-0.5 pb-1">
          {terms.map((term) => (
            <GlossaryTermListItem
              key={term.id}
              term={term}
              isSelected={selectedTermId === term.id}
              onSelect={onSelectTerm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}