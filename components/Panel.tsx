import type { HTMLAttributes } from "react";

export default function Panel({
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-black/10 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:border-white/10 dark:bg-[#0b1119]/85 ${className}`}
      {...props}
    />
  );
}
