"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Plus, Loader2, Wrench } from "lucide-react";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useGetProjectsQuery } from "@/store/api/projectsApi";

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { data: fetchResult, isLoading } = useGetProjectsQuery({
    page: 1,
    limit: 12,
  });
  const projects = fetchResult?.data || [];

  return (
    <div className="mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            className="pl-9 bg-background border-border/50 shadow-sm h-12"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="bg-background border-border/50 shadow-sm text-muted-foreground h-12"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort by: Recent
          </Button>
          {/* Manual workspaces button — links to dedicated manual projects page */}
          <Button
            variant="outline"
            className="bg-background border-border/50 shadow-sm text-muted-foreground h-12"
            onClick={() => router.push("/enterprise/projects/manual")}
          >
            <Wrench className="w-4 h-4 mr-2" />
            My Workspaces
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-12"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-16 col-span-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : projects.length === 0 ? (
        <>
          <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} basePath="/enterprise/projects" hideTrigger />
          <div className="bg-white rounded-2xl flex flex-col items-center justify-center p-16 text-center border border-dashed border-gray-200 mt-8 min-h-[400px]">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                className="text-primary"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Get started by creating your first project to manage estimates and
              generate BOQs.
            </p>
            <Button size="lg" className="rounded-full" onClick={() => setDialogOpen(true)}>
              + Create New Project
            </Button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} basePath="/enterprise/projects" />
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
