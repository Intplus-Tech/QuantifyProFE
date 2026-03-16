// Processing feature types — designed for API integration

export type ProcessingStage = "layer_extraction" | "object_recognition" | "quantity_calculation";

export type ProcessingStatus = "idle" | "processing" | "paused" | "completed" | "error";

export type LogEntryType = "success" | "info" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: string; // e.g. "09:12:04"
  message: string;
  type: LogEntryType;
}

export interface Detection {
  id: string;
  x: number; // percentage-based position (0-100)
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number; // 0–100
  currentStage: ProcessingStage;
  fileName: string;
  description: string;
  logs: LogEntry[];
  detections: Detection[];
  objectsDetected: number;
  measurements: number;
  estimatedTime: string; // e.g. "1m 45s"
}

export interface ProcessingStageInfo {
  key: ProcessingStage;
  label: string;
}

export const PROCESSING_STAGES: ProcessingStageInfo[] = [
  { key: "layer_extraction", label: "Layer Extraction" },
  { key: "object_recognition", label: "Object Recognition" },
  { key: "quantity_calculation", label: "Quantity Calculation" },
];
