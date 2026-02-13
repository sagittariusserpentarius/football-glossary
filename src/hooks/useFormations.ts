import { useState, useEffect } from "react";
import { type Formation } from "../types/formations";

interface UseFormationsResult {
  formations: Formation[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches formations from the static JSON file in /public/data/.
 * The effect is aborted automatically if the component unmounts before
 * the request completes.
 */
export function useFormations(): UseFormationsResult {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/formations.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load formations (HTTP ${res.status})`);
        }
        return res.json() as Promise<Formation[]>;
      })
      .then((data) => {
        setFormations(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        // Ignore the error that fires when the fetch is intentionally aborted.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });

    return () => controller.abort();
  }, []); // Runs once — the URL is stable for the lifetime of the app.

  return { formations, loading, error };
}