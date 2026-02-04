import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formations } from "./data/formations";
import Sidebar from "./components/sidebar/Sidebar";
import { cn } from "./lib/utils";

export default function App() {
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(
    null
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedFormation = formations.find((f) => f.id === selectedFormationId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Sidebar: outer wrapper animates width, inner div holds fixed width */}
      <div
        className={cn(
          "flex-shrink-0 overflow-hidden",
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
        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors duration-150 px-1.5 py-4 flex items-center self-center flex-shrink-0"
        aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Main content placeholder */}
      <div className="flex-1 flex items-center justify-center">
        {selectedFormation ? (
          <div className="text-center max-w-md px-8">
            <h2 className="text-2xl font-bold text-slate-700">
              {selectedFormation.name}
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              {selectedFormation.description}
            </p>
            <p className="text-slate-400 text-xs mt-5 italic">
              Field visualization coming soon
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 text-lg font-medium">
              Select a formation
            </p>
            <p className="text-slate-300 text-sm mt-1">
              Choose a term from the sidebar to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}