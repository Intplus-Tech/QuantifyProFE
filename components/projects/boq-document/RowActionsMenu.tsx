"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

/**
 * The actions control that sits at the right end of every BOQ row, after
 * Amount, and once in each section header.
 *
 * Hovering opens the popup; it also opens on click and on keyboard focus, so
 * it is reachable without a pointer. A short close delay lets the pointer
 * travel from the trigger into the popup without it vanishing on the way.
 */
export function RowActionsMenu({
  onEdit,
  onDelete,
  label,
  editLabel = "Edit",
  deleteLabel = "Delete",
  disabled,
  align = "right",
}: {
  onEdit: () => void;
  onDelete: () => void;
  /** Names the thing being acted on, for screen readers. */
  label: string;
  editLabel?: string;
  deleteLabel?: string;
  disabled?: boolean;
  align?: "right" | "left";
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => cancelClose, []);

  // Clicking elsewhere, or Escape, closes it — a hover popup that survives a
  // click somewhere else reads as stuck.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const act = (run: () => void) => () => {
    setOpen(false);
    run();
  };

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex print:hidden"
      onMouseEnter={() => {
        cancelClose();
        if (!disabled) setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        disabled={disabled}
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => !disabled && setOpen((value) => !value)}
        onFocus={() => !disabled && setOpen(true)}
        className="rounded p-1 text-slate-300 transition-colors hover:bg-amber-50 hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={`absolute top-full z-30 mt-1 flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <MenuIcon
            label={editLabel}
            onClick={act(onEdit)}
            className="text-slate-500 hover:bg-amber-50 hover:text-amber-600"
          >
            <Pencil className="h-3.5 w-3.5" />
          </MenuIcon>
          <MenuIcon
            label={deleteLabel}
            onClick={act(onDelete)}
            className="text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </MenuIcon>
        </div>
      )}
    </div>
  );
}

function MenuIcon({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${className}`}
    >
      {children}
    </button>
  );
}
