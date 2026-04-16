export interface Point {
  x: number;
  y: number;
}

export type ZoneKind = "deep" | "hook" | "flat";
export type ArrowKind = "man" | "blitz";

export interface ZoneResponsibility {
  type: "zone";
  kind: ZoneKind;
  playerKey: string;
  points: Point[];
  label?: string;
}

export interface LineResponsibility {
  type: "line";
  playerKey: string;
  from?: Point;
  to: Point;
  color?: string;
  label?: string;
}

export interface ArrowResponsibility {
  type: "arrow";
  kind: ArrowKind;
  playerKey: string;
  from?: Point;
  to: Point;
  /**
   * Key of the offensive player this arrow targets (e.g. "wr1").
   * When set and the player exists in the current offensive formation,
   * the arrow endpoint tracks that player's position instead of using
   * the static `to` coordinate. Falls back to `to` when the key is
   * absent from the active formation.
   */
  targetKey?: string;
  label?: string;
}

export type Responsibility =
  | ZoneResponsibility
  | LineResponsibility
  | ArrowResponsibility;

export interface Coverage {
  id: string;
  name: string;
  description: string;
  defensiveFormationId: string;
  offensiveFormationId: string;
  alignments?: Record<string, Point>;
  responsibilities: Responsibility[];
}