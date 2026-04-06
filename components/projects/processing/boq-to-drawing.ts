import type { BoqResult, BoqSection, Detection } from "./types";

export interface SimulatedRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

export interface SimulatedDrawing {
  hull: { width: number; height: number };
  rooms: SimulatedRoom[];
  detections: Detection[];
  walls: { x1: number; y1: number; x2: number; y2: number }[];
}

/**
 * Parses dimensions from strings like "[L=5.4m, W=4.8m]"
 */
function parseDimensions(notes: string | null | undefined): { l?: number; w?: number; d?: number } {
  if (!notes) return {};
  const result: { l?: number; w?: number; d?: number } = {};
  
  const lMatch = notes.match(/L=([\d.]+)/);
  const wMatch = notes.match(/W=([\d.]+)/);
  const dMatch = notes.match(/D=([\d.]+)/);
  
  if (lMatch) result.l = parseFloat(lMatch[1]);
  if (wMatch) result.w = parseFloat(wMatch[1]);
  if (dMatch) result.d = parseFloat(dMatch[1]);
  
  return result;
}

/**
 * Converts BOQ result to a simulated drawing layout
 */
export function boqToDrawing(boq: BoqResult): SimulatedDrawing {
  const rooms: SimulatedRoom[] = [];
  const detections: Detection[] = [];
  const walls: { x1: number; y1: number; x2: number; y2: number }[] = [];
  
  // 1. Extract rooms from "Floor Finishes" section
  const floorSection = boq.sections.find(s => s.sectionName.toLowerCase().includes("floor"));
  
  const scale = 15; // 1 meter = 15 pixels
  let currentX = 50;
  let currentY = 50;
  let maxRowHeight = 0;
  const maxWidth = 350;

  if (floorSection) {
    floorSection.workItems.forEach((item, index) => {
      const dims = parseDimensions(item.notes);
      let w = dims.l || Math.sqrt(item.quantity || 10);
      let h = dims.w || Math.sqrt(item.quantity || 10);
      
      // Convert to pixels
      const pxW = w * scale;
      const pxH = h * scale;

      // Simple wrap-around layout
      if (currentX + pxW > maxWidth) {
        currentX = 50;
        currentY += maxRowHeight + 20;
        maxRowHeight = 0;
      }

      rooms.push({
        id: `room-${index}`,
        name: item.item.replace("Floor finishes to ", ""),
        x: currentX,
        y: currentY,
        width: pxW,
        height: pxH,
        area: item.quantity || (w * h)
      });

      // Also create a detection overlay for it
      detections.push({
        id: `det-room-${index}`,
        x: (currentX / 400) * 100,
        y: (currentY / 300) * 100,
        w: (pxW / 400) * 100,
        h: (pxH / 300) * 100,
        label: item.item.split(" ").slice(-1)[0] || "Room"
      });

      currentX += pxW + 20;
      maxRowHeight = Math.max(maxRowHeight, pxH);
    });
  }

  // 2. Extract walls from "Masonry" section
  const masonrySection = boq.sections.find(s => s.sectionName.toLowerCase().includes("masonry"));
  if (masonrySection) {
    // Just draw a bounding box for external walls
    const extWall = masonrySection.workItems.find(item => item.item.toLowerCase().includes("external"));
    if (extWall) {
      // Draw outer hull
      walls.push({ x1: 40, y1: 40, x2: 360, y2: 40 });
      walls.push({ x1: 360, y1: 40, x2: 360, y2: 260 });
      walls.push({ x1: 360, y1: 260, x2: 40, y2: 260 });
      walls.push({ x1: 40, y1: 260, x2: 40, y2: 40 });
    }
  }

  return {
    hull: { width: 400, height: 300 },
    rooms,
    detections,
    walls
  };
}
