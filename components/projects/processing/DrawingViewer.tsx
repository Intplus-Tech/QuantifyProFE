"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Detection } from "./types";

interface DrawingViewerProps {
  detections: Detection[];
}

export function DrawingViewer({ detections }: DrawingViewerProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Drawing Preview
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(1)}>
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Blueprint canvas */}
      <div className="relative flex-1 min-h-[340px] bg-slate-900 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Blueprint grid background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
            }}
          />

          {/* Structural lines - simulated floor plan */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            {/* Outer walls */}
            <rect
              x="40"
              y="40"
              width="320"
              height="220"
              fill="none"
              stroke="rgba(59,130,246,0.35)"
              strokeWidth="2.5"
            />
            {/* Interior partitions */}
            <line x1="180" y1="40" x2="180" y2="160" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
            <line x1="40" y1="160" x2="280" y2="160" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
            <line x1="280" y1="100" x2="360" y2="100" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />
            <line x1="280" y1="40" x2="280" y2="200" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" />

            {/* Column markers */}
            {[
              [80, 80],
              [140, 80],
              [80, 200],
              [140, 200],
              [220, 80],
              [320, 80],
              [220, 200],
              [320, 200],
            ].map(([cx, cy], i) => (
              <rect
                key={i}
                x={cx - 4}
                y={cy - 4}
                width="8"
                height="8"
                fill="rgba(59,130,246,0.3)"
                stroke="rgba(59,130,246,0.5)"
                strokeWidth="1"
              />
            ))}

            {/* Dimension lines */}
            <line
              x1="40"
              y1="275"
              x2="360"
              y2="275"
              stroke="rgba(245,158,11,0.4)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
            />
            <text x="200" y="290" textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="8">
              32,000 mm
            </text>
          </svg>

          {/* Detection overlays */}
          {detections.map((d) => (
            <div
              key={d.id}
              className="absolute border-2 border-amber-400/70 bg-amber-400/10 rounded-sm transition-all duration-500 animate-in fade-in"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.w}%`,
                height: `${d.h}%`,
              }}
            >
              <span className="absolute -top-5 left-0 text-[9px] font-bold text-amber-400 bg-slate-900/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom detection bar */}
      <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{detections.length}</span> objects detected
        </span>
        <div className="flex gap-1">
          {detections.slice(-3).map((d) => (
            <span key={d.id} className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
