"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₦]/g, "");
  if (cleaned === "") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function CellActions({
  ariaLabel,
  onEdit,
  onDelete,
  editing,
}: {
  ariaLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  editing: boolean;
}) {
  return (
    <span className="ml-1 inline-flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label={`Edit ${ariaLabel}`}
        title="Edit"
        onClick={onEdit}
        className={`rounded p-0.5 transition-colors ${
          editing
            ? "text-amber-600"
            : "text-slate-300 hover:bg-amber-50 hover:text-amber-600"
        }`}
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        aria-label={`Clear ${ariaLabel}`}
        title="Clear value"
        onClick={onDelete}
        className="rounded p-0.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </span>
  );
}

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

/**
 * Read-only at rest. The pencil unlocks this one cell for editing; the bin
 * clears just this cell. Committing (blur / Enter) locks it again, so only one
 * field is ever live at a time.
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
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(format(value));

  const alignment =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  const startEditing = () => {
    setText(format(value));
    setEditing(true);
  };

  const commit = () => {
    const next = parseNumber(text);
    if (next !== value) onCommit(next);
    setEditing(false);
  };

  return (
    <span className="inline-flex items-center">
      <span
        className={`inline-flex min-w-[68px] items-center gap-0.5 rounded border px-1.5 py-0.5 transition-colors ${
          editing
            ? "border-amber-400 bg-white ring-2 ring-amber-100"
            : "border-transparent bg-transparent"
        } ${className}`}
      >
        {prefix && <span className="shrink-0 text-[10px] text-slate-400">{prefix}</span>}

        {editing ? (
          <input
            autoFocus
            inputMode="decimal"
            aria-label={ariaLabel}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setText(format(value));
                setEditing(false);
              }
            }}
            placeholder="0"
            className={`w-full min-w-0 bg-transparent text-[11px] tabular-nums outline-none placeholder:text-slate-300 ${alignment}`}
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={startEditing}
            onKeyDown={(e) => e.key === "Enter" && startEditing()}
            className={`w-full cursor-text text-[11px] tabular-nums ${alignment} ${
              value === null ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {value === null ? "—" : format(value)}
          </span>
        )}

        {suffix && <span className="shrink-0 text-[10px] text-slate-400">{suffix}</span>}
      </span>

      <CellActions
        ariaLabel={ariaLabel}
        editing={editing}
        onEdit={startEditing}
        onDelete={() => {
          setText("");
          setEditing(false);
          if (value !== null) onCommit(null);
        }}
      />
    </span>
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
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const startEditing = () => {
    setText(value);
    setEditing(true);
  };

  const commit = () => {
    if (text !== value) onCommit(text);
    setEditing(false);
  };

  return (
    <span className="inline-flex items-center">
      <span
        className={`inline-flex min-w-[70px] rounded border px-1.5 py-0.5 transition-colors ${
          editing
            ? "border-amber-400 bg-white ring-2 ring-amber-100"
            : "border-transparent bg-transparent"
        } ${className}`}
      >
        {editing ? (
          <input
            autoFocus
            aria-label={ariaLabel}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setText(value);
                setEditing(false);
              }
            }}
            className="w-full min-w-0 bg-transparent text-[11px] outline-none"
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={startEditing}
            onKeyDown={(e) => e.key === "Enter" && startEditing()}
            className={`w-full cursor-text text-[11px] ${
              value ? "text-slate-700" : "text-slate-300"
            }`}
          >
            {value || "—"}
          </span>
        )}
      </span>

      <CellActions
        ariaLabel={ariaLabel}
        editing={editing}
        onEdit={startEditing}
        onDelete={() => {
          setText("");
          setEditing(false);
          if (value !== "") onCommit("");
        }}
      />
    </span>
  );
}
