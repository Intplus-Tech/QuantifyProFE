"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Plus, Loader2 } from "lucide-react";
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
