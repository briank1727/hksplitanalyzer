import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Fleur from "@/components/Fleur";

export type SelectOption<K extends string> = {
  value: K;
  label: ReactNode;
};

// Options for an on/off setting. Convert with `value === "enabled"` and
// `on ? "enabled" : "disabled"`.
export type Toggle = "enabled" | "disabled";
export const TOGGLE_OPTIONS: readonly SelectOption<Toggle>[] = [
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

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
  const labelsRef = useRef<HTMLSpanElement>(null);

  // The control has a fixed width; shrink any label too long for it. Each label's
  // font size is reset, measured, then scaled down to the space available.
  useLayoutEffect(() => {
    const cell = labelsRef.current;
    if (!cell) return;
    const fit = () => {
      const available = cell.clientWidth;
      for (const el of Array.from(cell.children) as HTMLElement[]) {
        el.style.fontSize = "";
        const natural = el.scrollWidth;
        if (natural > available && available > 0) {
          el.style.fontSize = `${available / natural}em`;
        }
      }
    };
    fit();
    // Re-fit once the webfont has loaded, and whenever the control resizes.
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(cell);
    return () => observer.disconnect();
  }, [options]);

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
      className={`inline-flex w-48 items-center font-[family-name:var(--font-trajan)] ${
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
        visible. The cell fills the fixed width between the arrows, so they never
        move as the value changes. Clicking it steps forward, like the right arrow;
        it isn't focusable itself since the arrows already cover the keyboard.
      */}
      <span
        ref={labelsRef}
        onClick={() => step(1)}
        className={`grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] translate-y-0.5 select-none text-center ${
          disabled
            ? ""
            : "cursor-pointer transition-[filter] duration-150 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
        }`}
        aria-live="polite"
      >
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 self-center justify-self-center whitespace-nowrap ${
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
