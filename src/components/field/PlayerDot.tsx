import { memo, useState, useEffect } from "react";
import type { RenderedPlayer, FormationCategory } from "../../types/formations";

interface PlayerDotProps {
  player: RenderedPlayer;
  category: FormationCategory;
}

const DOT_SIZE = 34;
const TRANSITION_MS = 450;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A single player circle positioned via percentage-based left/top.
 *
 * Percentage values mean the browser handles container resizes natively
 * via layout — no ResizeObserver needed and no unwanted transition on
 * resize. Transitions only fire when the normalised coordinates change
 * (i.e. a formation switch).
 */
const PlayerDot = memo(function PlayerDot({
  player,
  category,
}: PlayerDotProps) {
  // Gate transitions behind first paint so newly mounted dots don't
  // animate in from some default position. useState (not useRef) avoids
  // the "ref read during render" lint violation. The extra re-render is
  // a no-op visually since the position hasn't changed.
  const [canAnimate, setCanAnimate] = useState(false);
  useEffect(() => {
    // rAF ensures the browser has committed the initial position before
    // we enable transitions — prevents some browsers from batching the
    // mount paint with the transition-enable and animating from origin.
    const id = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="absolute flex items-center justify-center rounded-full shadow-md"
      style={{
        left: `${player.x * 100}%`,
        top: `${player.y * 100}%`,
        width: DOT_SIZE,
        height: DOT_SIZE,
        // Shift back by half the dot's own size to centre on the coord.
        transform: "translate(-50%, -50%)",
        opacity: player.opacity,
        backgroundColor: dotColor(category),
        transition: canAnimate
          ? `left ${TRANSITION_MS}ms ${EASING}, top ${TRANSITION_MS}ms ${EASING}, opacity 200ms ease`
          : "none",
      }}
    >
      <span className="text-white text-xs font-bold select-none drop-shadow">
        {player.label}
      </span>
    </div>
  );
});

function dotColor(category: FormationCategory): string {
  switch (category) {
    case "offensive":
      return "#059669";
    case "defensive":
      return "#dc2626";
    case "special-teams":
      return "#ca8a04";
  }
}

export default PlayerDot;