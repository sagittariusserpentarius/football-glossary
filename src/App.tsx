import { useCallback, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formations } from "./data/formations";
import { glossaryTerms } from "./data/terms";
import { coverages } from "./data/coverages";
import { SettingsProvider } from "./context/SettingsContext";
import Sidebar from "./components/sidebar/Sidebar";
import FieldView from "./components/field/FieldView";
import CoverageView from "./components/field/CoverageView";
import TermView from "./components/term/TermView";
import WelcomeScreen from "./components/WelcomeScreen";
import type { Selection } from "./types/glossary";
import { cn } from "./lib/utils";

/* ------------------------------------------------------------------ */
/* Page wrappers                                                       */
/* ------------------------------------------------------------------ */

function FormationPage({
  onSelectFormation,
  onSelectTerm,
}: {
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const formation = formations.find((f) => f.id === id) ?? null;

  const opponentId = searchParams.get("vs") || null;

  const handleOpponentChange = useCallback(
    (formId: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (formId) next.set("vs", formId);
          else next.delete("vs");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  if (!formation) return <Navigate to="/" replace />;
  return (
    <FieldView
      formation={formation}
      formations={formations}
      glossaryTerms={glossaryTerms}
      opponentId={opponentId}
      onOpponentChange={handleOpponentChange}
      onSelectFormation={onSelectFormation}
      onSelectTerm={onSelectTerm}
    />
  );
}

function CoveragePage({
  onSelectFormation,
  onSelectTerm,
}: {
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const coverage = coverages.find((c) => c.id === id) ?? null;
  if (!coverage) return <Navigate to="/" replace />;
  return (
    <CoverageView
      coverage={coverage}
      formations={formations}
      glossaryTerms={glossaryTerms}
      onSelectFormation={onSelectFormation}
      onSelectTerm={onSelectTerm}
    />
  );
}

function TermPage({
  onSelectFormation,
  onSelectTerm,
}: {
  onSelectFormation: (id: string) => void;
  onSelectTerm: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const term = glossaryTerms.find((t) => t.id === id) ?? null;
  if (!term) return <Navigate to="/" replace />;
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

/* ------------------------------------------------------------------ */

function useSelectionFromPath(): Selection {
  const path = window.location.hash.replace(/^#/, "").split("?")[0];

  if (path.startsWith("/formation/")) {
    const id = path.replace("/formation/", "");
    if (formations.some((f) => f.id === id)) return { type: "formation", id };
  }
  if (path.startsWith("/coverage/")) {
    const id = path.replace("/coverage/", "");
    if (coverages.some((c) => c.id === id)) return { type: "coverage", id };
  }
  if (path.startsWith("/term/")) {
    const id = path.replace("/term/", "");
    if (glossaryTerms.some((t) => t.id === id)) return { type: "term", id };
  }
  return null;
}

/* ------------------------------------------------------------------ */

export default function App() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const selection = useSelectionFromPath();

  // Preserve the ?vs= opponent param when hopping between formations.
  const handleSelectFormation = useCallback(
    (id: string) => {
      const hash = window.location.hash.replace(/^#/, "");
      let search = "";
      if (hash.startsWith("/formation/")) {
        const qIdx = hash.indexOf("?");
        if (qIdx >= 0) search = hash.slice(qIdx);
      }
      navigate(`/formation/${id}${search}`);
    },
    [navigate],
  );

  // Coverages and terms are simple navigations — no params to carry.
  const handleSelectCoverage = useCallback(
    (id: string) => navigate(`/coverage/${id}`),
    [navigate],
  );

  const handleSelectTerm = useCallback(
    (id: string) => navigate(`/term/${id}`),
    [navigate],
  );

  return (
    <SettingsProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-100">
        <div
          className={cn(
            "shrink-0 overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-0" : "w-72",
          )}
        >
          <div className="w-72 h-screen">
            <Sidebar
              formations={formations}
              glossaryTerms={glossaryTerms}
              coverages={coverages}
              selection={selection}
              onSelectFormation={handleSelectFormation}
              onSelectTerm={handleSelectTerm}
              onSelectCoverage={handleSelectCoverage}
            />
          </div>
        </div>

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
              path="/coverage/:id"
              element={
                <CoveragePage
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </SettingsProvider>
  );
}