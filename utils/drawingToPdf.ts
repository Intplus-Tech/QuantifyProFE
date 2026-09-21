/**
 * Normalises an uploaded drawing to PDF, in the browser, before it is uploaded.
 *
 * Why: the measurement canvas (Konva overlay + calibration) is only mounted over
 * a PDF page — see DrawingCanvas, where `measurementOverlay` is rendered inside
 * the PDF branch and nowhere else. So a JPG or a DXF could be *viewed* but never
 * measured. Converting on the way in means every format lands on the one code
 * path that already supports take-off, with no changes to the measuring stack.
 *
 * The conversion deliberately does NOT try to preserve real-world scale: scale
 * is established by the user clicking two points and typing a known distance, so
 * all that matters is that the geometry is *uniform* — the same number of PDF
 * points per drawing unit in X and in Y. A non-uniform (stretched) conversion
 * would make a horizontal calibration silently wrong vertically, so every page
 * size below is derived from the source's own aspect ratio.
 */

import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  StandardFonts,
  radians,
  rgb,
} from "pdf-lib";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const VECTOR_EXTENSIONS = [".dxf"];

/** PDF hard limit on page dimensions, in points (200 inches). */
const MAX_PAGE_POINTS = 14400;

export function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

/** True when `convertToPdf` can handle this file entirely in the browser. */
export function canConvertToPdf(name: string): boolean {
  const ext = getExtension(name);
  return IMAGE_EXTENSIONS.includes(ext) || VECTOR_EXTENSIONS.includes(ext);
}

function withPdfName(name: string): string {
  const dot = name.lastIndexOf(".");
  return `${dot >= 0 ? name.slice(0, dot) : name}.pdf`;
}

function toPdfFile(bytes: Uint8Array, sourceName: string): File {
  // Copy into a fresh ArrayBuffer — pdf-lib can hand back a view onto a larger
  // pooled buffer, and Blob would then serialise the whole pool.
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new File([copy], withPdfName(sourceName), {
    type: "application/pdf",
    lastModified: Date.now(),
  });
}

/**
 * Scales a source width/height down uniformly until both fit the PDF page
 * limit. Uniform by construction, so the aspect ratio — and therefore any
 * calibration taken off the result — is unaffected.
 */
function fitToPage(width: number, height: number): { w: number; h: number } {
  const longest = Math.max(width, height);
  if (longest <= MAX_PAGE_POINTS) return { w: width, h: height };
  const k = MAX_PAGE_POINTS / longest;
  return { w: width * k, h: height * k };
}

// ── Images ────────────────────────────────────────────────────────────────────

/**
 * Extensions lie — the repo's own `blueprint_placeholder.png` is a JPEG — and
 * picking the wrong embed call throws. Read the magic bytes instead.
 */
function sniffImageType(bytes: Uint8Array): "png" | "jpg" | null {
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  return null;
}

async function imageToPdf(file: File): Promise<File> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.create();

  const kind = sniffImageType(bytes) ?? (getExtension(file.name) === ".png" ? "png" : "jpg");

  // PNG and JPEG are both embedded as-is — the original compressed bytes are
  // copied into the PDF, so there is no recompression and no quality loss.
  const image =
    kind === "png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

  // One image pixel becomes one PDF point, so the page carries the image's full
  // resolution and its exact aspect ratio.
  const { w, h } = fitToPage(image.width, image.height);
  const page = doc.addPage([w, h]);
  page.drawImage(image, { x: 0, y: 0, width: w, height: h });

  return toPdfFile(await doc.save(), file.name);
}

// ── DXF ───────────────────────────────────────────────────────────────────────

interface Pt {
  x: number;
  y: number;
}

/** Affine transform for placing a block's geometry at an INSERT. */
interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  /** Radians. */
  rotation: number;
}

const IDENTITY: Transform = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };

function applyTransform(p: Pt, t: Transform): Pt {
  const sx = p.x * t.scaleX;
  const sy = p.y * t.scaleY;
  const cos = Math.cos(t.rotation);
  const sin = Math.sin(t.rotation);
  return {
    x: t.x + sx * cos - sy * sin,
    y: t.y + sx * sin + sy * cos,
  };
}

function compose(outer: Transform, inner: Transform): Transform {
  const placed = applyTransform({ x: inner.x, y: inner.y }, outer);
  return {
    x: placed.x,
    y: placed.y,
    scaleX: outer.scaleX * inner.scaleX,
    scaleY: outer.scaleY * inner.scaleY,
    rotation: outer.rotation + inner.rotation,
  };
}

function arcPoints(
  cx: number,
  cy: number,
  r: number,
  startRad: number,
  endRad: number,
  segments = 48,
): Pt[] {
  let sweep = endRad - startRad;
  while (sweep <= 0) sweep += Math.PI * 2;
  const steps = Math.max(2, Math.ceil((segments * sweep) / (Math.PI * 2)));
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = startRad + (sweep * i) / steps;
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return out;
}

/**
 * A bulge is DXF's way of storing a circular arc between two polyline vertices:
 * the tangent of a quarter of the arc's included angle. Expanding it keeps
 * rounded corners and curved walls at their true length instead of cutting the
 * corner with a straight chord.
 */
