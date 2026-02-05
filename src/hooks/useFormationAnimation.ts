import { useState, useEffect, useRef, useCallback } from "react";
import { type Formation, type PlayerPosition } from "../types/formations";

// ─── Timing constants (ms) ────────────────────────────────────────────────────
/** How long the exit slide takes */
const EXIT_DURATION = 220;
/** How long the enter slide takes */
const ENTER_DURATION = 220;
/** How long same-category interpolation takes */
const INTERPOLATE_DURATION = 450;

// ─── Easing ────────────────────────────────────────────────────────────────────
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Animation phase enum ─────────────────────────────────────────────────────
export const enum AnimPhase {
  IDLE = 0,
  INTERPOLATING = 1, // smooth move between same-category formations
  EXITING = 2,       // old players slide off
  ENTERING = 3,      // new players slide in
}

// ─── Rendered player snapshot (what the field component actually draws) ───────
export interface RenderedPlayer {
  key: string;
  label: string;
  /** 0-1 normalised x */
  x: number;
  /** 0-1 normalised y */
  y: number;
  /** 0 fully transparent, 1 fully opaque — used during fade edges of slide */
  opacity: number;
}

/**
 * Manages all animation state for the formation field.
 *
 * @param formation   The currently-selected formation (null = nothing selected)
 * @param enabled     Whether animations are enabled (settings toggle)
 * @returns            The current rendered player list and the active phase
 */
