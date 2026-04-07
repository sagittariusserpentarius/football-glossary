import type { Coverage } from "../types/coverages";

// Shared palette — deep zones blue, hook/curl yellow, flat purple, man/blitz red.
const DEEP = "#3b82f6";
const CURL = "#eab308";
const FLAT = "#8b5cf6";
const MAN  = "#ef4444";

export const coverages: Coverage[] = [
  {
    id: "cover-2",
    name: "Cover 2",
    description:
      "A zone defense with two deep safeties, each responsible for half of the deep field. The cornerbacks play the flats and the three linebackers drop into hook and curl zones underneath. Balanced against both the run and pass, but vulnerable down the seams.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    responsibilities: [
      // Deep halves
      { type: "zone", playerKey: "fs", color: DEEP, label: "Deep Half",
        points: [{ x: 0.00, y: 0.00 }, { x: 0.32, y: 0.00 }, { x: 0.32, y: 0.50 }, { x: 0.00, y: 0.50 }] },
      { type: "zone", playerKey: "ss", color: DEEP, label: "Deep Half",
        points: [{ x: 0.00, y: 0.50 }, { x: 0.32, y: 0.50 }, { x: 0.32, y: 1.00 }, { x: 0.00, y: 1.00 }] },

      // Corner flats
      { type: "zone", playerKey: "cb1", color: FLAT, label: "Flat",
        points: [{ x: 0.32, y: 0.00 }, { x: 0.60, y: 0.00 }, { x: 0.60, y: 0.22 }, { x: 0.32, y: 0.22 }] },
      { type: "zone", playerKey: "cb2", color: FLAT, label: "Flat",
        points: [{ x: 0.32, y: 0.78 }, { x: 0.60, y: 0.78 }, { x: 0.60, y: 1.00 }, { x: 0.32, y: 1.00 }] },

      // Underneath hook/curl
      { type: "zone", playerKey: "olb1", color: CURL, label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.22 }, { x: 0.60, y: 0.22 }, { x: 0.60, y: 0.40 }, { x: 0.32, y: 0.40 }] },
      { type: "zone", playerKey: "mlb", color: CURL, label: "Hook",
        points: [{ x: 0.32, y: 0.40 }, { x: 0.60, y: 0.40 }, { x: 0.60, y: 0.60 }, { x: 0.32, y: 0.60 }] },
      { type: "zone", playerKey: "olb2", color: CURL, label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.60 }, { x: 0.60, y: 0.60 }, { x: 0.60, y: 0.78 }, { x: 0.32, y: 0.78 }] },
    ],
  },

  {
    id: "cover-3",
    name: "Cover 3",
    description:
      "A zone defense with three defenders splitting the deep field into thirds — the two cornerbacks take the deep outside thirds while the free safety covers the deep middle. Four underneath defenders handle the intermediate hook/curl and flat zones, keeping an extra run defender near the line of scrimmage.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    responsibilities: [
      // Deep thirds
      { type: "zone", playerKey: "cb1", color: DEEP, label: "Deep Third",
        points: [{ x: 0.00, y: 0.00 }, { x: 0.32, y: 0.00 }, { x: 0.32, y: 0.33 }, { x: 0.00, y: 0.33 }] },
      { type: "zone", playerKey: "fs", color: DEEP, label: "Deep Middle",
        points: [{ x: 0.00, y: 0.33 }, { x: 0.32, y: 0.33 }, { x: 0.32, y: 0.67 }, { x: 0.00, y: 0.67 }] },
      { type: "zone", playerKey: "cb2", color: DEEP, label: "Deep Third",
        points: [{ x: 0.00, y: 0.67 }, { x: 0.32, y: 0.67 }, { x: 0.32, y: 1.00 }, { x: 0.00, y: 1.00 }] },

      // Underneath flats
      { type: "zone", playerKey: "ss", color: FLAT, label: "Flat",
        points: [{ x: 0.32, y: 0.00 }, { x: 0.60, y: 0.00 }, { x: 0.60, y: 0.25 }, { x: 0.32, y: 0.25 }] },
      { type: "zone", playerKey: "olb2", color: FLAT, label: "Flat",
        points: [{ x: 0.32, y: 0.75 }, { x: 0.60, y: 0.75 }, { x: 0.60, y: 1.00 }, { x: 0.32, y: 1.00 }] },

      // Underneath hook/curls
      { type: "zone", playerKey: "olb1", color: CURL, label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.25 }, { x: 0.60, y: 0.25 }, { x: 0.60, y: 0.50 }, { x: 0.32, y: 0.50 }] },
      { type: "zone", playerKey: "mlb", color: CURL, label: "Hook/Curl",
        points: [{ x: 0.32, y: 0.50 }, { x: 0.60, y: 0.50 }, { x: 0.60, y: 0.75 }, { x: 0.32, y: 0.75 }] },
    ],
  },

  {
    id: "cover-1",
    name: "Cover 1 (Man Free)",
    description:
      "A man-to-man coverage with a single deep safety playing centerfield. Cornerbacks lock onto outside receivers, linebackers match running backs out of the backfield, and the free safety provides deep help over the top. Aggressive against the pass, but vulnerable if the single-high safety is beaten deep.",
    defensiveFormationId: "4-3-defense",
    offensiveFormationId: "shotgun",
    responsibilities: [
      // Single-high safety
      { type: "zone", playerKey: "fs", color: DEEP, label: "Deep Middle",
        points: [{ x: 0.00, y: 0.20 }, { x: 0.30, y: 0.20 }, { x: 0.30, y: 0.80 }, { x: 0.00, y: 0.80 }] },

      // Man assignments — note the `to` coordinates are in coverage-view space,
      // which means they target the *mirrored* offensive positions.
      { type: "arrow", playerKey: "cb1", color: MAN, to: { x: 0.70, y: 0.12 } }, // → WR1
      { type: "arrow", playerKey: "cb2", color: MAN, to: { x: 0.70, y: 0.88 } }, // → WR2
      { type: "arrow", playerKey: "mlb", color: MAN, to: { x: 0.90, y: 0.38 } }, // → RB1
      { type: "arrow", playerKey: "ss",  color: MAN, to: { x: 0.90, y: 0.62 } }, // → RB2

      // OLBs bring pressure
      { type: "arrow", playerKey: "olb1", color: MAN, to: { x: 0.60, y: 0.28 } },
      { type: "arrow", playerKey: "olb2", color: MAN, to: { x: 0.60, y: 0.72 } },
    ],
  },
];