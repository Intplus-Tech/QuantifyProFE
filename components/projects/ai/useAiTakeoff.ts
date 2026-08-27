"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";
import {
  useAnalyseAiTakeoffPageMutation,
  useCreateAiTakeoffSessionMutation,
  useFinishAiTakeoffSessionMutation,
  useGetAiTakeoffJobQuery,
  useGetAiTakeoffJobsQuery,
  useGetAiTakeoffSessionQuery,
  useReviewAiTakeoffElementsMutation,
  useUploadAiFileMutation,
} from "@/store/api/aiTakeoffApi";
import {
  applyElementReview,
  clearAiSession,
  failExtraction,
  markAiSessionFinalized,
  setAiActiveJob,
  setAiPageUpload,
  setAiSession,
  setAiSessionError,
  setBoqSections,
  setDerivedReports,
  setExtractedGroups,
  setExtractionSteps,
  setPageStatus,
} from "@/store/slices/aiFlowSlice";
import type { AiReviewStatus, AiTakeoffJob } from "@/types/aiTakeoff";
import type { PageStatus } from "./types";
import { apiMessage, describeApiError, isValidObjectId } from "@/utils/apiError";
import {
  buildStepsFromJob,
  groupDetections,
  mapBoqResultToSections,
  toAiElementTypes,
} from "./api-mappers";
import { rasterisePage } from "./pageRaster";
import {
  deriveBoqSections,
  deriveConcreteSchedule,
  deriveFormworkMaterial,
  deriveRebarSchedule,
} from "./deriveReports";

const JOB_POLL_MS = 3000;

const errorMessage = describeApiError;

/**
 * A failed job carries the upstream provider error verbatim, e.g.
 *   `400 {"type":"error","error":{"message":"Schema is too complex."}, ...}`
 * Pull the human-readable part out of that rather than showing raw JSON.
 */
function readableJobError(raw?: string): string {
  if (!raw) return "The page analysis failed.";

  const start = raw.indexOf("{");
  if (start === -1) return raw;

  try {
    const parsed = JSON.parse(raw.slice(start)) as {
      error?: { message?: string; type?: string };
      message?: string;
    };
    const message = parsed.error?.message ?? parsed.message;
    if (!message) return raw;

    // This one is a server-side schema construction fault, not anything the
    // user did, so say so plainly instead of leaving them to guess.
    if (/schema is too complex/i.test(message)) {
      return `${message} The detection request the server builds is rejected by the AI provider — this needs a backend fix.`;
    }
    return message;
  } catch {
    return raw;
  }
}

/**
 * Orchestrates the documented AI takeoff flow:
 *
 *   POST /uploads                                  drawing + one raster per page
 *   POST /projects/:id/ai-takeoff/sessions         open the session
 *   POST /ai-takeoff/sessions/:id/pages            analyse a page (202 + job)
 *   GET  /ai-takeoff/jobs/:jobId                   poll until completed/failed
 *   GET  /ai-takeoff/sessions/:id                  hydrate elements
 *   PATCH /ai-takeoff/sessions/:id/elements/review accept / reject
 *   POST /ai-takeoff/sessions/:id/finish           materialize (+ build BOQ)
 *
 * Job progress is polled rather than pushed. The API documents Socket.IO as the
 * primary channel with "poll GET /ai-takeoff/jobs/:jobId instead" as the
 * supported fallback; socket.io-client is not a dependency of this app, so the
 * fallback is what is wired here.
 */
