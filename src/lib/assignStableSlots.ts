import type { PlayerPosition } from "../types/formations";

/**
 * Tier penalties. Each gap must exceed the maximum possible in-tier
 * distance (√2 ≈ 1.414 in a unit square) so a lower tier always wins
 * regardless of spatial distance.
 */
const LABEL_MATCH_PENALTY = 2;
const NO_MATCH_PENALTY = 10;

interface Pairing {
  prevSlot: number;
  nextIdx: number;
  cost: number;
}

/**
 * Reassigns `slot` values on `next` so that semantically similar players
 * inherit the slot of their counterpart in `prev`.
 *
 * Matching priority:
 *   1. Exact `key` match   (e.g. "lw" → "lw")
 *   2. Exact `label` match (e.g. "W"  → "W")
 *   3. Spatial proximity only
 *
 * Greedy assignment: optimal across tiers (penalties dominate distance);
 * near-optimal within a tier, which is good enough for symmetric L/R
 * pairs that don't cross.
 *
 * Returns a new array; neither input is mutated.
 */
export function assignStableSlots<T extends PlayerPosition>(
  prev: readonly T[] | null,
  next: readonly T[]
): T[] {
  // First render, or category just changed — nothing to match against.
  if (!prev || prev.length === 0) {
    return next.map((p) => ({ ...p }));
  }

  // Build every candidate pairing with its cost.
  const pairings: Pairing[] = [];
  for (const p of prev) {
    for (let nextIdx = 0; nextIdx < next.length; nextIdx++) {
      pairings.push({
        prevSlot: p.slot,
        nextIdx,
        cost: pairCost(p, next[nextIdx]),
      });
    }
  }

  // Cheapest first.
  pairings.sort((a, b) => a.cost - b.cost);

  // Greedily claim pairings.
  const claimedPrevSlots = new Set<number>();
  const claimedNextIdx = new Set<number>();
  const assignedSlots: (number | undefined)[] = new Array(next.length);

  for (const { prevSlot, nextIdx } of pairings) {
    if (claimedPrevSlots.has(prevSlot)) continue;
    if (claimedNextIdx.has(nextIdx)) continue;
    assignedSlots[nextIdx] = prevSlot;
    claimedPrevSlots.add(prevSlot);
    claimedNextIdx.add(nextIdx);
    if (claimedNextIdx.size === next.length) break;
  }

  // Any leftover `next` players (next.length > prev.length) need fresh,
  // collision-free slot numbers. They'll mount as new nodes — no prior
  // DOM to transition from anyway.
  let overflowSlot =
    Math.max(
      -1,
      ...prev.map((p) => p.slot),
      ...next.map((p) => p.slot)
    ) + 1;

  return next.map((player, idx) => ({
    ...player,
    slot: assignedSlots[idx] ?? overflowSlot++,
  }));
}

function pairCost(a: PlayerPosition, b: PlayerPosition): number {
  const tier =
    a.key === b.key
      ? 0
      : a.label === b.label
        ? LABEL_MATCH_PENALTY
        : NO_MATCH_PENALTY;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return tier + Math.sqrt(dx * dx + dy * dy);
}