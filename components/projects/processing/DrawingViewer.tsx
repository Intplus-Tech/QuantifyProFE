import { ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Detection, BoqResult } from "./types";

interface DrawingViewerProps {
  detections: Detection[];
  fileUrl?: string | null;
  fileType?: string;
  boqData?: BoqResult | null;
  fileName?: string;
}

export function DrawingViewer({
  detections,
  fileUrl,
  fileType,
  fileName,
}: DrawingViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };
  
  const handleResetZoom = () => setZoom(1);

  const isPdf =
    fileType === "pdf" ||
    fileUrl?.toLowerCase().endsWith(".pdf") ||
    fileName?.toLowerCase().endsWith(".pdf");

  const fileExtension =
    fileName?.split(".").pop()?.toUpperCase() ||
    fileUrl?.split(".").pop()?.split("?")[0].toUpperCase() ||
    "UNKNOWN";

  const showFallback = !fileUrl || hasError;

  return (
    <div className="relative group border rounded-2xl bg-slate-50 dark:bg-slate-900 text-card-foreground shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Blueprint canvas / Image Viewer */}
      <div
        ref={containerRef}
        className="relative flex-1 cursor-crosshair overflow-hidden bg-slate-950"
        onMouseMove={handleMouseMove}
      >
        {isImageLoading && fileUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">
                Loading drawing...
              </p>
            </div>
          </div>
        )}

        {showFallback && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
            <img
              src="/images/blueprint_placeholder.png"
              alt="No Preview Available"
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
            />
            <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl mb-2">
                <Maximize2 className="w-10 h-10 text-amber-500/50" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Preview Not Available</h3>
              <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                There is no preview for this image because it's a <span className="text-amber-500 font-bold underline underline-offset-4">{fileExtension}</span> file.
              </p>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {fileUrl && (
            <>
              {isPdf ? (
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="absolute inset-0 w-full h-full border-none bg-white"
                  onLoad={() => setIsImageLoading(false)}
                  title="PDF Drawing"
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="Engineering Drawing"
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    console.error("Failed to load drawing image:", fileUrl);
                    setIsImageLoading(false);
                    setHasError(true);
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Floating Zoom Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-xl shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-none hover:bg-white dark:hover:bg-slate-700"
            onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
          >
            <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-xl shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-none hover:bg-white dark:hover:bg-slate-700"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))}
          >
            <ZoomOut className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-xl shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-none hover:bg-white dark:hover:bg-slate-700"
            onClick={handleResetZoom}
          >
            <Maximize2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </Button>
        </div>

        {/* Status Coordinate Pill (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-30">
          <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[10px] font-mono shadow-xl border border-white/10 tracking-wider">
            <span className="text-slate-400">COORD:</span>
            <span>
              {mousePos.x.toFixed(2)}, {mousePos.y.toFixed(2)}
            </span>
            <span className="w-px h-3 bg-slate-700 mx-1" />
            <span className="text-amber-400 font-bold uppercase">
              Recognizing: Concrete_Col_C1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
