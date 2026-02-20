import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formations } from "./data/formations";
import { glossaryTerms } from "./data/terms";
import { SettingsProvider } from "./context/SettingsContext";
import Sidebar from "./components/sidebar/Sidebar";
import FieldView from "./components/field/FieldView";
import TermView from "./components/term/TermView";
import WelcomeScreen from "./components/WelcomeScreen";
import type { Selection } from "./types/glossary";
import { cn } from "./lib/utils";

/**
 * Parses the current URL hash into a Selection.
 * Expected formats:  #formation/<id>   or   #term/<id>
 */
function selectionFromHash(): Selection {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;

  const [type, ...rest] = hash.split("/");
  const id = rest.join("/"); // in case an id ever contains "/"

  if (type === "formation" && formations.some((f) => f.id === id)) {
    return { type: "formation", id };
  }
  if (type === "term" && glossaryTerms.some((t) => t.id === id)) {
    return { type: "term", id };
  }
  return null;
}

/**
 * Converts a Selection to the hash string (without the leading #).
 */
function hashFromSelection(sel: Selection): string {
  if (!sel) return "";
  return `${sel.type}/${sel.id}`;
}

export default function App() {
  const [selection, setSelection] = useState<Selection>(() =>
    selectionFromHash()
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ── Keep the URL hash in sync with selection ──────────────────────
  useEffect(() => {
    const desired = hashFromSelection(selection);
    const current = window.location.hash.replace(/^#/, "");

    if (desired !== current) {
      // pushState so the browser back/forward buttons work
      if (desired) {
        window.history.pushState(null, "", `#${desired}`);
      } else {
        // Clear the hash without leaving a trailing #
        window.history.pushState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    }
  }, [selection]);

  // ── Listen for browser back / forward navigation ──────────────────
  useEffect(() => {
    const onHashChange = () => {
      setSelection(selectionFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  const selectedFormation =
    selection?.type === "formation"
      ? formations.find((f) => f.id === selection.id) ?? null
      : null;

  const selectedTerm =
    selection?.type === "term"
      ? glossaryTerms.find((t) => t.id === selection.id) ?? null
      : null;

  const handleSelectFormation = useCallback((id: string) => {
    setSelection({ type: "formation", id });
  }, []);

  const handleSelectTerm = useCallback((id: string) => {
    setSelection({ type: "term", id });
  }, []);

  // ── Determine which main-panel content to show ────────────────────
  const renderMainContent = () => {
    if (!selection) {
      return <WelcomeScreen />;
    }

    if (selection.type === "term") {
      return (
        <TermView
          term={selectedTerm}
          formations={formations}
          allTerms={glossaryTerms}
          onSelectFormation={handleSelectFormation}
          onSelectTerm={handleSelectTerm}
        />
      );
    }

    return (
      <FieldView
        formation={selectedFormation}
        formations={formations}
        glossaryTerms={glossaryTerms}
        onSelectFormation={handleSelectFormation}
        onSelectTerm={handleSelectTerm}
      />
    );
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

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </SettingsProvider>
  );
}