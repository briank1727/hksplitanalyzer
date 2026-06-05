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
    "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-400",
};

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
  const imgSize = embellishmentSize[size];

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Image
        src="/button_embelishment.png"
        alt=""
        width={imgSize}
        height={imgSize}
        className="shrink-0"
      />
      {children}
      <Image
        src="/button_embelishment.png"
        alt=""
        width={imgSize}
        height={imgSize}
        className="shrink-0 scale-x-[-1]"
      />
    </button>
  );
}
