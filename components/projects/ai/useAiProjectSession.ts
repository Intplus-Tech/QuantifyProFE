"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAiDrawing,
  hydrateAiFlow,
  loadAiFlowForProject,
  setAiProjectId,
  setAiUploadedFileId,
  type AiDrawing,
} from "@/store/slices/aiFlowSlice";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { useLazyDownloadUploadQuery, useLazyGetUploadQuery } from "@/store/api/uploadApi";
import { isValidObjectId } from "@/utils/apiError";
import type { RootState } from "@/store";
import { cacheDrawingFromUrl } from "./drawingCache";

const extensionOf = (name: string) =>
  `.${name.split(".").pop()?.toLowerCase() ?? ""}`;

/**
 * Puts an AI project back the way the user left it.
 *
 * Reaching an AI project from the dashboard is a cold start: Redux is empty, so
 * "Continue to Drawing" opened a canvas with nothing on it. Two sources are
 * tried in order —
 *
 *   1. this project's saved takeoff (session ids, ground scale, drawing list),
 *      which the local file cache then re-previews without a network round trip;
 *   2. the project's own uploads on the server, downloaded through the API with
 *      the auth token, for a browser that has never opened this project.
 */
export function useAiProjectSession(projectId: string) {
  const dispatch = useDispatch();
  const { session, drawings } = useSelector((state: RootState) => state.aiFlow);
  const validProject = isValidObjectId(projectId);

  const restoredFor = useRef<string | null>(null);
  const fetchedFor = useRef<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  // ── 1. The locally saved takeoff for this project ─────────────────────────
  useEffect(() => {
    if (!validProject || restoredFor.current === projectId) return;
    restoredFor.current = projectId;

    if (session.projectId === projectId) return;

    const saved = loadAiFlowForProject(projectId);
    if (saved) {
      dispatch(hydrateAiFlow(saved));
      return;
    }
    // Nothing saved — claim the project so the session calls have something to
    // hang off, and let the server fallback below find the drawing.
    dispatch(setAiProjectId(projectId));
  }, [projectId, validProject, session.projectId, dispatch]);

  // ── 2. The project's uploads on the server ────────────────────────────────
  const alreadyHasDrawings = drawings.length > 0;
  const { data: projectResponse } = useGetProjectByIdQuery(projectId, {
    skip: !validProject || alreadyHasDrawings,
  });

  const [fetchUpload] = useLazyGetUploadQuery();
  const [downloadUpload] = useLazyDownloadUploadQuery();

  useEffect(() => {
    const uploadIds = projectResponse?.data?.drawings ?? [];
    if (
      !validProject ||
      alreadyHasDrawings ||
      uploadIds.length === 0 ||
      fetchedFor.current === projectId
    ) {
      return;
    }
    fetchedFor.current = projectId;

    let cancelled = false;

    (async () => {
      setRecovering(true);
      for (const uploadId of uploadIds) {
        if (cancelled) return;
        if (!isValidObjectId(uploadId)) continue;

        try {
          const meta = await fetchUpload(uploadId).unwrap();
          const file = meta.data;

          // Downloaded through the API rather than from the storage URL: the
          // request carries the auth token and goes to an origin the app is
          // already allowed to call, so it cannot fail on a missing CORS
          // header the way a direct fetch from the canvas would.
          const objectUrl = await downloadUpload(uploadId).unwrap().catch(() => null);

          const entry: AiDrawing = {
            id: uploadId,
            name: file.originalName,
            size: file.size,
            extension: extensionOf(file.originalName),
            status: "complete",
            progress: 100,
            previewUrl: objectUrl ?? undefined,
            uploadedUrl: file.url,
            uploadedFileId: file._id,
          };

          if (cancelled) return;
          dispatch(addAiDrawing(entry));
          dispatch(setAiUploadedFileId(file._id));

          // Keep it locally so the next reload does not download it again.
          if (objectUrl) {
            void cacheDrawingFromUrl(
              uploadId,
              objectUrl,
              file.originalName,
              file.mimeType,
            );
          }
        } catch {
          // One unreadable upload should not stop the others.
        }
      }
    })().finally(() => {
      if (!cancelled) setRecovering(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    projectResponse,
    projectId,
    validProject,
    alreadyHasDrawings,
    dispatch,
    fetchUpload,
    downloadUpload,
  ]);

  return { recovering };
}
