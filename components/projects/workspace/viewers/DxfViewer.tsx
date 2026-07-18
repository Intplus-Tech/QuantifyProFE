"use client";

import { useEffect, useRef, useState } from "react";
import { ViewerLoadingOverlay, ViewerErrorOverlay } from "./shared";

interface DxfViewerProps {
  url: string;
  onLoaded?: () => void;
}

export function DxfViewer({ url, onLoaded }: DxfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewerInstance: any = null;

    async function init() {
      try {
        const THREE = await import("three");
        const { DxfViewer: DxfViewerLib } = await import("dxf-viewer");

        if (disposed) return;

        viewerInstance = new DxfViewerLib(container, {
          clearColor: new THREE.Color(0xf8fafc),
          clearAlpha: 1.0,
          autoResize: true,
          colorCorrection: true,
          blackWhiteInversion: true,
        });

        await viewerInstance.Load({
          url,
          fonts: [],
        });

        if (!disposed) {
          setLoading(false);
          onLoaded?.();
        }
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Failed to parse DXF");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      disposed = true;
      viewerInstance?.Destroy();
    };
  }, [url, onLoaded]);

  return (
    <div className="relative w-full h-full">
      {loading && <ViewerLoadingOverlay label="Parsing DXF drawing…" />}
      {error && <ViewerErrorOverlay message={error} />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
