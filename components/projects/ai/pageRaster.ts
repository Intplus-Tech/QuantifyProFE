import { pdfjs } from "react-pdf";

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export interface RasterisedPage {
  file: File;
  width: number;
  height: number;
}

/** Cap on the long edge, balancing detail against the page-image size limit. */
const TARGET_LONG_EDGE = 2400;

/**
 * The analyse endpoint caps the page image at 5 MB and accepts PNG, JPEG,
 * WebP or GIF. A dense drawing at 2400px easily exceeds that as PNG, so fall
 * back to progressively stronger JPEG before giving up detail.
 */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Pixels of the uploaded page image per pixel of the page at its natural size.
 *
 * Ground scale is calibrated on screen but consumed by the server against the
 * *uploaded raster*, so the clicked distance has to be converted into that
 * image's pixel space. This mirrors the scale each rasteriser picks below —
 * PDFs are rendered up to the long-edge target, rasters are only ever reduced.
 */
export function rasterScaleFor(
  naturalWidth: number,
  naturalHeight: number,
  isPdf: boolean,
): number {
  const longEdge = Math.max(naturalWidth, naturalHeight);
  if (longEdge <= 0) return 1;
  return isPdf
    ? Math.min(TARGET_LONG_EDGE / longEdge, 3)
    : Math.min(TARGET_LONG_EDGE / longEdge, 1);
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

async function encodeUnderLimit(
  canvas: HTMLCanvasElement,
  baseName: string,
): Promise<{ file: File; width: number; height: number }> {
  const png = await toBlob(canvas, "image/png");
  if (png && png.size <= MAX_UPLOAD_BYTES) {
    return {
      file: new File([png], `${baseName}.png`, { type: "image/png" }),
      width: canvas.width,
      height: canvas.height,
    };
  }

  // JPEG at descending quality — drawings are line art, so this stays legible.
  for (const quality of [0.92, 0.8, 0.65, 0.5]) {
    const jpeg = await toBlob(canvas, "image/jpeg", quality);
    if (jpeg && jpeg.size <= MAX_UPLOAD_BYTES) {
      return {
        file: new File([jpeg], `${baseName}.jpg`, { type: "image/jpeg" }),
        width: canvas.width,
        height: canvas.height,
      };
    }
  }

  throw new Error(
    "This page is too detailed to compress under the 5 MB page-image limit.",
  );
}

/**
 * Render one PDF page to a PNG File.
 *
 * The analyse endpoint wants "one image per page" plus that image's pixel
 * dimensions, because detections come back in normalised 0–1 coordinates that
 * the backend converts against exactly these numbers.
 */
export async function rasterisePdfPage(
  url: string,
  pageNumber: number,
  baseName: string,
): Promise<RasterisedPage> {
  const doc = await pdfjs.getDocument(url).promise;

  try {
    const page = await doc.getPage(pageNumber);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = Math.min(
      TARGET_LONG_EDGE / Math.max(unscaled.width, unscaled.height),
      3,
    );
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get a 2D canvas context");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // `canvas` is required by pdfjs v4+ and ignored by earlier versions.
    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    } as Parameters<typeof page.render>[0]).promise;

    return encodeUnderLimit(canvas, `${baseName}-p${pageNumber}`);
  } finally {
    void doc.destroy();
  }
}

/** Wrap an already-raster drawing (JPG/PNG) and read its pixel dimensions. */
export async function rasteriseImage(
  url: string,
  name: string,
): Promise<RasterisedPage> {
  const response = await fetch(url);
  const blob = await response.blob();

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not read the image"));
    element.src = url;
  });

  const withinLimit = blob.size <= MAX_UPLOAD_BYTES;
  const withinBounds =
    Math.max(image.naturalWidth, image.naturalHeight) <= TARGET_LONG_EDGE;

  if (withinLimit && withinBounds) {
    return {
      file: new File([blob], name, { type: blob.type || "image/png" }),
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  // Too big for the page-image limit — redraw scaled down and re-encode.
  const scale = Math.min(
    TARGET_LONG_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
    1,
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(image.naturalWidth * scale);
  canvas.height = Math.floor(image.naturalHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get a 2D canvas context");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return encodeUnderLimit(canvas, name.replace(/\.[^.]+$/, ""));
}

export const rasterisePage = (
  url: string,
  extension: string,
  pageNumber: number,
  baseName: string,
): Promise<RasterisedPage> =>
  extension.toLowerCase() === ".pdf"
    ? rasterisePdfPage(url, pageNumber, baseName)
    : rasteriseImage(url, baseName);