export function useAiTakeoff() {
  const dispatch = useDispatch();
  const {
    session,
    drawings,
    activeDrawingId,
    activePage,
    selectionsByPage,
    globalParameters,
  } = useSelector((state: RootState) => state.aiFlow);

  const [uploadFile, uploadState] = useUploadAiFileMutation();
  const [createSession, createSessionState] = useCreateAiTakeoffSessionMutation();
  const [analysePage, analyseState] = useAnalyseAiTakeoffPageMutation();
  const [reviewElements, reviewState] = useReviewAiTakeoffElementsMutation();
  const [finishSession, finishState] = useFinishAiTakeoffSessionMutation();

  const activeDrawing = drawings.find((d) => d.id === activeDrawingId) ?? null;

  // ── Poll the in-flight job ────────────────────────────────────────────────
  const jobQuery = useGetAiTakeoffJobQuery(session.activeJobId ?? "", {
    skip: !session.activeJobId,
    pollingInterval: session.activeJobId ? JOB_POLL_MS : 0,
  });

  const job = jobQuery.data?.data ?? null;
  const jobStatus = job?.status;

  // ── Hydrate elements once a job lands ─────────────────────────────────────
  const sessionQuery = useGetAiTakeoffSessionQuery(session.sessionId ?? "", {
    skip: !session.sessionId,
  });

  /**
   * Job history for the session — the documented alternative to tracking a
   * single jobId. Also recovers the in-flight job after a page reload, when
   * `activeJobId` has been lost from memory.
   */
  const jobsQuery = useGetAiTakeoffJobsQuery(session.sessionId ?? "", {
    skip: !session.sessionId,
  });

  const sessionJobs = useMemo(() => jobsQuery.data?.data ?? [], [jobsQuery.data]);

  // A persisted session can outlive its project (deleted, or a different
  // account). Drop it on 404 instead of retrying a dead id forever.
  useEffect(() => {
    if (!session.sessionId || !sessionQuery.isError) return;
    const status = (sessionQuery.error as { status?: number } | undefined)?.status;
    if (status === 404) {
      dispatch(clearAiSession());
    }
  }, [session.sessionId, sessionQuery.isError, sessionQuery.error, dispatch]);

  useEffect(() => {
    if (!session.sessionId || session.activeJobId) return;
    const running = sessionJobs.find(
      (j) => j.status === "queued" || j.status === "processing",
    );
    if (running) {
      dispatch(setAiActiveJob({ jobId: running._id, pageNumber: running.pageNumber }));
    }
  }, [sessionJobs, session.sessionId, session.activeJobId, dispatch]);

  useEffect(() => {
    if (!job) return;
    dispatch(setExtractionSteps(buildStepsFromJob(job)));
  }, [job, dispatch]);

  useEffect(() => {
    if (jobStatus !== "completed" && jobStatus !== "failed") return;

    dispatch(setAiActiveJob({ jobId: null }));

    if (jobStatus === "failed") {
      const message = readableJobError(job?.errorMessage);
      dispatch(setAiSessionError(message));
      // Back to the selection panel so the page can be retried.
      dispatch(failExtraction());
      // One id per page: a retry replaces the previous notice instead of
      // stacking another copy that has to be dismissed separately.
      toast.error("Extraction failed", {
        id: `ai-extract-${job?.pageNumber ?? "page"}`,
        description: `${message}${
          job?.creditsCharged === 0 ? " No credits were charged." : ""
        }`,
      });
      return;
    }

    if (job?.pageNumber) {
      dispatch(setPageStatus({ page: job.pageNumber, status: "processed" }));
    }
    void sessionQuery.refetch();

    // A zero-detection run is a normal outcome — the model explains why in
    // `notes` (a cover sheet, a page with no structural elements, …), so lead
    // with that rather than a bare count.
    const detected = job?.detectedCount ?? 0;

    if (detected === 0) {
      toast.info("No elements found on this page", {
        id: `ai-extract-${job?.pageNumber ?? "page"}`,
        description:
          job?.notes ??
          "The model reported nothing matching the selected element types. Try a page with the relevant plan or schedule.",
        duration: 10000,
      });
    } else {
      toast.success("Extraction complete", {
        id: `ai-extract-${job?.pageNumber ?? "page"}`,
        description: `${detected} element(s) detected${
          job?.discardedCount ? `, ${job.discardedCount} discarded` : ""
        }.`,
      });
    }
    // sessionQuery is intentionally not a dependency: including it would re-run
    // this on every refetch and re-fire the toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus, job, dispatch]);

  // ── Fold hydrated detections into the audit tables ────────────────────────
  const detections = useMemo(
    () => sessionQuery.data?.data?.elements ?? [],
    [sessionQuery.data],
  );

  /**
   * Page chips reflect what actually ran: a page is only "processed" once a
   * job reports on it, and "review" if that job failed or found nothing.
   */
  useEffect(() => {
    if (!session.sessionId || sessionJobs.length === 0) return;

    const latestByPage = new Map<number, AiTakeoffJob>();
    for (const job of sessionJobs) {
      const seen = latestByPage.get(job.pageNumber);
      const at = (j: AiTakeoffJob) => new Date(j.createdAt ?? 0).getTime();
      if (!seen || at(job) >= at(seen)) {
        latestByPage.set(job.pageNumber, job);
      }
    }

    for (const [pageNumber, job] of latestByPage) {
      const status: PageStatus =
        job.status === "completed"
          ? (job.detectedCount ?? 0) > 0
            ? "processed"
            : "review"
          : job.status === "failed"
            ? "review"
            : "pending";
      dispatch(setPageStatus({ page: pageNumber, status }));
    }
  }, [sessionJobs, session.sessionId, dispatch]);

  useEffect(() => {
    if (detections.length === 0) return;

    const liveGroups = groupDetections(detections, session.unit, session.scale);
    dispatch(setExtractedGroups(liveGroups));

    // Rebuild the report tables off the real detections so the BOQ, Material
    // Schedule and Formwork Schedule stop showing the seeded sample.
    dispatch(
      setDerivedReports({
        boqSections: deriveBoqSections(liveGroups, globalParameters),
        concreteSchedule: deriveConcreteSchedule(liveGroups, globalParameters),
        rebarSchedule: deriveRebarSchedule(liveGroups, globalParameters),
        formworkMaterial: deriveFormworkMaterial(liveGroups, globalParameters),
      }),
    );

    // The OpenAPI document describes `attributes` only as "single object or
    // array of attribute objects" — it never names the keys. If the server's
    // names differ from what the mapper reads, dimensions come through blank
    // rather than failing, so report the comparison once per batch in dev.
    if (process.env.NODE_ENV !== "production") {
      const sample = Array.isArray(detections[0].attributes)
        ? detections[0].attributes[0]
        : detections[0].attributes;
      const keys = sample ? Object.keys(sample) : [];
      const expected = ["width", "depth", "thickness", "diameter", "grid", "tag"];

      console.info(
        `[ai-takeoff] ${detections.length} detection(s).`,
        `\n  attribute keys returned: ${keys.length ? keys.join(", ") : "(none)"}`,
        `\n  mapper reads:            ${expected.join(", ")}`,
        `\n  matched:                 ${expected.filter((k) => keys.includes(k)).join(", ") || "(none)"}`,
        `\n  mapsToElementType:       ${detections[0].mapsToElementType}`,
        `\n  computed:                ${JSON.stringify(detections[0].computed)}`,
        "\n  first detection:",
        detections[0],
      );
    }
  }, [detections, session.unit, session.scale, globalParameters, dispatch]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** POST /uploads for the drawing itself. */
  const uploadDrawing = useCallback(
    async (file: File) => {
      const response = await uploadFile({ file, folder: "ai-takeoff" }).unwrap();
      return response.data;
    },
    [uploadFile],
  );

  /** POST /projects/:projectId/ai-takeoff/sessions */
  const openSession = useCallback(
    async (projectId: string, uploadedFileId: string, title?: string) => {
      // The route falls back to a literal "draft" id when project creation
      // failed; sending that returns 400 "Invalid project ID".
      if (!isValidObjectId(projectId)) {
        const message =
          "This project was never created on the server, so AI extraction is unavailable. Go back and re-enter the project details.";
        dispatch(setAiSessionError(message));
        toast.error("No server project", { description: message });
        throw new Error(message);
      }
      if (!isValidObjectId(uploadedFileId)) {
        const message = "The drawing upload did not return a valid id.";
        dispatch(setAiSessionError(message));
        toast.error("Upload incomplete", { description: message });
        throw new Error(message);
      }

      try {
        const response = await createSession({
          projectId,
          body: { uploadedFileId, title, resume: true },
        }).unwrap();

        const sessionId =
          response.data?.session?._id ??
          (response.data as { _id?: string } | undefined)?._id;

        if (!sessionId) throw new Error("The session response carried no id.");

        dispatch(setAiSession({ sessionId, uploadedFileId }));
        toast.success(apiMessage(response, "AI takeoff session started."), {
          description: `Session ${sessionId}`,
        });
        return sessionId;
      } catch (error) {
        const message = errorMessage(error, "Could not open the AI takeoff session.");
        dispatch(setAiSessionError(message));
        toast.error("Session failed", { description: message });
        throw error;
      }
    },
    [createSession, dispatch],
  );

  /**
   * Re-open the session after a reload. The ids are persisted, but if only the
   * project and drawing survived, `resume: true` gets a live session back
   * rather than leaving the screen silently disconnected.
   */
  const ensureSession = useCallback(
    async (projectId?: string) => {
      if (session.sessionId) return session.sessionId;

      const targetProject = projectId ?? session.projectId;
      const uploadedFileId =
        session.uploadedFileId ?? drawings.find((d) => d.uploadedFileId)?.uploadedFileId;

      if (!isValidObjectId(targetProject) || !isValidObjectId(uploadedFileId)) {
        return null;
      }

      try {
        return await openSession(targetProject, uploadedFileId);
      } catch {
        return null;
      }
    },
    [drawings, openSession, session.projectId, session.sessionId, session.uploadedFileId],
  );

  /**
   * Rasterise the page, upload it, then POST it for analysis.
   * Returns the job id so the caller can show progress.
   */
  const analyseCurrentPage = useCallback(
    async (pageNumber = activePage) => {
      if (!session.sessionId) {
        toast.error("No active session", {
          description: "Upload a drawing and start processing first.",
        });
        return null;
      }
      const drawingUrl = activeDrawing?.previewUrl ?? activeDrawing?.uploadedUrl;
      if (!activeDrawing || !drawingUrl) {
        toast.error("No drawing selected");
        return null;
      }

      const elementTypes = toAiElementTypes(selectionsByPage[pageNumber] ?? []);
      if (elementTypes.length === 0) {
        toast.error("Nothing to extract", {
          description: "Select at least one supported element type.",
        });
        return null;
      }
      if (session.scale == null) {
        toast.error("Page scale required", {
          description: "Set the drawing scale before extracting.",
        });
        return null;
      }

      try {
        // Reuse the page raster if this page has already been uploaded.
        let uploadedFileId = session.pageUploadIds[pageNumber];
        let size = session.pageSizes[pageNumber];

        if (!uploadedFileId || !size) {
          const raster = await rasterisePage(
            drawingUrl,
            activeDrawing.extension,
            pageNumber,
            activeDrawing.name.replace(/\.[^.]+$/, ""),
          );
          const uploaded = await uploadFile({
            file: raster.file,
            folder: "ai-takeoff-pages",
          }).unwrap();

          uploadedFileId = uploaded.data._id;
          size = { width: raster.width, height: raster.height };
          dispatch(
            setAiPageUpload({
              page: pageNumber,
              uploadedFileId,
              width: raster.width,
              height: raster.height,
            }),
          );
        }

        const response = await analysePage({
          sessionId: session.sessionId,
          body: {
            pageNumber,
            uploadedFileId,
            width: size.width,
            height: size.height,
            unit: session.unit,
            scale: session.scale,
            elementTypes,
            replaceExisting: true,
          },
        }).unwrap();

        const jobId = response.data?.job?._id ?? null;
        dispatch(setAiActiveJob({ jobId, pageNumber }));
        dispatch(setPageStatus({ page: pageNumber, status: "current" }));
        dispatch(setAiSessionError(null));
        toast.success(apiMessage(response, "Page queued for analysis."), {
          description: `Page ${pageNumber} · ${elementTypes.join(", ")}`,
        });
        return jobId;
      } catch (error) {
        const status = (error as { status?: number })?.status;
        const message = errorMessage(error, "Could not start the page analysis.");

        // 409 — this page is already running. That is not a failure: adopt the
        // in-flight job and keep polling instead of reporting an error.
        if (status === 409) {
          const { data: refreshed } = await jobsQuery.refetch();
          const running = (refreshed?.data ?? []).find(
            (j) =>
              j.pageNumber === pageNumber &&
              (j.status === "queued" || j.status === "processing"),
          );

          if (running) {
            dispatch(
              setAiActiveJob({ jobId: running._id, pageNumber: running.pageNumber }),
            );
            dispatch(setAiSessionError(null));
            toast.info("Already analysing this page", {
              description: "Reattached to the run already in progress.",
            });
            return running._id;
          }
        }

        // The API returns 404 both for a missing session/upload and for a user
        // with no AI credit wallet. Only the message distinguishes them, so
        // label it rather than reporting a misleading "not found".
        const isCreditIssue =
          status === 402 || /credit/i.test(message);

        dispatch(setAiSessionError(message));
        toast.error(
          isCreditIssue ? "AI credits unavailable" : "Extraction failed",
          {
            description: isCreditIssue
              ? `${message} No credits were charged.`
              : message,
          },
        );
        return null;
      }
    },
    [
      activeDrawing,
      activePage,
      analysePage,
      dispatch,
      selectionsByPage,
      session.pageSizes,
      session.pageUploadIds,
      session.scale,
      session.sessionId,
      session.unit,
      uploadFile,
      jobsQuery,
    ],
  );

  /** PATCH /ai-takeoff/sessions/:id/elements/review */
  const reviewDetections = useCallback(
    async (clientIds: string[], status: AiReviewStatus) => {
      if (!session.sessionId || clientIds.length === 0) return;

      // Only ids that came back from the API exist server-side. Sample rows
      // (PC-1, GB-2 …) would 404 with "Measurement element not found".
      const known = new Set(detections.map((d) => d.clientId).filter(Boolean));
      const realIds = clientIds.filter((id) => known.has(id));

      if (realIds.length === 0) {
        dispatch(applyElementReview({ clientIds, status }));
        return;
      }

      try {
        const response = await reviewElements({
          sessionId: session.sessionId,
          body: { clientIds: realIds, status },
        }).unwrap();
        dispatch(applyElementReview({ clientIds, status }));
        toast.success(apiMessage(response, `${realIds.length} element(s) ${status}.`), {
          description: `${realIds.length} element${realIds.length === 1 ? "" : "s"} ${status}`,
        });
      } catch (error) {
        toast.error("Review failed", {
          description: errorMessage(error, "Could not update those elements."),
        });
      }
    },
    [detections, dispatch, reviewElements, session.sessionId],
  );

  /** POST /ai-takeoff/sessions/:id/finish */
  const finish = useCallback(
    async (commit = true) => {
      if (!session.sessionId) return null;
      try {
        const response = await finishSession({
          sessionId: session.sessionId,
          body: { commit },
        }).unwrap();

        dispatch(markAiSessionFinalized());

        // commit: true persists the BOQ on the project and returns it here.
        // Feed it into the report so the Bill of Quantity shows the real thing
        // rather than the seeded sample sections.
        const boqResult = response.data?.boqResult;
        if (boqResult?.sections?.length) {
          dispatch(setBoqSections(mapBoqResultToSections(boqResult)));
        }

        toast.success(apiMessage(response, "Takeoff finalized."), {
          description: `${response.data.materialized} measurement(s) materialized${
            response.data.skipped ? `, ${response.data.skipped} skipped` : ""
          }.`,
        });
        return response.data;
      } catch (error) {
        const status = (error as { status?: number })?.status;
        // 400 here means there was nothing to materialize but a BOQ commit was
        // asked for — retry without the commit so the session still finalizes.
        if (status === 400 && commit) {
          toast.warning("Nothing to build a BOQ from", {
            description: "Finalizing without the BOQ commit.",
          });
          return finish(false);
        }
        toast.error("Finalize failed", {
          description: errorMessage(error, "Could not finalize the takeoff."),
        });
        return null;
      }
    },
    [dispatch, finishSession, session.sessionId],
  );

  return {
    session,
    job,
    detections,
    jobs: sessionJobs.length > 0 ? sessionJobs : (sessionQuery.data?.data?.jobs ?? []),
    uploadDrawing,
    openSession,
    ensureSession,
    analyseCurrentPage,
    reviewDetections,
    finish,
    refetchSession: sessionQuery.refetch,
    isUploading: uploadState.isLoading,
    isOpeningSession: createSessionState.isLoading,
    isAnalysing: analyseState.isLoading || !!session.activeJobId,
    /**
     * A run only blocks the page it is analysing — the server rejects a second
     * request for the *same* page, not for the drawing. Scoping it this way
     * keeps Extract live when the user moves to another page mid-run.
     */
    isAnalysingPage: (pageNumber: number) =>
      analyseState.isLoading ||
      (!!session.activeJobId && session.jobPageNumber === pageNumber),
    isReviewing: reviewState.isLoading,
    isFinishing: finishState.isLoading,
  };
}
