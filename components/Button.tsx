import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "success";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200",
  secondary:
    "border border-black/10 text-black hover:bg-black/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10",
  success:
    "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-400",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
