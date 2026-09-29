import type { KeyboardEvent, ReactNode } from "react";
import Fleur from "@/components/Fleur";

export type SelectOption<K extends string> = {
  value: K;
  label: ReactNode;
};

// A Hollow Knight options-menu style selector: `‹ Value ›`, where the arrows are
// fleurs that step through the options (wrapping around at either end). Replaces a
// dropdown for short option lists. Left/Right arrow keys also step while focused.
export default function OptionSelect<K extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className = "",
}: {
  options: readonly SelectOption<K>[];
  value: K;
  onChange: (value: K) => void;
  // Accessible name for the control, e.g. "Comparison".
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const step = (delta: number) => {
    if (disabled || options.length === 0) return;
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  const arrowClass =
    "group inline-flex items-center justify-center rounded px-0.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none";

  return (
    <div
      role="group"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center font-[family-name:var(--font-trajan)] ${
        disabled ? "text-zinc-500" : "text-zinc-50"
      } ${className}`}
    >
      <button
        type="button"
        aria-label={`Previous ${label}`}
        onClick={() => step(-1)}
        disabled={disabled}
        className={arrowClass}
      >
        {/* The fleur image points left as-is, and right when mirrored. */}
        <Fleur width={16} side="left" active />
      </button>
      {/*
        Every label is stacked in the same grid cell, with only the selected one
        visible, so the control is always as wide as its longest option and the
        arrows don't jump around as the value changes.
      */}
      <span className="grid translate-y-0.5 text-center" aria-live="polite">
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 ${
              i === index
                ? "dark:[text-shadow:0_0_8px_currentColor]"
                : "invisible"
            }`}
          >
            {option.label}
          </span>
        ))}
      </span>
      <button
        type="button"
        aria-label={`Next ${label}`}
        onClick={() => step(1)}
        disabled={disabled}
        className={arrowClass}
      >
        <Fleur width={16} side="right" active />
      </button>
    </div>
  );
}
