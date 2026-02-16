export type TermCategory = "scoring" | "positions" | "plays" | "rules" | "general";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: TermCategory;
}

// Unified selection state for the app
export type Selection =
  | { type: "formation"; id: string }
  | { type: "term"; id: string }
  | null;