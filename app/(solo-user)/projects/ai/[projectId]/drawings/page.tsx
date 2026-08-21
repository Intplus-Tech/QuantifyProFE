import { DrawingReferencesView } from "@/components/projects/ai/DrawingReferencesView";
import { AiProjectGuard } from "@/components/projects/ai/AiProjectGuard";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiDrawingsPage({ params }: PageProps) {
  const { projectId } = await params;
  return (
    <AiProjectGuard projectId={projectId} basePath="/projects">
      <DrawingReferencesView projectId={projectId} basePath="/projects" />
    </AiProjectGuard>
  );
}
