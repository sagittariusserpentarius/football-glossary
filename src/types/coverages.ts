export interface Point {
  x: number;
  y: number;
}

export type ZoneKind = "deep" | "hook" | "flat";
export type ArrowKind = "man" | "blitz";

/** A filled polygonal area of the field that a defender is responsible for. */
export interface ZoneResponsibility {
  type: "zone";
  kind: ZoneKind;
  /** Key of the defender this zone belongs to (for legend/attribution). */
  playerKey: string;
  /** Polygon vertices in coverage-view coordinates (0–1). */
  points: Point[];
  color?: string;
  /** Optional caption drawn in the centre of the polygon. */
  label?: string;
}

/** A dashed line — e.g. the drop of a linebacker or a zone edge. */
export interface LineResponsibility {
  type: "line";
  playerKey: string;
  /** Starting point; defaults to the assigned player's position. */
  from?: Point;
  to: Point;
  color?: string;
  label?: string;
}

/** A solid arrow — e.g. man assignment, spy, or blitz path. */
export interface ArrowResponsibility {
  type: "arrow";
  kind: ArrowKind;
  playerKey: string;
  from?: Point;
  to: Point;
  color?: string;
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
  /** A defensive formation that illustrates the coverage. */
  defensiveFormationId: string;
  /** An opposing offensive formation used to give the coverage context. */
  offensiveFormationId: string;
  /** Optional per-player position overrides (defensive side). */
  alignments?: Record<string, Point>;
  responsibilities: Responsibility[];
}