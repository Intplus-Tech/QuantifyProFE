"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Circle, Text, Group, Rect } from "react-konva";
import type Konva from "konva";
import type {
  ToolId,
  Measurement,
  LengthMeasurement,
  AreaMeasurement,
  CountMark,
  MPoint,
} from "./types";

// ── Geometry ──────────────────────────────────────────────────────────────────

function ptDist(a: MPoint, b: MPoint) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function polylineLen(pts: MPoint[]) {
  let t = 0;
  for (let i = 1; i < pts.length; i++) t += ptDist(pts[i - 1], pts[i]);
  return t;
}

function shoelace(pts: MPoint[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a / 2);
}

function centroid(pts: MPoint[]): MPoint {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function flat(pts: MPoint[]) {
  return pts.flatMap((p) => [p.x, p.y]);
}

function fmtLen(basePx: number, sf: number, unit: string) {
  return `${(basePx / sf).toFixed(2)} ${unit}`;
}

function fmtArea(basePx2: number, sf: number, unit: string) {
  const u2 = unit === "Meters" ? "m²" : `${unit}²`;
  return `${(basePx2 / sf ** 2).toFixed(2)} ${u2}`;
}

// ── Sub-renderers (defined outside component for stable identity) ─────────────

function MeasurementLabel({
  text,
  cx,
  cy,
  color,
  pdfScale,
}: {
  text: string;
  cx: number;
  cy: number;
  color: string;
  pdfScale: number;
}) {
  const charW = 6.5 / pdfScale;
  const labelH = 14 / pdfScale;
  const pad = 4 / pdfScale;
  const tw = text.length * charW;

  return (
    <Group>
      <Rect
        x={cx - tw / 2 - pad}
        y={cy - labelH / 2 - pad}
        width={tw + pad * 2}
        height={labelH + pad * 2}
        fill="white"
        opacity={0.9}
        cornerRadius={2 / pdfScale}
        shadowColor="rgba(0,0,0,0.15)"
        shadowBlur={4 / pdfScale}
        shadowOffset={{ x: 0, y: 1 / pdfScale }}
      />
      <Text
        x={cx - tw / 2}
        y={cy - labelH / 2}
        text={text}
        fontSize={11 / pdfScale}
        fill={color}
        fontStyle="bold"
        fontFamily="system-ui, sans-serif"
      />
    </Group>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface MeasurementCanvasProps {
  pdfScale: number;
  activeTool: ToolId | null;
  /** True while scale flow is open and scale is not yet locked */
  isCalibrating: boolean;
  scaleFactor: number | null;
  distanceUnit: string;
  activeColor: string;
  measurements: Measurement[];
  /** Mark IDs to draw with a highlight glow — set by clicking a Live Measurements row */
  highlightedIds?: ReadonlySet<string>;
  nextCountIndex: number;
  /** Changes whenever the active file or page changes — resets any in-progress drawing */
  pageKey: string;
  /** True while the drawing is being click-dragged to pan — overrides the tool
   *  cursor with "grabbing" so the hand icon shows even mid-drag with a tool active. */
  isPanning?: boolean;
  /** True while the Hand tool is active — fully hands the canvas to the pan
   *  layer underneath (no pointer capture, no crosshair) regardless of which
   *  measurement tool was selected before. */
  panMode?: boolean;
  /** Fires when calibration points change. ptCount = 0|1|2 */
  onCalibrationUpdate: (
    basePxDist: number | null,
    pts: [MPoint, MPoint] | null,
    ptCount: 0 | 1 | 2
  ) => void;
  onMeasurementAdd: (m: Measurement) => void;
  /** Called on every mouse-move while drawing length — null when no line in progress */
  onLiveLength?: (len: number | null) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function MeasurementCanvas({
  pdfScale,
  activeTool,
  isCalibrating,
  scaleFactor,
  distanceUnit,
  activeColor,
  measurements,
  highlightedIds,
  nextCountIndex,
  pageKey,
  isPanning = false,
  panMode = false,
  onCalibrationUpdate,
  onMeasurementAdd,
  onLiveLength,
  onUndo,
  onRedo,
}: MeasurementCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Refs for synchronous state (avoids stale closure issues with dblClick)
  const inProgressRef = useRef<MPoint[]>([]);
  const calibRef = useRef<MPoint[]>([]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [inProgress, setInProgress] = useState<MPoint[]>([]);
  const [calibPts, setCalibPts] = useState<MPoint[]>([]);
  const [mousePos, setMousePos] = useState<MPoint | null>(null);
  // True when cursor is close enough to the first area point to snap-close the polygon
  const [snapToClose, setSnapToClose] = useState(false);

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset in-progress when tool, calibration mode, pan mode, or page/file changes
  useEffect(() => {
    inProgressRef.current = [];
    setInProgress([]);
    setMousePos(null);
    setSnapToClose(false);
    onLiveLength?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, isCalibrating, panMode, pageKey]);

  // Clear calibration points when calibration mode exits
  useEffect(() => {
    if (!isCalibrating) {
      calibRef.current = [];
      setCalibPts([]);
    }
  }, [isCalibrating]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        inProgressRef.current = [];
        setInProgress([]);
        calibRef.current = [];
        setCalibPts([]);
        onCalibrationUpdate(null, null, 0);
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        onUndo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        onRedo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCalibrationUpdate, onUndo, onRedo]);

  // Convert screen pixel position → base (scale=1) coordinates
  function getBasePos(): MPoint | null {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x / pdfScale, y: pos.y / pdfScale };
  }

  // Snap radius: 15 screen pixels expressed in base coordinates
  const SNAP_PX = 15;

  // Closes the in-progress area polygon and fires the measurement.
  // Call this from click-on-start, right-click, or double-click.
  const closeAreaShape = useCallback(() => {
    const pts = [...inProgressRef.current];
    inProgressRef.current = [];
    setInProgress([]);
    setSnapToClose(false);
    if (pts.length >= 3 && scaleFactor) {
      const pixArea = shoelace(pts);
      onMeasurementAdd({
        id: crypto.randomUUID(),
        type: "area",
        points: pts,
        pixelArea: pixArea,
        realArea: pixArea / scaleFactor ** 2,
        unit: distanceUnit,
        color: activeColor,
      } as AreaMeasurement);
    }
  }, [scaleFactor, distanceUnit, activeColor, onMeasurementAdd]);

  const handleMouseMove = useCallback(() => {
    const pos = getBasePos();
    if (!pos) return;
    setMousePos(pos);

    if (activeTool === "length" && scaleFactor && inProgressRef.current.length > 0) {
      onLiveLength?.(polylineLen([inProgressRef.current[0], pos]) / scaleFactor);
    }

    // Snap-to-close detection: light up the first point when cursor is close
    if (activeTool === "area" && inProgressRef.current.length >= 3) {
      setSnapToClose(ptDist(inProgressRef.current[0], pos) < SNAP_PX / pdfScale);
    } else {
      setSnapToClose(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfScale, activeTool, scaleFactor, onLiveLength]);

  const handleClick = useCallback(() => {
    const pos = getBasePos();
    if (!pos) return;

    // ── Calibration mode: record up to 2 reference points ──────────────────
    if (isCalibrating) {
      if (calibRef.current.length >= 2) return;
      const next = [...calibRef.current, pos];
      calibRef.current = next;
      setCalibPts([...next]);
      if (next.length === 1) {
        onCalibrationUpdate(null, null, 1);
      } else {
        const d = ptDist(next[0], next[1]);
        onCalibrationUpdate(d, [next[0], next[1]], 2);
      }
      return;
    }

    if (!scaleFactor) return;

    // ── Count: each click places one mark ──────────────────────────────────
    if (activeTool === "count") {
      onMeasurementAdd({
        id: crypto.randomUUID(),
        type: "count",
        point: pos,
        index: nextCountIndex,
        color: activeColor,
      } as CountMark);
      return;
    }

    // ── Length: 2-click model — first click starts, second click finishes ──
    if (activeTool === "length") {
      if (inProgressRef.current.length === 0) {
        inProgressRef.current = [pos];
        setInProgress([pos]);
      } else {
        const pts = [inProgressRef.current[0], pos];
        inProgressRef.current = [];
        setInProgress([]);
        onLiveLength?.(null);
        const pixLen = polylineLen(pts);
        // TEMP diagnostic — remove once the pixel-to-real-unit bug is found.
        console.log("[MEASUREMENT]", {
          pdfZoom: pdfScale,
          basePixelLength: pixLen,
          scaleFactor,
          resultingRealLength: pixLen / scaleFactor,
          unit: distanceUnit,
        });
        onMeasurementAdd({
          id: crypto.randomUUID(),
          type: "length",
          points: pts,
          pixelLength: pixLen,
          realLength: pixLen / scaleFactor,
          unit: distanceUnit,
          color: activeColor,
        } as LengthMeasurement);
      }
      return;
    }

    // ── Area: click to add points; snap-to-close when near the first point ─
    if (activeTool === "area") {
      // If cursor is within snap radius of the first point and we have enough
      // points, close the polygon immediately instead of adding another point.
      if (
        inProgressRef.current.length >= 3 &&
        ptDist(inProgressRef.current[0], pos) < SNAP_PX / pdfScale
      ) {
        closeAreaShape();
        return;
      }
      const next = [...inProgressRef.current, pos];
      inProgressRef.current = next;
      setInProgress([...next]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalibrating, activeTool, scaleFactor, activeColor, nextCountIndex, pdfScale, distanceUnit, onMeasurementAdd, closeAreaShape]);

  const handleDblClick = useCallback(() => {
    if (activeTool === "length") {
      // Konva fires onClick→onClick→onDblClick on a double-click.
      // The 1st onClick completed the line; the 2nd onClick accidentally started a
      // new one. Cancel that phantom start so the cursor stops following.
      inProgressRef.current = [];
      setInProgress([]);
      onLiveLength?.(null);
      return;
    }

    // Area: double-click also closes the polygon.
    // Konva's 2nd onClick already added a duplicate point — remove it first.
    if (activeTool === "area" && inProgressRef.current.length >= 3) {
      inProgressRef.current = inProgressRef.current.slice(0, -1);
      closeAreaShape();
    }
  }, [activeTool, closeAreaShape, onLiveLength]);

  // Right-click cancels/closes: closes the area if enough points, otherwise cancels.
  const handleContextMenu = useCallback((e: { evt: { preventDefault: () => void } }) => {
    e.evt.preventDefault();
    if (activeTool !== "area") return;
    if (inProgressRef.current.length >= 3) {
      closeAreaShape();
    } else {
      inProgressRef.current = [];
      setInProgress([]);
      setSnapToClose(false);
    }
  }, [activeTool, closeAreaShape]);

  // Hand tool active → the overlay steps aside entirely so the pan layer
  // beneath it receives the drag, no matter which tool was armed before.
  const isInteractive =
    !panMode &&
    (isCalibrating ||
      (!!scaleFactor &&
        (activeTool === "length" ||
          activeTool === "area" ||
          activeTool === "count")));

  const SW = 4 / pdfScale;      // stroke width — thick enough to see clearly over a PDF
  const RD = 5 / pdfScale;      // vertex dot radius
  const CR = 12 / pdfScale;     // count circle radius

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        cursor: isPanning
          ? "grabbing"
          : panMode
            ? "grab"
            : snapToClose
              ? "pointer"
              : isInteractive
                ? "crosshair"
                : "default",
        pointerEvents: isInteractive ? "all" : "none",
      }}
    >
      {size.w > 0 && size.h > 0 && (
        <Stage
          ref={stageRef}
          width={size.w}
          height={size.h}
          scaleX={pdfScale}
          scaleY={pdfScale}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onContextMenu={handleContextMenu}
        >
          <Layer>
            {/* ── Completed measurements ─────────────────────────────────── */}
            {scaleFactor &&
              measurements.map((m) => {
                const isHighlighted = highlightedIds?.has(m.id) ?? false;

                if (m.type === "length") {
                  const c = centroid(m.points);
                  return (
                    <Group key={m.id}>
                      {isHighlighted && (
                        <Line
                          points={flat(m.points)}
                          stroke="#facc15"
                          strokeWidth={SW * 3}
                          opacity={0.55}
                          lineCap="round"
                          lineJoin="round"
                        />
                      )}
                      <Line
                        points={flat(m.points)}
                        stroke={m.color}
                        strokeWidth={SW}
                        lineCap="round"
                        lineJoin="round"
                      />
                      {m.points.map((pt, i) => (
                        <Circle key={i} x={pt.x} y={pt.y} radius={RD} fill={m.color} />
                      ))}
                      <MeasurementLabel
                        text={fmtLen(m.pixelLength, scaleFactor, m.unit)}
                        cx={c.x}
                        cy={c.y}
                        color={m.color}
                        pdfScale={pdfScale}
                      />
                    </Group>
                  );
                }

                if (m.type === "area") {
                  const c = centroid(m.points);
                  return (
                    <Group key={m.id}>
                      {isHighlighted && (
                        <Line
                          points={flat(m.points)}
                          closed
                          stroke="#facc15"
                          strokeWidth={SW * 3}
                          opacity={0.55}
                          lineCap="round"
                          lineJoin="round"
                        />
                      )}
                      <Line
                        points={flat(m.points)}
                        closed
                        fill={m.color + "28"}
                        stroke={m.color}
                        strokeWidth={SW}
                        lineCap="round"
                        lineJoin="round"
                      />
                      {m.points.map((pt, i) => (
                        <Circle key={i} x={pt.x} y={pt.y} radius={RD} fill={m.color} />
                      ))}
                      <MeasurementLabel
                        text={fmtArea(m.pixelArea, scaleFactor, m.unit)}
                        cx={c.x}
                        cy={c.y}
                        color={m.color}
                        pdfScale={pdfScale}
                      />
                    </Group>
                  );
                }

                if (m.type === "count") {
                  return (
                    <Group key={m.id}>
                      {isHighlighted && (
                        <Circle
                          x={m.point.x}
                          y={m.point.y}
                          radius={CR * 1.8}
                          fill="#facc15"
                          opacity={0.5}
                        />
                      )}
                      <Circle
                        x={m.point.x}
                        y={m.point.y}
                        radius={CR}
                        fill={m.color}
                        stroke="white"
                        strokeWidth={1.5 / pdfScale}
                      />
                      <Text
                        x={m.point.x - CR * 0.65}
                        y={m.point.y - CR * 0.6}
                        text={String(m.index)}
                        fontSize={10 / pdfScale}
                        fill="white"
                        fontStyle="bold"
                        fontFamily="system-ui, sans-serif"
                        width={CR * 1.3}
                        align="center"
                      />
                    </Group>
                  );
                }

                return null;
              })}

            {/* ── In-progress drawing (length / area) ────────────────────── */}
            {scaleFactor && inProgress.length > 0 && mousePos && (
              <Group>
                {/* Placed segments */}
                {inProgress.length >= 2 && (
                  <Line
                    points={flat(inProgress)}
                    stroke={activeColor}
                    strokeWidth={SW}
                    lineCap="round"
                    lineJoin="round"
                    fill={activeTool === "area" ? activeColor + "18" : undefined}
                    closed={false}
                  />
                )}
                {/* Live segment: last placed point → cursor */}
                <Line
                  points={[
                    inProgress[inProgress.length - 1].x,
                    inProgress[inProgress.length - 1].y,
                    mousePos.x,
                    mousePos.y,
                  ]}
                  stroke={activeColor}
                  strokeWidth={1.5 / pdfScale}
                  opacity={0.6}
                />
                {/* Area: closing preview line from cursor → first point */}
                {activeTool === "area" && inProgress.length >= 2 && (
                  <Line
                    points={[
                      mousePos.x,
                      mousePos.y,
                      inProgress[0].x,
                      inProgress[0].y,
                    ]}
                    stroke={activeColor}
                    strokeWidth={1 / pdfScale}
                    opacity={0.35}
                  />
                )}
                {/* Vertex dots */}
                {inProgress.map((pt, i) => (
                  <Circle key={i} x={pt.x} y={pt.y} radius={RD} fill={activeColor} />
                ))}
                {/* Snap-to-close ring on the first point */}
                {snapToClose && inProgress.length >= 3 && (
                  <>
                    <Circle
                      x={inProgress[0].x}
                      y={inProgress[0].y}
                      radius={RD * 3}
                      fill={activeColor}
                      opacity={0.2}
                    />
                    <Circle
                      x={inProgress[0].x}
                      y={inProgress[0].y}
                      radius={RD * 1.8}
                      fill={activeColor}
                      stroke="white"
                      strokeWidth={2 / pdfScale}
                    />
                  </>
                )}
                {/* Running length label near cursor */}
                {activeTool === "length" && (
                  <Text
                    x={mousePos.x + 8 / pdfScale}
                    y={mousePos.y - 14 / pdfScale}
                    text={fmtLen(
                      polylineLen([...inProgress, mousePos]),
                      scaleFactor,
                      distanceUnit
                    )}
                    fontSize={11 / pdfScale}
                    fill={activeColor}
                    fontStyle="bold"
                    fontFamily="system-ui, sans-serif"
                  />
                )}
              </Group>
            )}

            {/* ── Calibration overlay ────────────────────────────────────── */}
            {isCalibrating && calibPts.length > 0 && (
              <Group>
                {/* Live line from first point to cursor (before 2nd click) */}
                {calibPts.length === 1 && mousePos && (
                  <Line
                    points={[calibPts[0].x, calibPts[0].y, mousePos.x, mousePos.y]}
                    stroke="#ef4444"
                    strokeWidth={1.5 / pdfScale}
                    opacity={0.65}
                  />
                )}
                {/* Fixed calibration span */}
                {calibPts.length === 2 && (
                  <>
                    <Line
                      points={flat(calibPts as MPoint[])}
                      stroke="#ef4444"
                      strokeWidth={SW}
                    />
                    {/* Pixel distance label */}
                    <Text
                      x={(calibPts[0].x + calibPts[1].x) / 2 + 6 / pdfScale}
                      y={(calibPts[0].y + calibPts[1].y) / 2 - 14 / pdfScale}
                      text={`${ptDist(calibPts[0], calibPts[1]).toFixed(0)} px`}
                      fontSize={11 / pdfScale}
                      fill="#ef4444"
                      fontStyle="bold"
                      fontFamily="system-ui, sans-serif"
                    />
                  </>
                )}
                {/* Red dots at calibration endpoints */}
                {calibPts.map((pt, i) => (
                  <Circle
                    key={i}
                    x={pt.x}
                    y={pt.y}
                    radius={5 / pdfScale}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth={1.5 / pdfScale}
                  />
                ))}
              </Group>
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
