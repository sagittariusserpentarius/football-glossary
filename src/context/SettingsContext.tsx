import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { type AppSettings } from "../types/settings";

interface SettingsContextValue {
  settings: AppSettings;
  setSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    animationsEnabled: true,
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}