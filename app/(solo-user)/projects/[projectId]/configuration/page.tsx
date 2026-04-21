import { ProjectWorkspaceView } from "@/components/projects/workspace/ProjectWorkspaceView";

interface ProjectConfigurationPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectConfigurationPage({ params }: ProjectConfigurationPageProps) {
  const { projectId } = await params;

  return (
    <ProjectWorkspaceView
      projectId={projectId}
      basePath="/projects"
      mode="configuration"
    />
  );
}
