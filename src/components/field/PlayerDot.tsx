import { memo } from "react";
import { type RenderedPlayer } from "../../hooks/useFormationAnimation";
import { cn } from "../../lib/utils";

interface PlayerDotProps {
  player: RenderedPlayer;
  isOffensive: boolean;
  /** Width of the container in px — used to size the dot consistently */
  containerSize: { w: number; h: number };
}

/**
 * A single player circle rendered at normalised (x, y) coordinates.
 * Uses absolute positioning so the parent can be position: relative.
 */
const PlayerDot = memo(function PlayerDot({
  player,
  isOffensive,
  containerSize,
}: PlayerDotProps) {
  const DOT_SIZE = 34; // px diameter

  // Convert normalised coords to pixel offsets, centering the dot
  const left = player.x * containerSize.w - DOT_SIZE / 2;
  const top  = player.y * containerSize.h - DOT_SIZE / 2;

  return (
    <div
      className="absolute flex items-center justify-center rounded-full shadow-md"
      style={{
        left,
        top,
        width: DOT_SIZE,
        height: DOT_SIZE,
        opacity: player.opacity,
        // Clip if fully off-screen to avoid scroll issues
        visibility: player.x < -0.1 || player.x > 1.1 ? "hidden" : "visible",
        backgroundColor: isOffensive ? "#059669" : "#dc2626", // emerald vs red
        transition: "none", // ALL motion is driven by the hook, not CSS
      }}
    >
      <span className="text-white text-xs font-bold select-none drop-shadow">
        {player.label}
      </span>
    </div>
  );
});

export default PlayerDot;