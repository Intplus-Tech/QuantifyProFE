import { BOQDocumentView } from "@/components/projects/boq-document/BOQDocumentView";

interface BOQPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BOQPage({ params }: BOQPageProps) {
  const { projectId } = await params;
  return <BOQDocumentView projectId={projectId} basePath="/projects" />;
}
