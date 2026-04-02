import type { PlayerPosition } from "../types/formations";

// Tier gaps must exceed max distance (√2) so lower tiers always win.
const LABEL_MATCH_PENALTY = 2;
const NO_MATCH_PENALTY = 10;

interface Pairing {
  prevSlot: number;
  nextIdx: number;
  cost: number;
}

/**
 * Reassigns `slot` on `next` so semantically similar players inherit
 * their counterpart's slot from `prev`. Priority: key > label > distance.
 * Greedy — optimal across tiers, good enough within.
 */
export function assignStableSlots<T extends PlayerPosition>(
  prev: readonly T[] | null,
  next: readonly T[]
): T[] {
  if (!prev || prev.length === 0) {
    return next.map((p) => ({ ...p }));
  }

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
  pairings.sort((a, b) => a.cost - b.cost);

  const claimedPrevSlots = new Set<number>();
  const assignedSlots: (number | undefined)[] = new Array(next.length);

  for (const { prevSlot, nextIdx } of pairings) {
    if (claimedPrevSlots.has(prevSlot)) continue;
    if (assignedSlots[nextIdx] !== undefined) continue;
    assignedSlots[nextIdx] = prevSlot;
    claimedPrevSlots.add(prevSlot);
  }

  return next.map((player, idx) => ({
    ...player,
    slot: assignedSlots[idx]!,
  }));
}

function distance(a: PlayerPosition, b: PlayerPosition): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pairCost(a: PlayerPosition, b: PlayerPosition): number {
  const tier =
    a.key === b.key
      ? 0
      : a.label === b.label
        ? LABEL_MATCH_PENALTY
        : NO_MATCH_PENALTY;
  return tier + distance(a, b);
}