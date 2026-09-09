"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface PanelPosition {
  x: number;
  y: number;
}

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  width: number;
  height: number;
  moved: boolean;
  pointerId: number;
}

interface UseDraggablePanelOptions {
  /**
   * Whether the panel is mounted/visible. Position is (re)computed each time
   * this flips to `true`.
   */
  active: boolean;
  /**
   * Starting position, given the panel's measured rect and the viewport size.
   * Defaults to horizontally centred, near the top.
   */
  getInitialPosition?: (
    panel: { width: number; height: number },
    viewport: { width: number; height: number },
  ) => PanelPosition;
  /** Gap kept between the panel and every viewport edge, in px. */
  margin?: number;
  /**
   * Bump to force a re-centre while `active` stays true (e.g. brand-new
   * content). Leave undefined to keep the panel wherever the user dragged it.
   */
  recenterKey?: unknown;
}

/**
 * Headless drag behaviour for a floating panel: pointer-driven, viewport-clamped,
 * and re-clamped on resize. Spread `handleProps` onto the element that should act
 * as the drag handle (typically the panel header) and `style` onto the panel
 * root; attach `panelRef` to the panel root so it can be measured.
 */
export function useDraggablePanel({
  active,
  getInitialPosition,
  margin = 8,
  recenterKey,
}: UseDraggablePanelOptions) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [pos, setPos] = useState<PanelPosition | null>(null);

  const clamp = useCallback(
    (x: number, y: number, width: number, height: number): PanelPosition => {
      if (typeof window === "undefined") return { x, y };
      const maxX = Math.max(window.innerWidth - width - margin, margin);
      const maxY = Math.max(window.innerHeight - height - margin, margin);
      return {
        x: Math.min(Math.max(x, margin), maxX),
        y: Math.min(Math.max(y, margin), maxY),
      };
    },
    [margin],
  );

  const recenter = useCallback(() => {
    const el = panelRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const initial = getInitialPosition
      ? getInitialPosition(
          { width: rect.width, height: rect.height },
          viewport,
        )
      : { x: (viewport.width - rect.width) / 2, y: margin * 3 };
    setPos(clamp(initial.x, initial.y, rect.width, rect.height));
  }, [clamp, getInitialPosition, margin]);

  // Position when the panel becomes active, and whenever the caller asks for a
  // re-centre. useLayoutEffect so the move happens before the browser paints.
  useLayoutEffect(() => {
    if (!active) {
      setPos(null);
      return;
    }
    recenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, recenterKey]);

  // Keep the panel fully on-screen when the viewport changes size.
  useLayoutEffect(() => {
    if (!active || typeof window === "undefined") return;
    function onResize() {
      const el = panelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos((current) =>
        current
          ? clamp(current.x, current.y, rect.width, rect.height)
          : current,
      );
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, clamp]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      // Let clicks on controls inside the handle (collapse, close, …) through.
      if (
        (e.target as HTMLElement).closest(
          "button, a, input, select, textarea, [data-no-drag]",
        )
      ) {
        return;
      }
      const el = panelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pos?.x ?? rect.left,
        origY: pos?.y ?? rect.top,
        width: rect.width,
        height: rect.height,
        moved: false,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      drag.moved = true;
      setPos(
        clamp(drag.origX + dx, drag.origY + dy, drag.width, drag.height),
      );
    },
    [clamp],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(drag.pointerId);
    } catch {
      // pointer capture may already be gone — nothing to do
    }
  }, []);

  const style: CSSProperties = pos
    ? { position: "fixed", left: pos.x, top: pos.y, margin: 0 }
    : {
        position: "fixed",
        left: "50%",
        top: margin * 3,
        transform: "translateX(-50%)",
        visibility: "hidden",
      };

  return {
    panelRef,
    style,
    isPositioned: pos !== null,
    recenter,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      style: { touchAction: "none" as const },
    },
  };
}
