import { MaterialScheduleView } from "@/components/projects/ai/report/MaterialScheduleView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiReportMaterialsPage({ params }: PageProps) {
  const { projectId } = await params;
  return <MaterialScheduleView projectId={projectId} />;
}
