import { ProcessingView } from "@/components/projects/processing/ProcessingView";

interface ProcessingPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProcessingPage({ params }: ProcessingPageProps) {
  const { projectId } = await params;

  return <ProcessingView projectId={projectId} basePath="/projects" />;
}
