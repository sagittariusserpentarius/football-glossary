import { useState, useEffect, useRef } from "react";
import { type Formation } from "../types/formations";

const FADE_DURATION = 300; // ms

export interface RenderedPlayer {
  key: string;
  label: string;
  x: number;
  y: number;
  opacity: number;
}

/**
 * Manages fade in/out transitions for formation changes.
 */
export function useFormationAnimation(
  formation: Formation | null,
  enabled: boolean
) {
  const [renderedPlayers, setRenderedPlayers] = useState<RenderedPlayer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const targetPlayersRef = useRef<RenderedPlayer[]>([]);
  const isFadingInRef = useRef(false);

  useEffect(() => {
    // Clear any existing animation
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // No formation selected
    if (!formation) {
      setRenderedPlayers([]);
      setIsTransitioning(false);
      return;
    }

    const targetPlayers: RenderedPlayer[] = formation.players.map((p) => ({
      ...p,
      opacity: 1,
    }));

    targetPlayersRef.current = targetPlayers;

    // Animations disabled: instant swap
    if (!enabled) {
      setRenderedPlayers(targetPlayers);
      setIsTransitioning(false);
      return;
    }

    // If we have existing players, fade them out first
    if (renderedPlayers.length > 0) {
      setIsTransitioning(true);
      isFadingInRef.current = false;
      startTimeRef.current = performance.now();

      const fadeOut = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        const opacity = 1 - progress;

        setRenderedPlayers((prev) =>
          prev.map((p) => ({ ...p, opacity }))
        );

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(fadeOut);
        } else {
          // Fade out complete, now fade in new players
          isFadingInRef.current = true;
          startTimeRef.current = performance.now();
          setRenderedPlayers(targetPlayers.map((p) => ({ ...p, opacity: 0 })));
          rafRef.current = requestAnimationFrame(fadeIn);
        }
      };

      const fadeIn = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        const opacity = progress;

        setRenderedPlayers(
          targetPlayersRef.current.map((p) => ({ ...p, opacity }))
        );

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(fadeIn);
        } else {
          setRenderedPlayers(targetPlayersRef.current);
          setIsTransitioning(false);
        }
      };

      rafRef.current = requestAnimationFrame(fadeOut);
    } else {
      // No existing players, just fade in
      setIsTransitioning(true);
      isFadingInRef.current = true;
      startTimeRef.current = performance.now();
      setRenderedPlayers(targetPlayers.map((p) => ({ ...p, opacity: 0 })));

      const fadeIn = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        const opacity = progress;

        setRenderedPlayers(
          targetPlayersRef.current.map((p) => ({ ...p, opacity }))
        );

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(fadeIn);
        } else {
          setRenderedPlayers(targetPlayersRef.current);
          setIsTransitioning(false);
        }
      };

      rafRef.current = requestAnimationFrame(fadeIn);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [formation, enabled]); // renderedPlayers intentionally not in deps

  return { renderedPlayers, isTransitioning };
}