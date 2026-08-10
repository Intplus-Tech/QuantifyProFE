import { ExtractWorkspaceView } from "@/components/projects/ai/extract/ExtractWorkspaceView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiExtractPage({ params }: PageProps) {
  const { projectId } = await params;
  return <ExtractWorkspaceView projectId={projectId} basePath="/enterprise/projects" />;
}
