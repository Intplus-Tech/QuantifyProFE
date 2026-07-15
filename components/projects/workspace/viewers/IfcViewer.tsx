"use client";

import { useEffect, useRef, useState } from "react";
import { ViewerLoadingOverlay, ViewerErrorOverlay } from "./shared";

interface IfcViewerProps {
  url: string;
  onStoreyCount?: (count: number) => void;
}

export function IfcViewer({ url, onStoreyCount }: IfcViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let components: any = null;

    async function init() {
      try {
        const OBC = await import("@thatopen/components");

        components = new OBC.Components();

        const worlds = components.get(OBC.Worlds);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const world = (worlds.create as () => any)();

        world.scene = new OBC.SimpleScene(components) as unknown;
        world.renderer = new OBC.SimpleRenderer(components, container) as unknown;
        world.camera = new OBC.SimpleCamera(components) as unknown;

        components.init();
        world.scene.setup();

        // Position camera
        await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        // Init FragmentsManager with local worker
        const fragments = components.get(OBC.FragmentsManager);
        fragments.init("/fragments-worker.mjs");

        // Setup IFC loader with local WASM
        const ifcLoader = components.get(OBC.IfcLoader);
        await ifcLoader.setup({
          wasm: { path: "/", absolute: true },
          autoSetWasm: false,
        });

        if (disposed) return;

        // Fetch and load IFC
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} — ${response.statusText}`);
        const buffer = await response.arrayBuffer();

        if (disposed) return;

        const model = await ifcLoader.load(new Uint8Array(buffer), true, "model");

        if (disposed) return;

        // FragmentsModel.object is the Three.js Object3D
        world.scene.three.add(model.object);

        // Report 1 view as default — storey counting requires IFC property queries
        onStoreyCount?.(1);

        setLoading(false);
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Failed to load IFC model");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      disposed = true;
      try { components?.dispose(); } catch { /* cleanup */ }
    };
  }, [url, onStoreyCount]);

  return (
    <div className="relative w-full h-full">
      {loading && <ViewerLoadingOverlay label="Parsing IFC model…" />}
      {error && <ViewerErrorOverlay message={error} />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
