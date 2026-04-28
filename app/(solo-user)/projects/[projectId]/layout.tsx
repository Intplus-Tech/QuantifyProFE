"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProjectWorkspaceLayout } from "@/components/projects/workspace/ProjectWorkspaceLayout";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";

interface SoloProjectLayoutProps {
  children: React.ReactNode;
}

export default function SoloProjectLayout({
  children,
}: SoloProjectLayoutProps) {
  const params = useParams<{ projectId?: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const { data: projectResponse, isLoading } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });

  if (isLoading && !projectResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (projectResponse?.data?.processingMode === "ai") {
    return <>{children}</>;
  }

  return (
    <ProjectWorkspaceLayout projectId={projectId} basePath="/projects">
      {children}
    </ProjectWorkspaceLayout>
  );
}
