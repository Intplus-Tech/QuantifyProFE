import { DrawingReferencesView } from "@/components/projects/ai/DrawingReferencesView";
import { AiProjectGuard } from "@/components/projects/ai/AiProjectGuard";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EnterpriseAiDrawingsPage({ params }: PageProps) {
  const { projectId } = await params;
  return (
    <AiProjectGuard projectId={projectId} basePath="/enterprise/projects">
      <DrawingReferencesView projectId={projectId} basePath="/enterprise/projects" />
    </AiProjectGuard>
  );
}
