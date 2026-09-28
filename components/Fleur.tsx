import type { CSSProperties } from "react";

// Like the in-game menu, fleurs only appear beside the hovered/focused item
// (the parent needs the `group` class). When `active` they stay visible but dim,
// and only brighten and glow on hover/focus.
const BASE =
  "shrink-0 transition-[opacity,translate,filter] duration-200 ease-out";
// Soul-like glow in the text colour on hover/focus.
// Class names are written out in full so Tailwind can detect them.
const GLOW_ON_HOVER =
  "group-hover:drop-shadow-[0_0_5px_currentColor] group-focus-visible:drop-shadow-[0_0_5px_currentColor]";
const DIM_UNTIL_HOVER =
  "opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100";
const UNTIL_HOVER =
  "opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

// The fleur PNG is used as a mask over a block filled with the current text colour,
// so the fleur always matches the label next to it.
const FLEUR_MASK: CSSProperties = {
  maskImage: "url(/button_embelishment.png)",
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
};

export default function Fleur({
  width,
  side,
  active = false,
}: {
  width: number;
  side: "left" | "right";
  active?: boolean;
}) {
  // Keep the asset's 74x89 aspect ratio.
  const height = Math.round((width * 89) / 74);
  const state = active
    ? `${DIM_UNTIL_HOVER} ${GLOW_ON_HOVER}`
    : `${UNTIL_HOVER} ${GLOW_ON_HOVER} ${side === "left" ? "-translate-x-1" : "translate-x-1"}`;

  return (
    // The glow (a filter) goes on the outer span: on the masked span the mask would
    // clip it away.
    <span
      aria-hidden="true"
      className={`inline-block ${BASE} ${state}`}
      style={{ width, height }}
    >
      <span
        className={`block h-full w-full bg-current ${side === "right" ? "scale-x-[-1]" : ""}`}
        style={FLEUR_MASK}
      />
    </span>
  );
}

// Dark-mode-only variant, for dark text on a light background where a white glow looks wrong.
export const DARK_TEXT_GLOW_ON_HOVER =
  "transition-[text-shadow] duration-200 dark:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.6)] dark:group-focus-visible:[text-shadow:0_0_8px_rgba(255,255,255,0.6)]";
