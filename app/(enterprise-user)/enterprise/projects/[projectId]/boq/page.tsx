import { BOQReportView } from "@/components/projects/boq-report/BOQReportView";

interface BOQPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BOQPage({ params }: BOQPageProps) {
  const { projectId } = await params;
  return <BOQReportView projectId={projectId} basePath="/enterprise/projects" />;
}
