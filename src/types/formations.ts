export type FormationCategory = "offensive" | "defensive";

export interface PlayerPosition {
  /** Unique key within a formation, e.g. "qb", "wr1" */
  key: string;
  /** Display label on the player dot */
  label: string;
  /**
   * Normalised position on the field.
   * x: 0 (left/backfield) → 1 (right/line of scrimmage and beyond)
   * y: 0 (bottom/sideline) → 1 (top/opposite sideline)
   */
  x: number;
  y: number;
}

export interface Formation {
  id: string;
  name: string;
  category: FormationCategory;
  description: string;
  /** Player positions normalised to a 0-1 unit square */
  players: PlayerPosition[];
}