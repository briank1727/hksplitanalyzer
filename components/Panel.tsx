import type { CSSProperties, HTMLAttributes } from "react";
import Image from "next/image";
import dialogTop from "@/public/dialog_top.png";
import dialogBottom from "@/public/dialog_bottom.png";

// How far the background fades out from each edge.
const TAPER = "6px";

// Fades the background to transparent at every edge: the horizontal and vertical
// gradients are intersected so the result is a rectangle with soft edges.
const TAPER_MASK: CSSProperties = {
  maskImage: [
    `linear-gradient(to right, transparent, #000 ${TAPER}, #000 calc(100% - ${TAPER}), transparent)`,
    `linear-gradient(to bottom, transparent, #000 ${TAPER}, #000 calc(100% - ${TAPER}), transparent)`,
  ].join(", "),
  maskComposite: "intersect",
};

// For a panel that sits inside another (black) panel: gray-900 stands out from it.
export const NESTED_PANEL_COLOR = "rgb(17, 24, 39)";

type PanelProps = HTMLAttributes<HTMLElement> & {
  // Background colour: any CSS colour (e.g. "#0b1119", "rgb(20 30 45)").
  color?: string;
  // Background opacity from 0 to 1. Only the background fades, never the content.
  opacity?: number;
  // Draw the Hollow Knight dialog flourishes on the top and bottom edges.
  showEmbellishments?: boolean;
};

// The flourishes are centred on each edge and pushed partly outside the panel so
// they stick out a little; the content gets extra vertical padding to clear them.
const EMBELLISHMENT_CLASS =
  "pointer-events-none absolute left-1/2 h-auto max-w-[80%]";

// A background surface for grouping content, with softly tapered edges.
// The tapered background is its own layer under the content, so the content is
// never faded. Neither layer uses z-index, so no stacking context is created and
// dialogs inside a panel still render above the whole page.
// `className` applies to the content layer, so layout classes work as usual.
export default function Panel({
  color = "#000000",
  opacity = 1,
  showEmbellishments = false,
  className = "",
  children,
  ...props
}: PanelProps) {
  return (
    <section
      // Leave room outside the panel for the part of each flourish that sticks out.
      className={`relative min-w-0 ${showEmbellishments ? "mt-4 mb-3" : ""}`}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        // Inline because Tailwind can't generate classes for runtime values.
        style={{ backgroundColor: color, opacity, ...TAPER_MASK }}
      />
      {showEmbellishments && (
        <>
          <Image
            src={dialogTop}
            alt=""
            aria-hidden="true"
            className={`${EMBELLISHMENT_CLASS} top-0 w-88 -translate-x-1/2 -translate-y-1/3`}
          />
          <Image
            src={dialogBottom}
            alt=""
            aria-hidden="true"
            className={`${EMBELLISHMENT_CLASS} bottom-0 w-64 -translate-x-1/2 translate-y-1/3`}
          />
        </>
      )}
      <div
        className={`relative px-4 ${showEmbellishments ? "pt-10 pb-7" : "py-4"} ${className}`}
      >
        {children}
      </div>
    </section>
  );
}
