import { ReportShell } from "@/components/projects/ai/report/ReportShell";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function AiReportLayout({ children, params }: LayoutProps) {
  const { projectId } = await params;
  return (
    <ReportShell projectId={projectId} basePath="/enterprise/projects">
      {children}
    </ReportShell>
  );
}
