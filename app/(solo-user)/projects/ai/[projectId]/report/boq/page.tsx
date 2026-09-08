import { BillOfQuantityView } from "@/components/projects/ai/report/BillOfQuantityView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiReportBoqPage({ params }: PageProps) {
  const { projectId } = await params;
  return <BillOfQuantityView projectId={projectId} />;
}
