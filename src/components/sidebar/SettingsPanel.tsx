import { useSettings } from "../../context/SettingsContext";

/**
 * A small settings dropdown rendered inside the sidebar.
 * Passed `onClose` so the parent can hide it when the user clicks outside or
 * toggles it again.
 */
export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, setSettings } = useSettings();

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-3 mb-2 mt-1 bg-slate-800 rounded-lg border border-slate-700 p-3 shadow-lg">
      <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
        Settings
      </h3>

      {/* Animation toggle */}
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-slate-400 group-hover:text-slate-200 text-sm transition-colors">
          Animations
        </span>
        <button
          onClick={() => toggle("animationsEnabled")}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
            settings.animationsEnabled ? "bg-emerald-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              settings.animationsEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </label>

      {/* Future settings can be added here */}

      {/* Close hint */}
      <button
        onClick={onClose}
        className="mt-3 w-full text-slate-500 hover:text-slate-300 text-xs text-center transition-colors"
      >
        Close
      </button>
    </div>
  );
}