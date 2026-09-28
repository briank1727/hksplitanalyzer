import { ButtonHTMLAttributes } from "react";
import Fleur from "@/components/Fleur";

type Variant = "primary" | "secondary" | "success";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

// Buttons have no background: the label always glows (in its own colour, dark mode
// only) to set it apart from plain text, and the fleurs slide in on hover.
const variantStyles: Record<Variant, string> = {
  primary: "text-black dark:text-zinc-50",
  secondary: "text-zinc-600 dark:text-zinc-300",
  success: "text-green-700 dark:text-green-400",
};

// Shared by every variant so a disabled button always reads as greyed out.
const DISABLED = "disabled:pointer-events-none disabled:text-zinc-500";

const LABEL_GLOW =
  "dark:[text-shadow:0_0_8px_currentColor] group-disabled:[text-shadow:none]";

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-2 text-base",
  md: "h-11 px-3 text-lg",
  lg: "h-13 px-4 text-xl",
};

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
  const fleurWidth = embellishmentSize[size];

  return (
    <button
      type={type}
      className={`group inline-flex items-center justify-center gap-2 rounded font-medium font-[family-name:var(--font-trajan)] transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 ${DISABLED} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Fleur width={fleurWidth} side="left" />
      <span className={`translate-y-0.5 ${LABEL_GLOW}`}>{children}</span>
      <Fleur width={fleurWidth} side="right" />
    </button>
  );
}
