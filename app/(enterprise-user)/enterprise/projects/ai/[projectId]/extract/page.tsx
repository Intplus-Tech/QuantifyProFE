import { ExtractWorkspaceView } from "@/components/projects/ai/extract/ExtractWorkspaceView";
import { AiProjectGuard } from "@/components/projects/ai/AiProjectGuard";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EnterpriseAiExtractPage({ params }: PageProps) {
  const { projectId } = await params;
  return (
    <AiProjectGuard projectId={projectId} basePath="/enterprise/projects">
      <ExtractWorkspaceView projectId={projectId} basePath="/enterprise/projects" />
    </AiProjectGuard>
  );
}
