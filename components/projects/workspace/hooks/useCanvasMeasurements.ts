"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

/**
 * Removes marks by id directly from a page's localStorage entry, for a page
 * that isn't the currently active one (so there's no live hook/state to
 * update through). Used when deleting a measurement variant that lives on a
 * different drawing/page than the one on screen right now.
 */
export function removeMeasurementsFromStorage(
  drawingId: string,
  page: number,
  ids: string[],
): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const idSet = new Set(ids);
  const data = loadPage(drawingId, page);
  if (!data.measurements.some((m) => idSet.has(m.id))) return;
  const next: PageMeasurements = {
    ...data,
    measurements: data.measurements.filter((m) => !idSet.has(m.id)),
  };
  try {
    localStorage.setItem(storageKey(drawingId, page), JSON.stringify(next));
  } catch {}
}

interface Calibration {
  scaleFactor: number | null;
  calibPts: [MPoint, MPoint] | null;
}

export function useCanvasMeasurements(drawingId: string | null, page: number) {
  // Load from localStorage exactly once on mount (lazy initializer)
  const [initialData] = useState<PageMeasurements>(
    () => (drawingId ? loadPage(drawingId, page) : EMPTY),
  );

  // Only the drawn shapes go through undo/redo. Calibration is one-time page
  // setup (Apply Scale), not a "shape" — if it shared the same history stack,
  // undoing past the last drawn mark would silently wipe the scale too, and
  // the only symptom would show up later as "scale gone" on the next reload.
  const {
    state: measurements,
    push,
    undo,
    redo,
    reset: resetMeasurements,
    canUndo,
    canRedo,
  } = useShapeHistory<Measurement[]>(initialData.measurements);

  const [calibration, setCalibrationState] = useState<Calibration>({
    scaleFactor: initialData.scaleFactor,
    calibPts: initialData.calibPts,
  });

  // Synchronous derived-state reset: when drawingId/page changes, immediately
  // reset to the correct page's data with zero one-frame bleed.
  // React's "derived state from props" pattern — React discards the current render
  // and re-renders immediately with the corrected state.
  const [prevKey, setPrevKey] = useState(() => makeKey(drawingId, page));
  const currentKey = makeKey(drawingId, page);
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    const data = drawingId ? loadPage(drawingId, page) : EMPTY;
    resetMeasurements(data.measurements);
    setCalibrationState({ scaleFactor: data.scaleFactor, calibPts: data.calibPts });
  }

  // Refs updated during every render so the persistence effect always writes to
  // the correct key, even on the render immediately after a page-switch reset.
  const drawingIdRef = useRef(drawingId);
  const pageRef = useRef(page);
  drawingIdRef.current = drawingId;
  pageRef.current = page;

  // Persists the combined shape (measurements + calibration) — same on-disk
  // format as before, even though calibration now lives outside the undo stack.
  useEffect(() => {
    const did = drawingIdRef.current;
    const pg = pageRef.current;
    if (!did) return;
    const snapshot: PageMeasurements = {
      scaleFactor: calibration.scaleFactor,
      calibPts: calibration.calibPts,
      measurements,
    };
    try {
      localStorage.setItem(storageKey(did, pg), JSON.stringify(snapshot));
    } catch {}
  }, [measurements, calibration]);

  // All mutations use the functional-updater form so they always read the latest
  // committed state from React internals — never a stale closed-over value.

  function setCalibration(pts: [MPoint, MPoint], scaleFactor: number) {
    setCalibrationState({ calibPts: pts, scaleFactor });
  }

  function addMeasurement(m: Measurement) {
    push((cur) => [...cur, m]);
  }

  function removeMeasurement(id: string) {
    push((cur) => cur.filter((m) => m.id !== id));
  }

  function removeMeasurements(ids: string[]) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    push((cur) => cur.filter((m) => !idSet.has(m.id)));
  }

  function clearMeasurements() {
    push(() => []);
  }

  // Bulk-replace all state (used when re-hydrating from backend). Stable because
  // `resetMeasurements` is a useCallback from useShapeHistory with no deps.
  const resetWithData = useCallback(
    (data: PageMeasurements) => {
      resetMeasurements(data.measurements);
      setCalibrationState({
        scaleFactor: data.scaleFactor,
        calibPts: data.calibPts,
      });
    },
    [resetMeasurements],
  );

  return {
    state: {
      measurements,
      scaleFactor: calibration.scaleFactor,
      calibPts: calibration.calibPts,
    },
    setCalibration,
    addMeasurement,
    removeMeasurement,
    removeMeasurements,
    clearMeasurements,
    resetWithData,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
