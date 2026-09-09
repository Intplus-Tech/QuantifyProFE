"use client";

import * as React from "react";
import { GripHorizontal, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDraggablePanel } from "@/hooks/useDraggablePanel";

interface DraggablePanelProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Extra classes for the panel root (e.g. a custom width). */
  className?: string;
  /**
   * Change this while the panel stays open to snap it back to its start
   * position for genuinely new content. Omit to leave it where the user
   * dragged it.
   */
  recenterKey?: unknown;
  /** Start collapsed. Defaults to expanded. */
  defaultCollapsed?: boolean;
}

/**
 * A floating, draggable, non-modal panel — the same interaction as the
 * workspace's Element Detail panel, extracted for reuse. It does not trap focus
 * or block the page behind it; the header is the drag handle, Esc closes it, and
 * it stays clamped inside the viewport.
 */
export function DraggablePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  recenterKey,
  defaultCollapsed = false,
}: DraggablePanelProps) {
  const { panelRef, style, isPositioned, handleProps } = useDraggablePanel({
    active: open,
    recenterKey,
  });
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Reset the collapsed state each time the panel opens for new content.
  React.useEffect(() => {
    if (open) setCollapsed(defaultCollapsed);
  }, [open, recenterKey, defaultCollapsed]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Move focus into the panel on open (non-modal — no trap) and hand it back to
  // whatever was focused before when the panel closes.
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstField = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, select, button:not([aria-label='Close panel']):not([aria-label='Collapse panel']):not([aria-label='Expand panel'])",
    );
    firstField?.focus();
    return () => previouslyFocused?.focus?.();
  }, [open, panelRef]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={false}
      aria-label={typeof title === "string" ? title : undefined}
      style={{ ...style, visibility: isPositioned ? "visible" : "hidden" }}
      className={cn(
        "z-50 flex max-h-[calc(100dvh-1.5rem)] w-[22rem] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 print:hidden",
        className,
      )}
    >
      <div
        {...handleProps}
        className="flex cursor-grab items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 active:cursor-grabbing select-none"
      >
        <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-900">
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-[10px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          {collapsed ? (
            <Plus className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer ? (
            <div className="border-t border-slate-200 bg-white px-3 py-2.5">
              {footer}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
