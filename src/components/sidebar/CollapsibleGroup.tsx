import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SidebarListItem from "./SidebarListItem";
import { cn } from "../../lib/utils";

/** Minimal item shape required by the sidebar list. */
export interface SidebarItem {
  id: string;
  label: string;
}

interface CollapsibleGroupProps {
  /** Heading shown above the collapsible list. */
  title: string;
  /** Items to render inside the group. */
  items: SidebarItem[];
  /** The `id` of the currently-selected item, or `null`. */
  selectedId: string | null;
  /** Called with an item's `id` when it is clicked. */
  onSelect: (id: string) => void;
}

/**
 * A collapsible sidebar section with a titled header and a list of
 * selectable items. Used for both formation categories and glossary
 * term categories.
 */
export default function CollapsibleGroup({
  title,
  items,
  selectedId,
  onSelect,
}: CollapsibleGroupProps) {
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
          {items.map((item) => (
            <SidebarListItem
              key={item.id}
              id={item.id}
              label={item.label}
              isSelected={selectedId === item.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}