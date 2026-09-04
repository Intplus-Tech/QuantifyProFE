import { ReportShell } from "@/components/projects/ai/report/ReportShell";
import { AiProjectGuard } from "@/components/projects/ai/AiProjectGuard";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function EnterpriseAiReportLayout({ children, params }: LayoutProps) {
  const { projectId } = await params;
  return (
    <AiProjectGuard projectId={projectId} basePath="/enterprise/projects">
      <ReportShell projectId={projectId} basePath="/enterprise/projects">
        {children}
      </ReportShell>
    </AiProjectGuard>
  );
}
