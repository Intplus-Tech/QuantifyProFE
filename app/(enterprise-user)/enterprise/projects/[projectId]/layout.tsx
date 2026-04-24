import { ProjectWorkspaceLayout } from "@/components/projects/workspace/ProjectWorkspaceLayout";

interface EnterpriseProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function EnterpriseProjectLayout({
  children,
  params,
}: EnterpriseProjectLayoutProps) {
  const { projectId } = await params;

  return (
    <ProjectWorkspaceLayout
      projectId={projectId}
      basePath="/enterprise/projects"
    >
      {children}
    </ProjectWorkspaceLayout>
  );
}
