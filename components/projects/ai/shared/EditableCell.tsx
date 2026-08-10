"use client";

import { useState } from "react";

interface EditableCellProps {
  value: number | null;
  onCommit: (next: number | null) => void;
  dp?: number;
  prefix?: string;
  suffix?: string;
  align?: "left" | "right" | "center";
  ariaLabel: string;
  className?: string;
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₦]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Always-on numeric input used across the Project Audit tables — the design
 * shows these cells as visibly editable fields rather than click-to-edit text.
 */
export function EditableCell({
  value,
  onCommit,
  dp = 2,
  prefix,
  suffix,
  align = "right",
  ariaLabel,
  className = "",
}: EditableCellProps) {
  const format = (v: number | null) => (v === null ? "" : v.toFixed(dp));
  // `text` only drives the field while focused; at rest the committed value is
  // rendered directly, so there is nothing to keep in sync.
  const [text, setText] = useState(format(value));
  const [focused, setFocused] = useState(false);

  const alignment =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  const commit = () => {
    const next = parseNumber(text);
    if (next !== value) onCommit(next);
  };

  return (
    <div
      className={`inline-flex min-w-[68px] items-center gap-0.5 rounded border border-[#bfe3e8] bg-[#f2fbfc] px-1.5 py-0.5 transition-colors focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 ${className}`}
    >
      {prefix && <span className="shrink-0 text-[10px] text-slate-400">{prefix}</span>}
      <input
        inputMode="decimal"
        aria-label={ariaLabel}
        value={focused ? text : format(value)}
        onFocus={(e) => {
          setFocused(true);
          setText(format(value));
          e.currentTarget.select();
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          commit();
          setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setText(format(value));
            e.currentTarget.blur();
          }
        }}
        placeholder="0"
        className={`w-full min-w-0 bg-transparent text-[11px] tabular-nums outline-none placeholder:text-slate-300 ${alignment}`}
      />
      {suffix && <span className="shrink-0 text-[10px] text-slate-400">{suffix}</span>}
    </div>
  );
}

interface EditableTextCellProps {
  value: string;
  onCommit: (next: string) => void;
  ariaLabel: string;
  className?: string;
}

export function EditableTextCell({
  value,
  onCommit,
  ariaLabel,
  className = "",
}: EditableTextCellProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);

  // Adjust state during render rather than in an effect — the committed value
  // can change underneath us when a sibling edit recalculates the row.
  if (synced !== value) {
    setSynced(value);
    setText(value);
  }

  return (
    <input
      aria-label={ariaLabel}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => text !== value && onCommit(text)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setText(value);
          e.currentTarget.blur();
        }
      }}
      className={`w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[11px] outline-none hover:border-[#dbeef1] focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 ${className}`}
    />
  );
}
