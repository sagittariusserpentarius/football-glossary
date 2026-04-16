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
  playerKey: string;
  /** Polygon vertices in coverage-view coordinates (0–1). */
  points: Point[];
  /** Optional caption drawn in the centre of the polygon. */
  label?: string;
}

/** A dashed connector — e.g. a linebacker drop path. */
export interface LineResponsibility {
  type: "line";
  playerKey: string;
  from?: Point;
  to: Point;
  color?: string;
  label?: string;
}

/**
 * A solid arrow. `kind` distinguishes man coverage from a rush/blitz and
 * drives colour, stroke width, arrowhead shape, and the default label.
 */
export interface ArrowResponsibility {
  type: "arrow";
  kind: ArrowKind;
  playerKey: string;
  from?: Point;
  to: Point;
  /** Rendered at the arrow's midpoint. Blitz arrows default to "BLITZ". */
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
  /**
   * Per-player alignment overrides, keyed by the defensive player's `key`.
   * Use this when a coverage requires a defender to line up somewhere other
   * than their base formation position — e.g. corners rolling down to the
   * flat in Cover 2, or a safety walking up to cover a tight end.
   */
  alignments?: Record<string, Point>;
  responsibilities: Responsibility[];
}