function bulgeArc(p1: Pt, p2: Pt, bulge: number): Pt[] {
  const theta = 4 * Math.atan(bulge);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const chord = Math.hypot(dx, dy);
  if (chord === 0 || !Number.isFinite(theta) || theta === 0) return [p2];
  const r = chord / (2 * Math.sin(theta / 2));
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  // Perpendicular offset from the chord midpoint to the arc centre.
  const h = r * Math.cos(theta / 2);
  const ux = -dy / chord;
  const uy = dx / chord;
  const cx = mid.x + ux * h;
  const cy = mid.y + uy * h;
  const a1 = Math.atan2(p1.y - cy, p1.x - cx);
  const a2 = Math.atan2(p2.y - cy, p2.x - cx);
  const pts =
    theta > 0 ? arcPoints(cx, cy, Math.abs(r), a1, a2) : arcPoints(cx, cy, Math.abs(r), a2, a1).reverse();
  return pts.slice(1);
}

/** A polyline ready to draw, in DXF world coordinates. */
interface Path {
  pts: Pt[];
  closed: boolean;
}

interface Label {
  at: Pt;
  text: string;
  size: number;
  rotation: number;
}

/** Strips MTEXT formatting codes (\fArial|b0; {\H1.5x;...} etc). */
function plainText(raw: string): string {
  return raw
    .replace(/\\[A-Za-z][^;]*;/g, "")
    .replace(/[{}]/g, "")
    .replace(/\\P/g, " ")
    .replace(/\\~/g, " ")
    .trim();
}

// dxf-parser hands back untyped entity records whose shape varies per entity
// type; every field read below is guarded or defaulted at the point of use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DxfEntity = Record<string, any>;

function collect(
  entities: DxfEntity[],
  blocks: Record<string, DxfEntity>,
  t: Transform,
  paths: Path[],
  labels: Label[],
  depth = 0,
): void {
  if (depth > 8) return; // guard against a block that references itself
  for (const e of entities ?? []) {
    const push = (pts: Pt[], closed = false) => {
      const mapped = pts
        .filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y))
        .map((p) => applyTransform(p, t));
      if (mapped.length >= 2) paths.push({ pts: mapped, closed });
    };

    switch (e.type) {
      case "LINE":
        push([e.vertices?.[0], e.vertices?.[1]].filter(Boolean) as Pt[]);
        break;

      case "LWPOLYLINE":
      case "POLYLINE": {
        const verts: DxfEntity[] = e.vertices ?? [];
        if (verts.length < 2) break;
        const pt = (v: DxfEntity): Pt => ({ x: v.x, y: v.y });
        const pts: Pt[] = [pt(verts[0])];
        for (let i = 1; i < verts.length; i++) {
          const prev = verts[i - 1];
          const cur = verts[i];
          if (prev.bulge) pts.push(...bulgeArc(pt(prev), pt(cur), prev.bulge));
          else pts.push(pt(cur));
        }
        const isClosed = !!(e.shape || e.closed);
        if (isClosed) {
          const last = verts[verts.length - 1];
          if (last.bulge) pts.push(...bulgeArc(pt(last), pt(verts[0]), last.bulge));
        }
        push(pts, isClosed);
        break;
      }

      case "CIRCLE":
        push(
          arcPoints(e.center.x, e.center.y, Math.abs(e.radius), 0, Math.PI * 2),
          true,
        );
        break;

      case "ARC":
        // dxf-parser already converts an ARC's group 50/51 to radians (unlike
        // TEXT/MTEXT/INSERT rotation, which it leaves in degrees). Converting
        // again collapsed every arc into a ~1° sliver.
        push(
          arcPoints(
            e.center.x,
            e.center.y,
            Math.abs(e.radius),
            e.startAngle ?? 0,
            e.endAngle ?? Math.PI * 2,
          ),
        );
        break;

      case "ELLIPSE": {
        const c = e.center;
        const major = Math.hypot(e.majorAxisEndPoint?.x ?? 0, e.majorAxisEndPoint?.y ?? 0);
        const minor = major * (e.axisRatio ?? 1);
        const tilt = Math.atan2(e.majorAxisEndPoint?.y ?? 0, e.majorAxisEndPoint?.x ?? 1);
        const start = e.startAngle ?? 0;
        const end = e.endAngle ?? Math.PI * 2;
        const pts: Pt[] = [];
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const a = start + ((end - start) * i) / steps;
          const ex = major * Math.cos(a);
          const ey = minor * Math.sin(a);
          pts.push({
            x: c.x + ex * Math.cos(tilt) - ey * Math.sin(tilt),
            y: c.y + ex * Math.sin(tilt) + ey * Math.cos(tilt),
          });
        }
        push(pts);
        break;
      }

      case "SPLINE":
        // Fit points trace the curve itself; control points only hull it, but
        // either is far closer than dropping the entity.
        push((e.fitPoints?.length ? e.fitPoints : e.controlPoints) ?? []);
        break;

      case "SOLID":
      case "3DFACE":
        push((e.points ?? e.vertices ?? []) as Pt[], true);
        break;

      case "TEXT":
      case "MTEXT": {
        const text = plainText(String(e.text ?? ""));
        if (!text) break;
        const at = applyTransform(
          e.startPoint ?? e.position ?? { x: 0, y: 0 },
          t,
        );
        labels.push({
          at,
          text,
          size: Math.abs((e.textHeight ?? e.height ?? 2.5) * t.scaleY),
          rotation: ((e.rotation ?? 0) * Math.PI) / 180 + t.rotation,
        });
        break;
      }

      case "INSERT": {
        const block = blocks?.[e.name];
        if (!block?.entities) break;
        const inner: Transform = {
          x: e.position?.x ?? 0,
          y: e.position?.y ?? 0,
          scaleX: e.xScale ?? 1,
          scaleY: e.yScale ?? 1,
          rotation: ((e.rotation ?? 0) * Math.PI) / 180,
        };
        // A block's geometry is drawn around its own basePoint, and that point
        // is what lands on the INSERT position. Pre-shift the origin so
        // applyTransform(basePoint) comes out at exactly e.position.
        const base = block.position ?? { x: 0, y: 0 };
        const shift = applyTransform(
          { x: -(base.x ?? 0), y: -(base.y ?? 0) },
          { ...inner, x: 0, y: 0 },
        );
        const placed: Transform = {
          ...inner,
          x: inner.x + shift.x,
          y: inner.y + shift.y,
        };
        collect(block.entities, blocks, compose(t, placed), paths, labels, depth + 1);
        break;
      }
    }
  }
}

