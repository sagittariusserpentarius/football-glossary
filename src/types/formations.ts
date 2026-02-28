export type FormationCategory = "offensive" | "defensive" | "special-teams";

export interface PlayerPosition {
  /** Unique key within a formation, e.g. "qb", "wr1" */
  key: string;
  /**
   * Stable slot index shared across formations of the same category.
   * Used to build React keys so DOM nodes persist across same-unit switches.
   */
  slot: number;
  /** Display label on the player dot */
  label: string;
  /** Full position name shown on hover */
  positionName: string;
  /**
   * Normalised position on the field.
   * x: 0 (left/backfield) → 1 (right/line of scrimmage and beyond)
   * y: 0 (top/sideline) → 1 (bottom/opposite sideline)
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

export interface RenderedPlayer extends PlayerPosition {
  opacity: number;
}