"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface MeasureGroup {
  category: string;
  dot: string; // tailwind bg-* class
  items: string[];
}

interface MeasureComboboxProps {
  value: string;
  groups: MeasureGroup[];
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Wraps the query's matched substring in a highlight span. Case-insensitive. */
function HighlightedLabel({ label, query }: { label: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{label}</>;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{label}</>;
  return (
    <>
      {label.slice(0, i)}
      <mark className="rounded-[2px] bg-amber-200/70 text-slate-900">
        {label.slice(i, i + q.length)}
      </mark>
      {label.slice(i + q.length)}
    </>
  );
}

/**
 * Bespoke searchable dropdown for "what do you want to measure?" — built from
 * scratch (input + listbox), not the generic shadcn/base-ui combobox, so it can
 * carry category grouping + colour dots that match the workspace's own look.
 */
export function MeasureCombobox({
  value,
  groups,
  onChange,
  placeholder = "Search elements…",
}: MeasureComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  // Re-clamp the active row whenever the filtered set shrinks — adjusted during
  // render (React's "derived state" pattern) rather than in an effect, so it
  // never causes an extra commit.
  const maxIndex = Math.max(flatItems.length - 1, 0);
  if (activeIndex > maxIndex) {
    setActiveIndex(maxIndex);
  }

  // Same pattern: reset the active row to the top whenever the popup opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setActiveIndex(0);
  }

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  // Focusing the search input is a real side effect (an external DOM node),
  // so this one legitimately belongs in an effect.
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function select(item: string) {
    onChange(item);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) select(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="measure-combobox-list"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left transition-all ${
          open
            ? "border-amber-400 ring-2 ring-amber-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Search className="size-3.5 shrink-0 text-slate-400" />
        <span className="flex-1 truncate text-sm font-medium text-slate-800">
          {value || "Select an element…"}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full origin-top animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search className="size-3.5 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                aria-label="Search elements"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            <div
              ref={listRef}
              id="measure-combobox-list"
              role="listbox"
              className="max-h-64 overflow-y-auto p-1"
            >
              {flatItems.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">
                  No matching element.
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.category}>
                    <p className="px-2.5 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {group.category}
                    </p>
                    {group.items.map((item) => {
                      const idx = flatItems.indexOf(item);
                      const isActive = idx === activeIndex;
                      const isSelected = item === value;
                      return (
                        <button
                          key={item}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-active={isActive}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => select(item)}
                          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                            isActive
                              ? "bg-amber-50 text-amber-800"
                              : "text-slate-700"
                          }`}
                        >
                          <span className={`size-1.5 shrink-0 rounded-full ${group.dot}`} />
                          <span className="flex-1 truncate">
                            <HighlightedLabel label={item} query={query} />
                          </span>
                          {isSelected && (
                            <Check className="size-3.5 shrink-0 text-amber-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
