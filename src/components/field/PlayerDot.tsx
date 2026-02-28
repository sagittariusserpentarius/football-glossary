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
 * A single player circle positioned via percentage left/top.
 * Percentage values let the browser handle container resizes through
 * layout alone — no ResizeObserver, and no unwanted transition on resize
 * since the style values don't change.
 */
const PlayerDot = memo(function PlayerDot({
  player,
  category,
}: PlayerDotProps) {
  // Gate transitions so newly mounted dots don't animate from a default
  // position. useState (not useRef) avoids the "ref read during render"
  // lint error. The rAF ensures the browser commits the initial position
  // before transitions are enabled.
  const [canAnimate, setCanAnimate] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Show tooltip toward field centre to reduce clipping by overflow-hidden.
  const tooltipBelow = player.y < 0.15;

  return (
    <div
      className="absolute group flex items-center justify-center rounded-full shadow-md"
      style={{
        left: `${player.x * 100}%`,
        top: `${player.y * 100}%`,
        width: DOT_SIZE,
        height: DOT_SIZE,
        // Centre the dot on its coordinate.
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

      {/* Hover tooltip — pure CSS via Tailwind group-hover, no React state. */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 px-2 py-1
          bg-slate-900/90 text-white text-xs rounded shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          pointer-events-none whitespace-nowrap z-10
          ${tooltipBelow ? "top-full mt-2" : "bottom-full mb-2"}
        `}
      >
        {player.positionName}
      </div>
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