function boundsOf(paths: Path[], labels: Label[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const eat = (p: Pt) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  };
  for (const path of paths) for (const p of path.pts) eat(p);
  for (const l of labels) eat(l.at);
  return { minX, minY, maxX, maxY };
}

function drawPath(page: PDFPage, path: Path, k: number, offX: number, offY: number) {
  const at = (p: Pt) => ({ x: (p.x - offX) * k, y: (p.y - offY) * k });
  const pts = path.pts;
  // pdf-lib has no polyline primitive; a run of drawLine calls produces the
  // same content stream operators and keeps everything vector.
  for (let i = 1; i < pts.length; i++) {
    page.drawLine({
      start: at(pts[i - 1]),
      end: at(pts[i]),
      thickness: 0.6,
      color: rgb(0, 0, 0),
    });
  }
  if (path.closed && pts.length > 2) {
    page.drawLine({
      start: at(pts[pts.length - 1]),
      end: at(pts[0]),
      thickness: 0.6,
      color: rgb(0, 0, 0),
    });
  }
}

function drawLabel(
  page: PDFPage,
  font: PDFFont,
  label: Label,
  k: number,
  offX: number,
  offY: number,
) {
  const size = label.size * k;
  if (size < 1) return; // below this it is noise on the page, not a readable dimension
  // Dimension text is what the QS reads to calibrate, so it has to survive.
  page.drawText(label.text, {
    x: (label.at.x - offX) * k,
    y: (label.at.y - offY) * k,
    size,
    font,
    color: rgb(0, 0, 0),
    rotate: radians(label.rotation),
  });
}

async function dxfToPdf(file: File): Promise<File> {
  const { default: DxfParser } = await import("dxf-parser");
  const text = await file.text();
  const dxf = new DxfParser().parseSync(text) as DxfEntity | null;
  if (!dxf) throw new Error("This DXF could not be read.");

  const paths: Path[] = [];
  const labels: Label[] = [];
  collect(dxf.entities ?? [], dxf.blocks ?? {}, IDENTITY, paths, labels);

  if (paths.length === 0 && labels.length === 0) {
    throw new Error("This DXF has no drawable geometry.");
  }

  const { minX, minY, maxX, maxY } = boundsOf(paths, labels);
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);

  // A single scalar for both axes — the uniformity the calibration depends on.
  const k = Math.min(MAX_PAGE_POINTS / spanX, MAX_PAGE_POINTS / spanY, 2000 / Math.max(spanX, spanY) || 1);
  const scale = Number.isFinite(k) && k > 0 ? k : 1;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { w, h } = fitToPage(spanX * scale, spanY * scale);
  const page = doc.addPage([Math.max(w, 1), Math.max(h, 1)]);

  for (const path of paths) drawPath(page, path, scale, minX, minY);
  for (const label of labels) drawLabel(page, font, label, scale, minX, minY);

  return toPdfFile(await doc.save(), file.name);
}

// ── Entry point ───────────────────────────────────────────────────────────────

/**
 * Returns a PDF version of `file`, or the file untouched when it is already a
 * PDF or is a format that has to stay as it is (3D models, and the proprietary
 * Autodesk formats that need a server-side converter).
 */
export async function convertToPdf(file: File): Promise<File> {
  const ext = getExtension(file.name);
  if (IMAGE_EXTENSIONS.includes(ext)) return imageToPdf(file);
  if (VECTOR_EXTENSIONS.includes(ext)) return dxfToPdf(file);
  return file;
}
