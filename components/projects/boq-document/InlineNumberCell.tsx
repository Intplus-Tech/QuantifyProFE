"use client";

import { useEffect, useRef, useState } from "react";

interface InlineNumberCellProps {
  value: number | null;
  onCommit: (next: number | null) => void;
  /** Rendered when the row is not in edit mode. */
  display: (value: number | null) => string;
  /** True while this row is the one being edited (pencil clicked). */
  active: boolean;
  /** Focus this field when the row enters edit mode. */
  autoFocus?: boolean;
  currency?: boolean;
  placeholder?: string;
  align?: "left" | "center" | "right";
  className?: string;
  ariaLabel: string;
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₦]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Numeric cell that turns into an input only while its row is in edit mode.
 * At rest it is plain text — no borders, no input chrome.
 */
export function InlineNumberCell({
  value,
  onCommit,
  display,
  active,
  autoFocus = false,
  currency = false,
  placeholder = "—",
  align = "right",
  className = "",
  ariaLabel,
}: InlineNumberCellProps) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-seed from the item whenever the row enters edit mode or the value changes
  // underneath us (e.g. the drawer saved a new figure).
  useEffect(() => {
    setText(value === null ? "" : String(value));
  }, [value, active]);

  useEffect(() => {
    if (active && autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [active, autoFocus]);

  const alignment =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  if (!active) {
    const shown = display(value);
    return (
      <span
        className={`block w-full tabular-nums ${alignment} ${
          shown ? className : "text-slate-300"
        }`}
      >
        {shown ? `${currency ? "₦" : ""}${shown}` : placeholder}
      </span>
    );
  }

  const commit = () => {
    const next = parseNumber(text);
    if (next !== value) onCommit(next);
  };

  return (
    <div className="flex min-h-[26px] items-center gap-1 rounded-md border border-amber-400 bg-white px-2 py-1 ring-2 ring-amber-100">
      {currency && (
        <span className="shrink-0 text-[10px] text-slate-400">₦</span>
      )}
      <input
        ref={inputRef}
        inputMode="decimal"
        aria-label={ariaLabel}
        value={text}
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
            setText(value === null ? "" : String(value));
          }
        }}
        className={`w-full bg-transparent tabular-nums outline-none ${alignment} ${className}`}
      />
    </div>
  );
}
