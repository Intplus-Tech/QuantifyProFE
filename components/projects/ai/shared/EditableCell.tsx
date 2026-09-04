"use client";

import { useState } from "react";

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₦]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const boxCls =
  "inline-flex min-w-[68px] items-center gap-0.5 rounded border border-[#bfe3e8] bg-[#f2fbfc] px-1.5 py-0.5 transition-colors focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100";

interface EditableCellProps {
  value: number | null;
  onCommit: (next: number | null) => void;
  /** When false the cell is plain text — the row is not in edit mode. */
  editable?: boolean;
  dp?: number;
  prefix?: string;
  suffix?: string;
  align?: "left" | "right" | "center";
  ariaLabel: string;
  className?: string;
}

export function EditableCell({
  value,
  onCommit,
  editable = true,
  dp = 2,
  prefix,
  suffix,
  align = "right",
  ariaLabel,
  className = "",
}: EditableCellProps) {
  const format = (v: number | null) => (v === null ? "" : v.toFixed(dp));
  const [text, setText] = useState(format(value));
  const [focused, setFocused] = useState(false);

  const alignment =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  if (!editable) {
    return (
      <span
        className={`block tabular-nums ${alignment} ${
          value === null ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {value === null ? "--" : `${prefix ?? ""}${format(value)}${suffix ?? ""}`}
      </span>
    );
  }

  const commit = () => {
    const next = parseNumber(text);
    if (next !== value) onCommit(next);
  };

  return (
    <span className={`${boxCls} ${className}`}>
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
    </span>
  );
}

interface EditableTextCellProps {
  value: string;
  onCommit: (next: string) => void;
  editable?: boolean;
  ariaLabel: string;
  className?: string;
}

export function EditableTextCell({
  value,
  onCommit,
  editable = true,
  ariaLabel,
  className = "",
}: EditableTextCellProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);

  // Adjust state during render rather than in an effect — the committed value
  // can change underneath us when the row is saved elsewhere.
  if (synced !== value) {
    setSynced(value);
    setText(value);
  }

  if (!editable) {
    return <span className={className}>{value || "--"}</span>;
  }

  return (
    <span className={`${boxCls} ${className}`}>
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
        className="w-full min-w-0 bg-transparent text-[11px] outline-none"
      />
    </span>
  );
}
