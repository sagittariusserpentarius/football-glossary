import { type Formation } from "../types/formations";

export const formations: Formation[] = [
  {
    id: "i-formation",
    name: "I Formation",
    category: "offensive",
    description:
      "A classic offensive formation in which the quarterback, running back, " +
      "and fullback align in a single vertical line behind the center. The " +
      "backfield creates an \"I\" shape. It provides a strong base for run " +
      "plays while keeping passing options open through play action.",
    /*
     * Layout (x increases toward line of scrimmage on the right,
     * y=0 bottom sideline, y=1 top sideline).
     *
     *   WR ──── LT  G  C  G  RT ──── WR
     *                         QB
     *                         HB
     *                         FB
     */
    players: [
      { key: "c",  label: "C",  x: 0.62, y: 0.50 },
      { key: "lg", label: "G",  x: 0.58, y: 0.42 },
      { key: "rg", label: "G",  x: 0.58, y: 0.58 },
      { key: "lt", label: "T",  x: 0.54, y: 0.36 },
      { key: "rt", label: "T",  x: 0.54, y: 0.64 },
      { key: "wr1",label: "WR", x: 0.54, y: 0.12 },
      { key: "wr2",label: "WR", x: 0.54, y: 0.88 },
      { key: "qb", label: "QB", x: 0.48, y: 0.50 },
      { key: "hb", label: "HB", x: 0.38, y: 0.50 },
      { key: "fb", label: "FB", x: 0.28, y: 0.50 },
    ],
  },
  {
    id: "shotgun",
    name: "Shotgun",
    category: "offensive",
    description:
      "The shotgun formation places the quarterback five to seven yards " +
      "behind the center at the snap, giving him a wider view of the " +
      "defense and more time to react. Widely used in modern passing attacks " +
      "and also effective for screen and draw plays.",
    /*
     *   WR ──── LT  G  C  G  RT ──── WR
     *                    QB
     *               RB       RB
     */
    players: [
      { key: "c",  label: "C",  x: 0.62, y: 0.50 },
      { key: "lg", label: "G",  x: 0.58, y: 0.42 },
      { key: "rg", label: "G",  x: 0.58, y: 0.58 },
      { key: "lt", label: "T",  x: 0.54, y: 0.36 },
      { key: "rt", label: "T",  x: 0.54, y: 0.64 },
      { key: "wr1",label: "WR", x: 0.54, y: 0.12 },
      { key: "wr2",label: "WR", x: 0.54, y: 0.88 },
      { key: "qb", label: "QB", x: 0.40, y: 0.50 },
      { key: "rb1",label: "RB", x: 0.34, y: 0.38 },
      { key: "rb2",label: "RB", x: 0.34, y: 0.62 },
    ],
  },
  {
    id: "4-3-defense",
    name: "4-3 Defense",
    category: "defensive",
    description:
      "A defensive base formation built around four defensive linemen and " +
      "three linebackers. The defensive line creates pressure at the point " +
      "of attack while the three linebackers rotate to cover both run and " +
      "pass responsibilities. It is one of the two dominant base defenses " +
      "in modern football, alongside the 3-4.",
    /*
     *   FS ─────── MLB ────── SS
     *         OLB         OLB
     *     DE   DT   DT   DE
     *  ─────────── LOS ───────────
     */
    players: [
      { key: "de1", label: "DE", x: 0.50, y: 0.18 },
      { key: "dt1", label: "DT", x: 0.50, y: 0.38 },
      { key: "dt2", label: "DT", x: 0.50, y: 0.58 },
      { key: "de2", label: "DE", x: 0.50, y: 0.82 },
      { key: "olb1",label: "OLB",x: 0.40, y: 0.28 },
      { key: "mlb", label: "MLB",x: 0.40, y: 0.50 },
      { key: "olb2",label: "OLB",x: 0.40, y: 0.72 },
      { key: "cb1", label: "CB", x: 0.28, y: 0.10 },
      { key: "cb2", label: "CB", x: 0.28, y: 0.90 },
      { key: "fs",  label: "FS", x: 0.18, y: 0.30 },
      { key: "ss",  label: "SS", x: 0.18, y: 0.70 },
    ],
  },
  {
    id: "3-4-defense",
    name: "3-4 Defense",
    category: "defensive",
    description:
      "A defensive formation with three linemen and four linebackers. The " +
      "single nose tackle lines up directly over the center while four " +
      "linebackers provide versatile pass-rush and coverage options. " +
      "Particularly effective in modern NFL schemes.",
    /*
     *   FS ──── OLB  MLB  OLB ──── SS
     *              CB         CB
     *          DE   NT   DE
     *  ─────────── LOS ───────────
     */
    players: [
      { key: "de1", label: "DE", x: 0.50, y: 0.30 },
      { key: "nt",  label: "NT", x: 0.50, y: 0.50 },
      { key: "de2", label: "DE", x: 0.50, y: 0.70 },
      { key: "olb1",label: "OLB",x: 0.40, y: 0.20 },
      { key: "mlb1",label: "MLB",x: 0.40, y: 0.40 },
      { key: "mlb2",label: "MLB",x: 0.40, y: 0.60 },
      { key: "olb2",label: "OLB",x: 0.40, y: 0.80 },
      { key: "cb1", label: "CB", x: 0.28, y: 0.15 },
      { key: "cb2", label: "CB", x: 0.28, y: 0.85 },
      { key: "fs",  label: "FS", x: 0.18, y: 0.35 },
      { key: "ss",  label: "SS", x: 0.18, y: 0.65 },
    ],
  },
];