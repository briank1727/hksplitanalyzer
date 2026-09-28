import type { ReactNode } from "react";
import Fleur, { DARK_TEXT_GLOW_ON_HOVER } from "@/components/Fleur";

export type TabItem<K extends string> = {
  key: K;
  label: ReactNode;
};

export default function Tabs<K extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: readonly TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`flex gap-2 border-b border-black/10 dark:border-white/15 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`group inline-flex items-center gap-2 px-4 py-2 text-lg font-medium font-[family-name:var(--font-trajan)] border-b-2 -mb-px transition-colors ${
              isActive
                ? "border-black text-black dark:border-zinc-50 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <Fleur width={18} side="left" active={isActive} />
            <span className={`translate-y-0.5 ${DARK_TEXT_GLOW_ON_HOVER}`}>
              {tab.label}
            </span>
            <Fleur width={18} side="right" active={isActive} />
          </button>
        );
      })}
    </div>
  );
}
