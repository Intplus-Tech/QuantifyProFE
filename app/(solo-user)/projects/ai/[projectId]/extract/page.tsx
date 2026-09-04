import { ExtractWorkspaceView } from "@/components/projects/ai/extract/ExtractWorkspaceView";
import { AiProjectGuard } from "@/components/projects/ai/AiProjectGuard";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiExtractPage({ params }: PageProps) {
  const { projectId } = await params;
  return (
    <AiProjectGuard projectId={projectId} basePath="/projects">
      <ExtractWorkspaceView projectId={projectId} basePath="/projects" />
    </AiProjectGuard>
  );
}
