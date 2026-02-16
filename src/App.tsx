import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formations } from "./data/formations";
import { glossaryTerms } from "./data/terms";
import { SettingsProvider } from "./context/SettingsContext";
import Sidebar from "./components/sidebar/Sidebar";
import FieldView from "./components/field/FieldView";
import TermView from "./components/term/TermView";
import type { Selection } from "./types/glossary";
import { cn } from "./lib/utils";

export default function App() {
  const [selection, setSelection] = useState<Selection>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedFormation =
    selection?.type === "formation"
      ? formations.find((f) => f.id === selection.id) ?? null
      : null;

  const selectedTerm =
    selection?.type === "term"
      ? glossaryTerms.find((t) => t.id === selection.id) ?? null
      : null;

  const handleSelectFormation = (id: string) => {
    setSelection({ type: "formation", id });
  };

  const handleSelectTerm = (id: string) => {
    setSelection({ type: "term", id });
  };

  return (
    <SettingsProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-100">
        {/* Sidebar */}
        <div
          className={cn(
            "shrink-0 overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-0" : "w-72"
          )}
        >
          <div className="w-72 h-screen">
            <Sidebar
              formations={formations}
              glossaryTerms={glossaryTerms}
              selection={selection}
              onSelectFormation={handleSelectFormation}
              onSelectTerm={handleSelectTerm}
            />
          </div>
        </div>

        {/* Collapse toggle strip */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-150 px-1.5 py-4 flex items-center self-center shrink-0"
          aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>

        {/* Main content: field view for formations, term view for glossary terms */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selection?.type === "term" ? (
            <TermView
              term={selectedTerm}
              formations={formations}
              allTerms={glossaryTerms}
              onSelectFormation={handleSelectFormation}
              onSelectTerm={handleSelectTerm}
            />
          ) : (
            <FieldView
              formation={selectedFormation}
              formations={formations}
              glossaryTerms={glossaryTerms}
              onSelectFormation={handleSelectFormation}
              onSelectTerm={handleSelectTerm}
            />
          )}
        </div>
      </div>
    </SettingsProvider>
  );
}