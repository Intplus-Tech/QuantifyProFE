"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAiDrawing } from "@/store/slices/aiFlowSlice";
import { useLazyDownloadUploadQuery } from "@/store/api/uploadApi";
import type { RootState } from "@/store";
import {
  cacheDrawingFromUrl,
  pruneCachedDrawings,
  readCachedDrawingUrl,
} from "./drawingCache";

/**
 * Guarantees every drawing has a URL the canvas can actually render.
 *
 * `previewUrl` is a `blob:` handle that dies with the page, and it is stripped
 * before the flow is persisted. Three sources are tried in order:
 *
 *   1. the local file cache — instant, no network;
 *   2. the server, downloaded *through the API* so the request carries the auth
 *      token and goes to an origin the app is already allowed to call;
 *   3. nothing — reported as `failed` so the canvas can offer a retry rather
 *      than leaving react-pdf to fail against the raw storage URL, which is
 *      what "This drawing could not be opened" actually was.
 *
 * Step 2 is why this can't be conditional on the drawing list being empty: a
 * restored project has its drawings, and no bytes to draw them with.
 */
export function useDrawingPreviews() {
  const dispatch = useDispatch();
  const drawings = useSelector((state: RootState) => state.aiFlow.drawings);
  const attempted = useRef(new Set<string>());
  const [pending, setPending] = useState(0);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [downloadUpload] = useLazyDownloadUploadQuery();

  useEffect(() => {
    void pruneCachedDrawings();
  }, []);

  useEffect(() => {
    const missing = drawings.filter(
      (drawing) => !drawing.previewUrl && !attempted.current.has(drawing.id),
    );
    if (missing.length === 0) return;

    let cancelled = false;
    missing.forEach((drawing) => attempted.current.add(drawing.id));

    void (async () => {
      setPending((count) => count + missing.length);

      await Promise.all(
        missing.map(async (drawing) => {
          let url = await readCachedDrawingUrl(drawing.id);

          if (!url && drawing.uploadedFileId) {
            url =
              (await downloadUpload(drawing.uploadedFileId)
                .unwrap()
                .catch(() => null)) ?? null;

            if (url) {
              void cacheDrawingFromUrl(drawing.id, url, drawing.name);
            }
          }

          if (cancelled) return;

          if (url) {
            dispatch(updateAiDrawing({ id: drawing.id, changes: { previewUrl: url } }));
          } else {
            setFailedIds((ids) =>
              ids.includes(drawing.id) ? ids : [...ids, drawing.id],
            );
          }
        }),
      );
    })().finally(() => {
      if (!cancelled) setPending((count) => Math.max(0, count - missing.length));
    });

    return () => {
      cancelled = true;
    };
  }, [drawings, dispatch, downloadUpload]);

  /** Forget what has been tried so the effect above runs the ladder again. */
  const retry = useCallback(() => {
    attempted.current.clear();
    setFailedIds([]);
  }, []);

  return { restoring: pending > 0, failedIds, retry };
}
