"use client";

import { useState, useEffect, useRef } from "react";
import { useShapeHistory } from "./useShapeHistory";
import type { Measurement, MPoint, PageMeasurements } from "../components/types";

const STORAGE_PREFIX = "ws-measurements-v1";

function storageKey(drawingId: string, page: number) {
  return `${STORAGE_PREFIX}-${drawingId}-p${page}`;
}

const EMPTY: PageMeasurements = {
  scaleFactor: null,
  calibPts: null,
  measurements: [],
};

function loadPage(drawingId: string, page: number): PageMeasurements {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(storageKey(drawingId, page));
    return raw ? (JSON.parse(raw) as PageMeasurements) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function makeKey(drawingId: string | null, page: number) {
  return `${drawingId ?? "none"}-${page}`;
}

export function useCanvasMeasurements(drawingId: string | null, page: number) {
  // Load from localStorage exactly once on mount (lazy initializer)
  const [initialData] = useState<PageMeasurements>(
    () => (drawingId ? loadPage(drawingId, page) : EMPTY),
  );
  const { state, push, undo, redo, reset, canUndo, canRedo } =
    useShapeHistory(initialData);

  // Synchronous derived-state reset: when drawingId/page changes, immediately
  // reset to the correct page's data with zero one-frame bleed.
  // React's "derived state from props" pattern — React discards the current render
  // and re-renders immediately with the corrected state.
  const [prevKey, setPrevKey] = useState(() => makeKey(drawingId, page));
  const currentKey = makeKey(drawingId, page);
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    reset(drawingId ? loadPage(drawingId, page) : EMPTY);
  }

  // Refs updated during every render so the persistence effect always writes to
  // the correct key, even on the render immediately after a page-switch reset.
  const drawingIdRef = useRef(drawingId);
  const pageRef = useRef(page);
  drawingIdRef.current = drawingId;
  pageRef.current = page;

  useEffect(() => {
    const did = drawingIdRef.current;
    const pg = pageRef.current;
    if (!did) return;
    try {
      localStorage.setItem(storageKey(did, pg), JSON.stringify(state));
    } catch {}
  }, [state]);

  // All mutations use the functional-updater form so they always read the latest
  // committed state from React internals — never a stale closed-over value.

  function setCalibration(pts: [MPoint, MPoint], scaleFactor: number) {
    push((cur) => ({ ...cur, calibPts: pts, scaleFactor }));
  }

  function addMeasurement(m: Measurement) {
    push((cur) => ({ ...cur, measurements: [...cur.measurements, m] }));
  }

  function removeMeasurement(id: string) {
    push((cur) => ({
      ...cur,
      measurements: cur.measurements.filter((m) => m.id !== id),
    }));
  }

  function clearMeasurements() {
    push((cur) => ({ ...cur, measurements: [] }));
  }

  return {
    state,
    setCalibration,
    addMeasurement,
    removeMeasurement,
    clearMeasurements,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
