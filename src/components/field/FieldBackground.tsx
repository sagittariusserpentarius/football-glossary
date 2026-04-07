import { LOS_X } from "../../lib/fieldConstants";

/**
 * Decorative field markings shared by FieldView and CoverageView.
 * Kept as a single component so the two views can't drift apart.
 */
export function FieldBackground() {
  return (
    <>
      <FieldLines />
      <LineOfScrimmage />
    </>
  );
}

function FieldLines() {
  const lines = [0.2, 0.4, 0.6, 0.8];
  return (
    <>
      {lines.map((pct) => (
        <div
          key={pct}
          className="absolute top-0 bottom-0"
          style={{
            left: `${pct * 100}%`,
            width: 1,
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={`hash-${i}`}
          className="absolute left-0 right-0"
          style={{
            top: `${((i + 1) / 10) * 100}%`,
            height: 1,
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

function LineOfScrimmage() {
  return (
    <div
      className="absolute top-0 bottom-0"
      style={{
        left: `${LOS_X * 100}%`,
        width: 3,
        background: "rgba(255,255,255,0.35)",
        pointerEvents: "none",
      }}
    >
      <span
        className="absolute text-white text-xs font-semibold tracking-widest"
        style={{ top: 4, left: 6, opacity: 0.6 }}
      >
        LOS
      </span>
    </div>
  );
}