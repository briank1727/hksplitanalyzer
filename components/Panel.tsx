import type { CSSProperties, HTMLAttributes } from "react";

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

type PanelProps = HTMLAttributes<HTMLElement> & {
  // Background colour: any CSS colour (e.g. "#0b1119", "rgb(20 30 45)").
  color?: string;
  // Background opacity from 0 to 1. Only the background fades, never the content.
  opacity?: number;
};

// A background surface for grouping content, with softly tapered edges.
// The tapered background is its own layer under the content, so the content is
// never faded. Neither layer uses z-index, so no stacking context is created and
// dialogs inside a panel still render above the whole page.
// `className` applies to the content layer, so layout classes work as usual.
export default function Panel({
  color = "#000000",
  opacity = 1,
  className = "",
  children,
  ...props
}: PanelProps) {
  return (
    <section className="relative min-w-0" {...props}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        // Inline because Tailwind can't generate classes for runtime values.
        style={{ backgroundColor: color, opacity, ...TAPER_MASK }}
      />
      <div className={`relative p-4 ${className}`}>{children}</div>
    </section>
  );
}
