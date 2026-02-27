import { cn } from "../../lib/utils";

interface SidebarListItemProps {
  /** The item's unique identifier, passed verbatim to `onSelect`. */
  id: string;
  /** Text displayed inside the button. */
  label: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * A single clickable row inside a `CollapsibleGroup`.
 * Renders with an emerald highlight when selected.
 */
export default function SidebarListItem({
  id,
  label,
  isSelected,
  onSelect,
}: SidebarListItemProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
        isSelected
          ? "bg-emerald-600 text-white font-medium"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}