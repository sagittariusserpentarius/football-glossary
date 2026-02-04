import { useState, useMemo } from "react";
import { type Formation, type FormationCategory } from "../../types/formations";
import SearchBar from "./SearchBar";
import CategoryGroup from "./CategoryGroup";

interface SidebarProps {
  formations: Formation[];
  selectedFormationId: string | null;
  onSelectFormation: (id: string) => void;
}

const CATEGORIES: { key: FormationCategory; title: string }[] = [
  { key: "offensive", title: "Offensive" },
  { key: "defensive", title: "Defensive" },
];

export default function Sidebar({
  formations,
  selectedFormationId,
  onSelectFormation,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFormations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return formations;
    return formations.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [formations, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-white font-bold text-base">Football Glossary</h1>
        <p className="text-slate-500 text-xs mt-0.5">Formations & Alignments</p>
      </div>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Divider */}
      <div className="border-t border-slate-700 mx-3 mb-1" />

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto py-1">
        {CATEGORIES.map(({ key, title }) => {
          const items = filteredFormations.filter((f) => f.category === key);
          if (items.length === 0) return null;
          return (
            <CategoryGroup
              key={key}
              title={title}
              formations={items}
              selectedFormationId={selectedFormationId}
              onSelectFormation={onSelectFormation}
            />
          );
        })}

        {filteredFormations.length === 0 && (
          <p className="text-slate-500 text-sm px-4 py-4 text-center">
            No formations match your search.
          </p>
        )}
      </div>
    </div>
  );
}