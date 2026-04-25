import { ProjectWorkspaceView } from "@/components/projects/workspace/ProjectWorkspaceView";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return (
    <ProjectWorkspaceView
      projectId={projectId}
      basePath="/projects"
      mode="dashboard"
    />
  );
}
