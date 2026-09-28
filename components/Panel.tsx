import type { CSSProperties, HTMLAttributes } from "react";

// How far the background fades out from each edge.
const TAPER = "12px";

// Fades the background to transparent at every edge: the horizontal and vertical
// gradients are intersected so the result is a rectangle with soft edges.
const TAPER_MASK: CSSProperties = {
  maskImage: [
    `linear-gradient(to right, transparent, #000 ${TAPER}, #000 calc(100% - ${TAPER}), transparent)`,
    `linear-gradient(to bottom, transparent, #000 ${TAPER}, #000 calc(100% - ${TAPER}), transparent)`,
  ].join(", "),
  maskComposite: "intersect",
};

// A black background surface for grouping content, with softly tapered edges.
// The tapered background is its own layer under the content, so the content is
// never faded. Neither layer uses z-index, so no stacking context is created and
// dialogs inside a panel still render above the whole page.
// `className` applies to the content layer, so layout classes work as usual.
export default function Panel({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className="relative min-w-0" {...props}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
        style={TAPER_MASK}
      />
      <div className={`relative p-4 ${className}`}>{children}</div>
    </section>
  );
}
