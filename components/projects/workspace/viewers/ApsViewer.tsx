"use client";

import { useEffect, useRef, useState } from "react";
import { ViewerLoadingOverlay, ViewerErrorOverlay } from "./shared";

// The Viewer SDK is loaded from Autodesk's own CDN (not npm) — this is
// Autodesk's documented approach, and it keeps a multi-megabyte WebGL engine
// out of this app's bundle for every user who never opens a file routed
// through Autodesk. It attaches itself as `window.Autodesk`.
const VIEWER_JS = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js";
const VIEWER_CSS = "https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutodeskNamespace = any;

let sdkLoadPromise: Promise<AutodeskNamespace> | null = null;

function loadViewerSdk(): Promise<AutodeskNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const existing = (window as unknown as { Autodesk?: AutodeskNamespace }).Autodesk;
  if (existing?.Viewing) return Promise.resolve(existing);
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${VIEWER_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = VIEWER_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = VIEWER_JS;
    script.async = true;
    script.onload = () => {
      const ns = (window as unknown as { Autodesk?: AutodeskNamespace }).Autodesk;
      if (ns?.Viewing) resolve(ns);
      else reject(new Error("Autodesk Viewer script loaded but Autodesk.Viewing is missing."));
    };
    script.onerror = () => reject(new Error("Failed to load the Autodesk Viewer script."));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

/** Matches the {success,data} envelope every route in app/api/aps/* returns. */
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(body.message ?? `Request to ${url} failed.`);
  return body.data as T;
}

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // large RVT/NWD models can genuinely take minutes

interface TranslationStatus {
  status: "pending" | "inprogress" | "success" | "failed" | "timeout";
  progress: number;
  errorMessage?: string;
}

async function waitForTranslation(
  urn: string,
  onProgress: (label: string) => void,
  signal: { cancelled: boolean },
): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (!signal.cancelled) {
    const status = await fetchJson<TranslationStatus>(`/api/aps/status/${urn}`);
    if (status.status === "success") return;
    if (status.status === "failed" || status.status === "timeout") {
      throw new Error(status.errorMessage ?? "Autodesk could not translate this file.");
    }
    if (Date.now() > deadline) {
      throw new Error("Translation is taking longer than expected — try again shortly.");
    }
    onProgress(
      status.progress > 0
        ? `Translating in Autodesk's cloud… ${status.progress}%`
        : "Translating in Autodesk's cloud…",
    );
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

interface ApsViewerProps {
  /** A fetchable URL for the raw file — same contract as IfcViewer/DxfViewer. */
  url: string;
  fileName: string;
  /**
   * Skip the upload entirely and show this already-translated model. Every
   * upload costs an Autodesk translation, so the wizard preview reports its
   * URN back via onUrnResolved and the workspace reuses it rather than paying
   * twice for the same file.
   */
  urn?: string;
  onUrnResolved?: (urn: string) => void;
  /**
   * Display only — uses Autodesk's plain Viewer3D instead of GuiViewer3D, so
   * there's no toolbar and nothing to measure with. Measuring belongs in the
   * workspace, not in the project-creation preview.
   */
  preview?: boolean;
  onLoaded?: () => void;
}

/**
 * Uploads a file to Autodesk Platform Services, waits for translation, then
 * embeds Autodesk's own viewer to show the result. Unlike the other viewers
 * in this folder, this one costs money per file (see lib/aps/config.ts) and
 * requires APS_CLIENT_ID/APS_CLIENT_SECRET/APS_BUCKET_KEY to be set — with
 * those unset it fails immediately with a clear message instead of a raw
 * network error, so an unconfigured app degrades gracefully.
 */
export function ApsViewer({
  url,
  fileName,
  urn: cachedUrn,
  onUrnResolved,
  preview = false,
  onLoaded,
}: ApsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState("Preparing…");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const signal = { cancelled: false };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;

    async function run() {
      try {
        // Already translated once (wizard preview -> workspace, or a second
        // look at the same drawing) — reuse it. Every upload is a billable
        // Autodesk translation, so this is a cost guard, not just a speedup.
        let urn = cachedUrn;

        if (!urn) {
          setStage("Uploading to Autodesk…");
          const sourceRes = await fetch(url);
          if (!sourceRes.ok) throw new Error(`Could not read the source file (${sourceRes.status}).`);
          const blob = await sourceRes.blob();

          const form = new FormData();
          form.append("file", blob, fileName);
          form.append("objectKey", `${crypto.randomUUID()}-${fileName}`);

          const uploaded = await fetchJson<{ urn: string }>("/api/aps/upload", {
            method: "POST",
            body: form,
          });
          if (signal.cancelled) return;
          urn = uploaded.urn;
          onUrnResolved?.(urn);
        }

        await waitForTranslation(urn, setStage, signal);
        if (signal.cancelled) return;

        setStage("Loading viewer…");
        const Autodesk = await loadViewerSdk();
        if (signal.cancelled) return;

        await new Promise<void>((resolve, reject) => {
          Autodesk.Viewing.Initializer(
            {
              env: "AutodeskProduction2",
              api: "streamingV2",
              getAccessToken: async (
                onSuccess: (token: string, expiresIn: number) => void,
              ) => {
                try {
                  const data = await fetchJson<{ token: string; expiresIn: number }>(
                    "/api/aps/viewer-token",
                  );
                  onSuccess(data.token, data.expiresIn);
                } catch (err) {
                  reject(err instanceof Error ? err : new Error("Could not get a viewer token."));
                }
              },
            },
            resolve,
          );
        });
        if (signal.cancelled || !containerRef.current) return;

        // Viewer3D is the bare canvas — no toolbar, so no measure/markup
        // tools. GuiViewer3D is the full Autodesk UI. The project-creation
        // preview is display-only by design; measuring happens in the
        // workspace.
        viewer = preview
          ? new Autodesk.Viewing.Viewer3D(containerRef.current)
          : new Autodesk.Viewing.GuiViewer3D(containerRef.current);
        viewer.start();

        await new Promise<void>((resolve, reject) => {
          Autodesk.Viewing.Document.load(
            `urn:${urn}`,
            (doc: AutodeskNamespace) => {
              const defaultModel = doc.getRoot().getDefaultGeometry();
              viewer
                .loadDocumentNode(doc, defaultModel)
                .then(() => resolve())
                .catch(reject);
            },
            (code: number, message: string) => {
              reject(new Error(message || `Autodesk Viewer load error (${code}).`));
            },
          );
        });
        if (signal.cancelled) return;

        setReady(true);
        onLoaded?.();
      } catch (err) {
        if (!signal.cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load this file via Autodesk.");
        }
      }
    }

    run();

    return () => {
      signal.cancelled = true;
      try {
        viewer?.finish();
      } catch {
        /* cleanup */
      }
    };
    // onUrnResolved is intentionally excluded — callers pass an inline arrow,
    // and including it would tear down and re-upload on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, fileName, cachedUrn, preview]);

  return (
    <div className="relative w-full h-full">
      {!ready && !error && <ViewerLoadingOverlay label={stage} />}
      {error && <ViewerErrorOverlay message={error} />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
