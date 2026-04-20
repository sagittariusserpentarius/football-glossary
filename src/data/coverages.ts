import type { Coverage } from "../types/coverages";

export const coverages: Coverage[] = [
  {
    id: "cover-2",
    name: "Cover 2",
    description:
      "A zone defense with two deep safeties, each responsible for half of the deep field. The cornerbacks roll down and play the flats while the three linebackers drop into hook and curl zones underneath. Balanced against both the run and pass, but vulnerable down the seams and in the soft spot between the corner and the safety.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    alignments: {
      // Corners roll down to the flat.
      cb1: { x: 0.50, y: 0.15 },
      cb2: { x: 0.50, y: 0.85 },
      // Safeties split deep halves.
      fs:  { x: 0.10, y: 0.25 },
      ss:  { x: 0.10, y: 0.75 },
    },
    responsibilities: [
      { type: "zone", kind: "deep", playerKey: "fs", label: "Deep Half",
        points: [{ x: 0.00, y: 0.00 }, { x: 0.32, y: 0.00 }, { x: 0.32, y: 0.50 }, { x: 0.00, y: 0.50 }] },
      { type: "zone", kind: "deep", playerKey: "ss", label: "Deep Half",
        points: [{ x: 0.00, y: 0.50 }, { x: 0.32, y: 0.50 }, { x: 0.32, y: 1.00 }, { x: 0.00, y: 1.00 }] },

      { type: "zone", kind: "flat", playerKey: "cb1", label: "Flat",
        points: [{ x: 0.32, y: 0.00 }, { x: 0.60, y: 0.00 }, { x: 0.60, y: 0.25 }, { x: 0.32, y: 0.25 }] },
      { type: "zone", kind: "flat", playerKey: "cb2", label: "Flat",
        points: [{ x: 0.32, y: 0.75 }, { x: 0.60, y: 0.75 }, { x: 0.60, y: 1.00 }, { x: 0.32, y: 1.00 }] },

      { type: "zone", kind: "hook", playerKey: "olb1", label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.25 }, { x: 0.60, y: 0.25 }, { x: 0.60, y: 0.42 }, { x: 0.32, y: 0.42 }] },
      { type: "zone", kind: "hook", playerKey: "mlb", label: "Hook",
        points: [{ x: 0.32, y: 0.42 }, { x: 0.60, y: 0.42 }, { x: 0.60, y: 0.58 }, { x: 0.32, y: 0.58 }] },
      { type: "zone", kind: "hook", playerKey: "olb2", label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.58 }, { x: 0.60, y: 0.58 }, { x: 0.60, y: 0.75 }, { x: 0.32, y: 0.75 }] },
    ],
  },

  {
    id: "cover-3",
    name: "Cover 3",
    description:
      "A zone defense with three defenders splitting the deep field into thirds — the cornerbacks take the deep outside thirds while the free safety covers the deep middle. The strong safety rolls down to the strong-side flat, and the linebackers fill the remaining hook and curl zones underneath, keeping an extra defender close to the line of scrimmage against the run.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    alignments: {
      cb1:  { x: 0.14, y: 0.12 },
      cb2:  { x: 0.14, y: 0.88 },
      fs:   { x: 0.08, y: 0.50 },
      ss:   { x: 0.38, y: 0.82 }, // walked down to the strong flat
      olb1: { x: 0.42, y: 0.25 },
      mlb:  { x: 0.42, y: 0.50 },
      olb2: { x: 0.42, y: 0.64 },
    },
    responsibilities: [
      { type: "zone", kind: "deep", playerKey: "cb1", label: "Deep Third",
        points: [{ x: 0.00, y: 0.00 }, { x: 0.30, y: 0.00 }, { x: 0.30, y: 0.33 }, { x: 0.00, y: 0.33 }] },
      { type: "zone", kind: "deep", playerKey: "fs", label: "Deep Middle",
        points: [{ x: 0.00, y: 0.33 }, { x: 0.30, y: 0.33 }, { x: 0.30, y: 0.67 }, { x: 0.00, y: 0.67 }] },
      { type: "zone", kind: "deep", playerKey: "cb2", label: "Deep Third",
        points: [{ x: 0.00, y: 0.67 }, { x: 0.30, y: 0.67 }, { x: 0.30, y: 1.00 }, { x: 0.00, y: 1.00 }] },

      { type: "zone", kind: "hook", playerKey: "olb1", label: "Curl/Flat",
        points: [{ x: 0.30, y: 0.00 }, { x: 0.60, y: 0.00 }, { x: 0.60, y: 0.35 }, { x: 0.30, y: 0.35 }] },
      { type: "zone", kind: "hook", playerKey: "mlb", label: "Hook",
        points: [{ x: 0.30, y: 0.35 }, { x: 0.60, y: 0.35 }, { x: 0.60, y: 0.55 }, { x: 0.30, y: 0.55 }] },
      { type: "zone", kind: "hook", playerKey: "olb2", label: "Curl",
        points: [{ x: 0.30, y: 0.55 }, { x: 0.60, y: 0.55 }, { x: 0.60, y: 0.73 }, { x: 0.30, y: 0.73 }] },
      { type: "zone", kind: "flat", playerKey: "ss", label: "Strong Flat",
        points: [{ x: 0.30, y: 0.73 }, { x: 0.60, y: 0.73 }, { x: 0.60, y: 1.00 }, { x: 0.30, y: 1.00 }] },
    ],
  },

  {
    id: "cover-1",
    name: "Cover 1 (Man Free)",
    description:
      "A man-to-man coverage with a single deep safety playing centerfield. Cornerbacks lock onto outside receivers, the strong safety matches up on the tight end, and linebackers cover any running backs out of the backfield. The free safety provides deep help over the top while an extra defender is freed up to blitz the quarterback.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    alignments: {
      cb1:  { x: 0.50, y: 0.13 }, // pressed on WR1
      cb2:  { x: 0.50, y: 0.87 }, // pressed on WR2
      fs:   { x: 0.08, y: 0.50 }, // deep middle
      ss:   { x: 0.40, y: 0.72 }, // over the TE
      mlb:  { x: 0.42, y: 0.42 }, // matched on RB1
      olb1: { x: 0.42, y: 0.26 }, // blitz
      olb2: { x: 0.42, y: 0.58 }, // matched on RB2
    },
    responsibilities: [
      // Single-high safety
      { type: "zone", kind: "deep", playerKey: "fs", label: "Deep Middle",
        points: [{ x: 0.00, y: 0.20 }, { x: 0.30, y: 0.20 }, { x: 0.30, y: 0.80 }, { x: 0.00, y: 0.80 }] },

      // Man assignments — `to` coordinates are in mirrored/coverage-view space.
      { type: "arrow", kind: "man",   playerKey: "cb1",  to: { x: 0.70, y: 0.12 } }, // → WR1
      { type: "arrow", kind: "man",   playerKey: "cb2",  to: { x: 0.70, y: 0.88 } }, // → WR2
      { type: "arrow", kind: "man",   playerKey: "ss",   to: { x: 0.70, y: 0.72 } }, // → TE
      { type: "arrow", kind: "man",   playerKey: "mlb",  to: { x: 0.90, y: 0.38 } }, // → RB1
      { type: "arrow", kind: "man",   playerKey: "olb2", to: { x: 0.90, y: 0.62 } }, // → RB2

      // Weakside OLB brings pressure.
      { type: "arrow", kind: "blitz", playerKey: "olb1", to: { x: 0.62, y: 0.30 } },
    ],
  },
];