import Image from "next/image";

// Like the in-game menu, fleurs only appear beside the hovered/focused item
// (the parent needs the `group` class), or stay visible when `active`.
const BASE = "shrink-0 transition-[opacity,translate] duration-200 ease-out";
const UNTIL_HOVER =
  "opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

export default function Fleur({
  width,
  side,
  active = false,
}: {
  width: number;
  side: "left" | "right";
  active?: boolean;
}) {
  // Keep the asset's 74x89 aspect ratio, and set the height inline so Tailwind's
  // `img { height: auto }` can't make the rendered size differ from the props.
  const height = Math.round((width * 89) / 74);
  const hidden = active
    ? ""
    : `${UNTIL_HOVER} ${side === "left" ? "-translate-x-1" : "translate-x-1"}`;

  return (
    <Image
      src="/button_embelishment.png"
      alt=""
      width={width}
      height={height}
      style={{ height }}
      className={`${BASE} ${hidden} ${side === "right" ? "scale-x-[-1]" : ""}`}
    />
  );
}
