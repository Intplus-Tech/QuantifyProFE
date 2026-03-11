"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ProcessingState, ProcessingStage, LogEntry, Detection } from "./types";

// ─── Mock log entries that simulate real AI processing output ───
const MOCK_LOGS: Omit<LogEntry, "id">[] = [
  { timestamp: "09:12:04", message: "Foundation layers successfully extracted.", type: "success" },
  { timestamp: "09:12:15", message: "6x Door swings identified (Type D1, D2).", type: "success" },
  { timestamp: "09:13:42", message: "Analyzing 12x Concrete Columns (Zone A)...", type: "info" },
  { timestamp: "09:14:01", message: "Calculating rebar volumes...", type: "info" },
  { timestamp: "09:14:19", message: "15m Linear wall segment detected.", type: "error" },
  { timestamp: "09:14:55", message: "Slab thickness measured: 200mm across Zone B.", type: "success" },
  { timestamp: "09:15:30", message: "Beam schedule extraction complete — 24 items.", type: "success" },
  { timestamp: "09:16:12", message: "Staircase geometry parsed (3 flights).", type: "info" },
  { timestamp: "09:16:45", message: "MEP penetration points logged: 18 openings.", type: "warning" },
  { timestamp: "09:17:20", message: "Quantity takeoff aggregation started.", type: "info" },
  { timestamp: "09:18:00", message: "Final BOQ draft generated — 142 line items.", type: "success" },
];

// ─── Mock detections that appear on the drawing viewer ───
const MOCK_DETECTIONS: Detection[] = [
  { id: "d1", x: 22, y: 32, w: 5, h: 6, label: "Column C1" },
  { id: "d2", x: 48, y: 52, w: 6, h: 5, label: "Beam B3" },
  { id: "d3", x: 15, y: 70, w: 22, h: 4, label: "Wall W1 — 15m" },
  { id: "d4", x: 65, y: 25, w: 4, h: 5, label: "Door D1" },
  { id: "d5", x: 75, y: 60, w: 8, h: 3, label: "Slab S2" },
];

// Stage thresholds — which progress % triggers each stage transition
const STAGE_THRESHOLDS: { stage: ProcessingStage; minProgress: number }[] = [
  { stage: "layer_extraction", minProgress: 0 },
  { stage: "object_recognition", minProgress: 35 },
  { stage: "quantity_calculation", minProgress: 70 },
];

function getStageForProgress(progress: number): ProcessingStage {
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (progress >= STAGE_THRESHOLDS[i].minProgress) {
      return STAGE_THRESHOLDS[i].stage;
    }
  }
  return "layer_extraction";
}

const STAGE_DESCRIPTIONS: Record<ProcessingStage, string> = {
  layer_extraction: "Extracting architectural layers and structural elements...",
  object_recognition: "Recognizing objects, dimensions, and structural symbols...",
  quantity_calculation: "Calculating quantities and generating BOQ line items...",
};

function estimateTimeRemaining(progress: number): string {
  if (progress >= 100) return "0s";
  const remaining = Math.max(1, Math.ceil(((100 - progress) / 100) * 120));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// ────────────────────────────────────────────────────────────────
// useMockProcessing — simulates an AI processing pipeline
// Replace the internals with real API polling / WebSocket in production
// ────────────────────────────────────────────────────────────────
export function useMockProcessing(fileName: string = "Structural_Plan_V2.cad") {
  const [state, setState] = useState<ProcessingState>({
    status: "processing",
    progress: 0,
    currentStage: "layer_extraction",
    fileName,
    description: STAGE_DESCRIPTIONS["layer_extraction"],
    logs: [],
    detections: [],
    objectsDetected: 0,
    measurements: 0,
    estimatedTime: "2m 0s",
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIndexRef = useRef(0);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "processing") return prev;
      if (prev.progress >= 100) {
        return { ...prev, status: "completed", progress: 100, estimatedTime: "0s" };
      }

      const nextProgress = Math.min(prev.progress + Math.random() * 4 + 1, 100);
      const nextStage = getStageForProgress(nextProgress);

      // Add a log entry every ~8% progress
      let nextLogs = prev.logs;
      let nextDetections = prev.detections;
      const logThreshold = Math.floor(nextProgress / 8);

      if (logThreshold > logIndexRef.current && logIndexRef.current < MOCK_LOGS.length) {
        const entry = MOCK_LOGS[logIndexRef.current];
        nextLogs = [...prev.logs, { ...entry, id: `log-${logIndexRef.current}` }];
        logIndexRef.current++;
      }

      // Add detections progressively
      const detectionCount = Math.min(Math.floor(nextProgress / 18), MOCK_DETECTIONS.length);
      if (detectionCount > prev.detections.length) {
        nextDetections = MOCK_DETECTIONS.slice(0, detectionCount);
      }

      const objectsDetected = Math.floor((nextProgress / 100) * 142);
      const measurements = Math.floor((nextProgress / 100) * 87);

      return {
        ...prev,
        progress: Math.round(nextProgress * 10) / 10,
        currentStage: nextStage,
        description: STAGE_DESCRIPTIONS[nextStage],
        logs: nextLogs,
        detections: nextDetections,
        objectsDetected,
        measurements,
        estimatedTime: estimateTimeRemaining(nextProgress),
        status: nextProgress >= 100 ? "completed" : "processing",
      };
    });
  }, []);

  // Start interval on mount
  useEffect(() => {
    intervalRef.current = setInterval(tick, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, status: prev.status === "paused" ? "processing" : "paused" }));
  }, []);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { state, pause, cancel };
}
