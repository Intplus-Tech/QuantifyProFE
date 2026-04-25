import { ProjectWorkspaceView } from "@/components/projects/workspace/ProjectWorkspaceView";

interface ProjectLibraryPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLibraryPage({ params }: ProjectLibraryPageProps) {
  const { projectId } = await params;

  return (
    <ProjectWorkspaceView
      projectId={projectId}
      basePath="/enterprise/projects"
      mode="library"
    />
  );
}
