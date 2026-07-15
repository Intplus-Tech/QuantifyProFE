import { useState, useCallback } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useShapeHistory<T>(initial: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  // Accepts either a new value OR a functional updater (current => next).
  // Use the functional form when the new value is derived from the current state
  // to avoid stale-closure bugs.
  const push = useCallback((nextOrUpdater: T | ((current: T) => T)) => {
    setHistory((h) => {
      const next =
        typeof nextOrUpdater === "function"
          ? (nextOrUpdater as (current: T) => T)(h.present)
          : nextOrUpdater;
      return { past: [...h.past, h.present], present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.past.length) return h;
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (!h.future.length) return h;
      return {
        past: [...h.past, h.present],
        present: h.future[0],
        future: h.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({ past: [], present: newState, future: [] });
  }, []);

  return {
    state: history.present,
    push,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
