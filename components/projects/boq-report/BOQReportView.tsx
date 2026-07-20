"use client";

// TODO: SWAP POINT — real API is commented out while the UI is rebuilt on dummy data.
// Un-comment the query below (and the branches marked API RESTORE) once the UI is settled.
// import { useGetBoqReportPreviewQuery } from "@/store/api/projectsApi";
// import { mapApiToUiReport } from "./mapApiToUiReport";

import { ReportToolbar } from "./ReportToolbar";
import { ReportHeader } from "./ReportHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { BOQTable } from "./BOQTable";
import { TermsAndNotes } from "./TermsAndNotes";
import { BOQReportLoading } from "./BOQReportLoading";
import { BOQReportError } from "./BOQReportError";
import { PrintFooter } from "./PrintFooter";
import { MOCK_BOQ_REPORT } from "./mock-data";

// TODO: dev-only switch so the loading / error states stay reachable while
// the API is stubbed. Delete once the real query is back in.
type PreviewState = "ready" | "loading" | "error";
const PREVIEW_STATE: PreviewState = "ready";

interface BOQReportViewProps {
  projectId: string;
  basePath?: string; // e.g. "/projects" or "/enterprise/projects"
}

export function BOQReportView({
  projectId,
  basePath = "/projects",
}: BOQReportViewProps) {
  // API RESTORE
  // const { data: apiResponse, isLoading, error } = useGetBoqReportPreviewQuery(projectId);
  // if (isLoading) return <BOQReportLoading />;
  // if (error || !apiResponse?.success) return <BOQReportError />;
  // const report = mapApiToUiReport(apiResponse.data);

  if (PREVIEW_STATE === "loading") return <BOQReportLoading />;
  if (PREVIEW_STATE === "error") return <BOQReportError />;

  const report = MOCK_BOQ_REPORT;

  return (
    <div>
      <div className="print:hidden">
        <ReportToolbar
          projectId={projectId}
          basePath={basePath}
          reportRef={report.meta.ref}
        />
      </div>

      <div className="space-y-6">
        <ReportHeader meta={report.meta} />

        <ExecutiveSummary
          costCategories={report.costCategories}
          resourceAllocations={report.resourceAllocations}
          grandTotal={report.grandTotal}
        />

        <BOQTable sections={report.sections} grandTotal={report.grandTotal} />

        <div className="pt-2">
          <TermsAndNotes terms={report.terms} />
        </div>

        <PrintFooter
          reportRef={report.meta.ref}
          dateGenerated={report.meta.dateGenerated}
        />
      </div>
    </div>
  );
}
