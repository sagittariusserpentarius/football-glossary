import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formations } from "./data/formations";
import { SettingsProvider } from "./context/SettingsContext";
import Sidebar from "./components/sidebar/Sidebar";
import FieldView from "./components/field/FieldView";
import { cn } from "./lib/utils";

export default function App() {
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(
    null
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedFormation =
    formations.find((f) => f.id === selectedFormationId) ?? null;

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
              selectedFormationId={selectedFormationId}
              onSelectFormation={setSelectedFormationId}
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

        {/* Main content: field + description */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <FieldView formation={selectedFormation} />
        </div>
      </div>
    </SettingsProvider>
  );
}