export function useFormationAnimation(
  formation: Formation | null,
  enabled: boolean
) {
  // ── What the field actually renders ──
  const [renderedPlayers, setRenderedPlayers] = useState<RenderedPlayer[]>([]);
  const [phase, setPhase] = useState<AnimPhase>(AnimPhase.IDLE);

  // ── Refs that the RAF loop reads without re-renders ──
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Snapshot refs for the "from" and "to" states so the RAF closure
  // doesn't go stale.
  const fromPlayersRef = useRef<RenderedPlayer[]>([]);
  const toPlayersRef   = useRef<RenderedPlayer[]>([]);
  const phaseRef        = useRef<AnimPhase>(AnimPhase.IDLE);
  const durationRef     = useRef<number>(0);
  // Direction the players should slide: -1 = slide left (off), +1 = slide right (in)
  const slideDirectionRef = useRef<-1 | 1>(1);
  // The previous formation's category, so we know if a category switch happened
  const prevCategoryRef = useRef<"offensive" | "defensive" | null>(null);
  // Keep a stable reference to the latest `enabled` flag
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // ── Cancel any running animation ──────────────────────────────────────────
  const cancelAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── Core RAF loop ─────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const t = Math.min(elapsed / durationRef.current, 1);
    const currentPhase = phaseRef.current;

    if (currentPhase === AnimPhase.INTERPOLATING) {
      // Lerp each player position using matching keys where possible,
      // fall back to index-based pairing for extras.
      const eased = easeInOutCubic(t);
      const from = fromPlayersRef.current;
      const to   = toPlayersRef.current;

      // Build a key→player map for "from"
      const fromMap = new Map(from.map((p) => [p.key, p]));
      const result: RenderedPlayer[] = to.map((tp) => {
        const fp = fromMap.get(tp.key);
        if (fp) {
          return {
            key: tp.key,
            label: tp.label,
            x: fp.x + (tp.x - fp.x) * eased,
            y: fp.y + (tp.y - fp.y) * eased,
            opacity: 1,
          };
        }
        // New player not in "from" — fade in over the second half
        const fadeT = Math.min((t - 0.5) * 2, 1);
        return { ...tp, opacity: t < 0.5 ? 0 : easeOutCubic(fadeT) };
      });

      // Players that were in "from" but not in "to" — fade out over first half
      const toKeys = new Set(to.map((p) => p.key));
      from.forEach((fp) => {
        if (!toKeys.has(fp.key)) {
          const fadeT = Math.min(t * 2, 1); // 0→1 over first half
          result.push({ ...fp, opacity: 1 - easeOutCubic(fadeT) });
        }
      });

      setRenderedPlayers(result);

      if (t >= 1) {
        // Snap to exact target
        setRenderedPlayers(to.map((p) => ({ ...p, opacity: 1 })));
        phaseRef.current = AnimPhase.IDLE;
        setPhase(AnimPhase.IDLE);
        return; // don't request next frame
      }
    } else if (currentPhase === AnimPhase.EXITING) {
      // Slide every player off-screen in slideDirection
      const eased = easeOutCubic(t);
      // Players slide 1.5 units in x (guarantees full off-screen for any x ∈ [0,1])
      const offset = slideDirectionRef.current * 1.5 * eased;

      const result = fromPlayersRef.current.map((p) => ({
        ...p,
        x: p.x + offset,
        // Slight fade toward the end
        opacity: t > 0.7 ? 1 - easeOutCubic((t - 0.7) / 0.3) : 1,
      }));
      setRenderedPlayers(result);

      if (t >= 1) {
        // Transition complete → immediately start ENTERING
        setRenderedPlayers([]);
        phaseRef.current = AnimPhase.ENTERING;
        setPhase(AnimPhase.ENTERING);
        durationRef.current = ENTER_DURATION;
        startTimeRef.current = performance.now();
        // "from" for entering is the target positions offset off-screen on the OTHER side
        const enterDir = -slideDirectionRef.current as -1 | 1;
        slideDirectionRef.current = enterDir;
        fromPlayersRef.current = toPlayersRef.current.map((p) => ({
          ...p,
          x: p.x + enterDir * 1.5,
          opacity: 0,
        }));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
    } else if (currentPhase === AnimPhase.ENTERING) {
      // Slide players in from off-screen toward their real positions
      const eased = easeOutCubic(t);
      const enterDir = slideDirectionRef.current; // direction they came FROM
      // from positions are already offset; lerp toward toPlayers
      const from = fromPlayersRef.current;
      const to   = toPlayersRef.current;

      const result: RenderedPlayer[] = to.map((tp, i) => {
        const fp = from[i] ?? tp;
        return {
          key: tp.key,
          label: tp.label,
          x: fp.x + (tp.x - fp.x) * eased,
          y: fp.y + (tp.y - fp.y) * eased,
          // Fade in during first 40 %
          opacity: t < 0.4 ? easeOutCubic(t / 0.4) : 1,
        };
      });
      setRenderedPlayers(result);

      if (t >= 1) {
        setRenderedPlayers(to.map((p) => ({ ...p, opacity: 1 })));
        phaseRef.current = AnimPhase.IDLE;
        setPhase(AnimPhase.IDLE);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Helper: start a RAF loop ──────────────────────────────────────────────
  const startAnimation = useCallback((newPhase: AnimPhase, duration: number) => {
    cancelAnimation();
    phaseRef.current = newPhase;
    setPhase(newPhase);
    durationRef.current = duration;
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelAnimation, tick]);

  // ── React to formation changes ─────────────────────────────────────────────
  useEffect(() => {
    cancelAnimation();

    // Nothing selected → clear the field
    if (!formation) {
      setRenderedPlayers([]);
      setPhase(AnimPhase.IDLE);
      phaseRef.current = AnimPhase.IDLE;
      prevCategoryRef.current = null;
      return;
    }

    const targetPlayers: RenderedPlayer[] = formation.players.map((p) => ({
      ...p,
      opacity: 1,
    }));

    // ── Animations disabled: instant swap ──────────────────────────────────
    if (!enabledRef.current) {
      setRenderedPlayers(targetPlayers);
      setPhase(AnimPhase.IDLE);
      phaseRef.current = AnimPhase.IDLE;
      fromPlayersRef.current = targetPlayers;
      toPlayersRef.current   = targetPlayers;
      prevCategoryRef.current = formation.category;
      return;
    }

    const prevCategory = prevCategoryRef.current;
    const categorySwitch =
      prevCategory !== null && prevCategory !== formation.category;

    toPlayersRef.current = targetPlayers;

    if (categorySwitch) {
      // ── Category switch: EXIT then ENTER ────────────────────────────────
      // Offensive players exit to the LEFT (toward backfield),
      // Defensive players exit to the RIGHT (toward backfield from their POV).
      // Flip if the switch is the other way.
      if (prevCategory === "offensive") {
        slideDirectionRef.current = -1; // offense slides left off
      } else {
        slideDirectionRef.current = 1;  // defense slides right off
      }
      // fromPlayers = whatever is currently on screen (already set)
      // (fromPlayersRef already holds the last rendered set from previous IDLE)
      startAnimation(AnimPhase.EXITING, EXIT_DURATION);
    } else if (prevCategory === null) {
      // ── First selection ever: fade/slide in from right ──────────────────
      slideDirectionRef.current = 1; // they come from the right
      fromPlayersRef.current = targetPlayers.map((p) => ({
        ...p,
        x: p.x + 1.5,
        opacity: 0,
      }));
      startAnimation(AnimPhase.ENTERING, ENTER_DURATION);
    } else {
      // ── Same category: interpolate ──────────────────────────────────────
      // fromPlayers should already be the current rendered positions (snapped at IDLE end)
      startAnimation(AnimPhase.INTERPOLATING, INTERPOLATE_DURATION);
    }

    prevCategoryRef.current = formation.category;
  }, [formation, cancelAnimation, startAnimation]);

  // Keep fromPlayers in sync when we reach IDLE so the next transition starts
  // from the right place.
  useEffect(() => {
    if (phase === AnimPhase.IDLE && renderedPlayers.length > 0) {
      fromPlayersRef.current = renderedPlayers;
    }
  }, [phase, renderedPlayers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  return { renderedPlayers, phase };
}