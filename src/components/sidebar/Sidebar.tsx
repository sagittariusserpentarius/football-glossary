import { useState, useMemo } from "react";
import { Settings } from "lucide-react";
import type { Formation, FormationCategory } from "../../types/formations";
import type { GlossaryTerm, TermCategory, Selection } from "../../types/glossary";
import SearchBar from "./SearchBar";
import CategoryGroup from "./CategoryGroup";
import GlossaryTermGroup from "./GlossaryTermGroup";
import SettingsPanel from "./SettingsPanel";

interface SidebarProps {
  formations: Formation[];
  glossaryTerms: GlossaryTerm[];
  selection: Selection;
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}

const FORMATION_CATEGORIES: { key: FormationCategory; title: string }[] = [
  { key: "offensive", title: "Offensive" },
  { key: "defensive", title: "Defensive" },
];

const TERM_CATEGORIES: { key: TermCategory; title: string }[] = [
  { key: "scoring", title: "Scoring" },
  { key: "positions", title: "Positions" },
  { key: "plays", title: "Plays & Actions" },
  { key: "rules", title: "Rules & Field" },
  { key: "general", title: "General" },
];

export default function Sidebar({
  formations,
  glossaryTerms,
  selection,
  onSelectFormation,
  onSelectTerm,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const filteredFormations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return formations;
    return formations.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [formations, searchQuery]);

  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return glossaryTerms;
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query)
    );
  }, [glossaryTerms, searchQuery]);

  const selectedFormationId = selection?.type === "formation" ? selection.id : null;
  const selectedTermId = selection?.type === "term" ? selection.id : null;

  const hasFormationResults = filteredFormations.length > 0;
  const hasTermResults = filteredTerms.length > 0;
  const hasAnyResults = hasFormationResults || hasTermResults;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header row: title + cog */}
      <div className="flex items-start justify-between px-4 pt-5 pb-3">
        <div>
          <h1 className="text-white font-bold text-base">Football Glossary</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Formations & Terminology
          </p>
        </div>

        {/* Settings cog toggle */}
        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
          className={`p-1.5 rounded-lg transition-colors duration-150 ${
            showSettings
              ? "bg-slate-700 text-emerald-400"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Settings size={17} />
        </button>
      </div>

      {/* Settings panel (conditionally rendered) */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Divider */}
      <div className="border-t border-slate-700 mx-3 mb-1" />

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Formations Section */}
        {hasFormationResults && (
          <>
            <div className="px-4 py-2">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Formations
              </h2>
            </div>
            {FORMATION_CATEGORIES.map(({ key, title }) => {
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
          </>
        )}

        {/* Divider between sections */}
        {hasFormationResults && hasTermResults && (
          <div className="border-t border-slate-700 mx-3 my-2" />
        )}

        {/* Glossary Terms Section */}
        {hasTermResults && (
          <>
            <div className="px-4 py-2">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Terminology
              </h2>
            </div>
            {TERM_CATEGORIES.map(({ key, title }) => {
              const items = filteredTerms.filter((t) => t.category === key);
              if (items.length === 0) return null;
              return (
                <GlossaryTermGroup
                  key={key}
                  title={title}
                  terms={items}
                  selectedTermId={selectedTermId}
                  onSelectTerm={onSelectTerm}
                />
              );
            })}
          </>
        )}

        {!hasAnyResults && (
          <p className="text-slate-500 text-sm px-4 py-4 text-center">
            No results match your search.
          </p>
        )}
      </div>
    </div>
  );
}