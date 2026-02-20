import { useCallback } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
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
import { useState } from "react";

/**
 * Wrapper component for the formation view that extracts the ID from URL params
 */
function FormationPage({
  onSelectFormation,
  onSelectTerm,
}: {
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const formation = formations.find((f) => f.id === id) ?? null;

  // If formation not found, redirect to home
  if (!formation) {
    return <Navigate to="/" replace />;
  }

  return (
    <FieldView
      formation={formation}
      formations={formations}
      glossaryTerms={glossaryTerms}
      onSelectFormation={onSelectFormation}
      onSelectTerm={onSelectTerm}
    />
  );
}

/**
 * Wrapper component for the term view that extracts the ID from URL params
 */
function TermPage({
  onSelectFormation,
  onSelectTerm,
}: {
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const term = glossaryTerms.find((t) => t.id === id) ?? null;

  // If term not found, redirect to home
  if (!term) {
    return <Navigate to="/" replace />;
  }

  return (
    <TermView
      term={term}
      formations={formations}
      allTerms={glossaryTerms}
      onSelectFormation={onSelectFormation}
      onSelectTerm={onSelectTerm}
    />
  );
}

/**
 * Derives the current selection from URL params for the sidebar highlight
 */
function useSelectionFromPath(): Selection {
  const path = window.location.hash.replace(/^#/, "");
  
  if (path.startsWith("/formation/")) {
    const id = path.replace("/formation/", "");
    if (formations.some((f) => f.id === id)) {
      return { type: "formation", id };
    }
  }
  
  if (path.startsWith("/term/")) {
    const id = path.replace("/term/", "");
    if (glossaryTerms.some((t) => t.id === id)) {
      return { type: "term", id };
    }
  }
  
  return null;
}

export default function App() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const selection = useSelectionFromPath();

  const handleSelectFormation = useCallback(
    (id: string) => {
      navigate(`/formation/${id}`);
    },
    [navigate]
  );

  const handleSelectTerm = useCallback(
    (id: string) => {
      navigate(`/term/${id}`);
    },
    [navigate]
  );

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
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route
              path="/formation/:id"
              element={
                <FormationPage
                  onSelectFormation={handleSelectFormation}
                  onSelectTerm={handleSelectTerm}
                />
              }
            />
            <Route
              path="/term/:id"
              element={
                <TermPage
                  onSelectFormation={handleSelectFormation}
                  onSelectTerm={handleSelectTerm}
                />
              }
            />
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </SettingsProvider>
  );
}