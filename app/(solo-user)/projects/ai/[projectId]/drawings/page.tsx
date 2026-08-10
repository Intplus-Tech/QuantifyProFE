import { DrawingReferencesView } from "@/components/projects/ai/DrawingReferencesView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiDrawingsPage({ params }: PageProps) {
  const { projectId } = await params;
  return <DrawingReferencesView projectId={projectId} basePath="/projects" />;
}
