import { ProjectWorkspaceLayout } from "@/components/projects/workspace/ProjectWorkspaceLayout";

interface SoloProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function SoloProjectLayout({
  children,
  params,
}: SoloProjectLayoutProps) {
  const { projectId } = await params;

  return (
    <ProjectWorkspaceLayout projectId={projectId} basePath="/projects">
      {children}
    </ProjectWorkspaceLayout>
  );
}
