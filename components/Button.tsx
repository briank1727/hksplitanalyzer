import { ButtonHTMLAttributes } from "react";
import Image from "next/image";

type Variant = "primary" | "secondary" | "success";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:text-white dark:hover:bg-gray-900",
  secondary:
    "bg-black text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200",
  success:
    "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-500 shadow-[0_0_22px_rgba(34,197,94,0.35)] hover:shadow-[0_0_30px_rgba(34,197,94,0.55)]",
};

// Shared by every variant so a disabled button always reads as greyed out.
const DISABLED =
  "disabled:pointer-events-none disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500";

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-2 text-base",
  md: "h-11 px-3 text-lg",
  lg: "h-13 px-4 text-xl font-[family-name:var(--font-trajan)]",
};

// Like the in-game menu, the fleurs only appear beside the hovered/focused item.
const FLEUR =
  "shrink-0 opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

const embellishmentSize: Record<Size, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const imgWidth = embellishmentSize[size];
  // Keep the asset's 74x89 aspect ratio, and set the height inline so Tailwind's
  // `img { height: auto }` can't make the rendered size differ from the props.
  const imgHeight = Math.round((imgWidth * 89) / 74);

  return (
    <button
      type={type}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 ${DISABLED} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Image
        src="/button_embelishment.png"
        alt=""
        width={imgWidth}
        height={imgHeight}
        style={{ height: imgHeight }}
        className={`${FLEUR} -translate-x-1`}
      />
      <span className={size === "lg" ? "translate-y-0.5" : undefined}>
        {children}
      </span>
      <Image
        src="/button_embelishment.png"
        alt=""
        width={imgWidth}
        height={imgHeight}
        style={{ height: imgHeight }}
        className={`${FLEUR} translate-x-1 scale-x-[-1]`}
      />
    </button>
  );
}
