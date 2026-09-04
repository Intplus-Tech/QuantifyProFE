"use client";

import { useRef, useState } from "react";
import { currencySymbol } from "./format";

interface RateCellProps {
  value: number | null | undefined;
  currency?: string;
  disabled?: boolean;
  saving?: boolean;
  /** Called only when the parsed value actually changed and is ≥ 0. */
  onCommit: (next: number) => void;
  ariaLabel: string;
}

function parseRate(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₦$£€]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Always-editable rate input, styled as the small boxed cell in the Figma.
 * Empty / unparseable input is treated as "leave unchanged".
 */
export function RateCell({
  value,
  currency,
  disabled,
  saving,
  onCommit,
  ariaLabel,
}: RateCellProps) {
  const seed = value === null || value === undefined ? "" : String(value);
  const [text, setText] = useState(seed);
  const [syncedValue, setSyncedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-seed from the prop when it changes underneath us (server retotalled).
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(seed);
  }

  const commit = () => {
    const next = parseRate(text);
    if (next === null) {
      setText(seed);
      return;
    }
    if (next < 0) {
      setText(seed);
      return;
    }
    if (next !== value) onCommit(next);
  };

  return (
    <div
      className={`flex min-h-[26px] items-center gap-1 rounded-md border px-2 py-1 transition-colors ${
        saving
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100"
      }`}
    >
      <span className="shrink-0 text-[10px] text-slate-400">
        {currencySymbol(currency)}
      </span>
      <input
        ref={inputRef}
        inputMode="decimal"
        aria-label={ariaLabel}
        disabled={disabled || saving}
        value={text}
        placeholder="0.00"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setText(seed);
            e.currentTarget.blur();
          }
        }}
        className="w-full bg-transparent text-right text-[10px] tabular-nums outline-none placeholder:text-slate-300 disabled:cursor-not-allowed"
      />
    </div>
  );
}
