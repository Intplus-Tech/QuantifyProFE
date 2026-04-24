"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, Wrench, ArrowLeft } from "lucide-react";
import { useGetProjectsQuery } from "@/store/api/projectsApi";
import { ManualProject } from "@/types/manualProject";
import { ManualProjectCard } from "@/components/projects/manual/ManualProjectCard";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

export default function EnterpriseManualProjectsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: fetchResult, isLoading } = useGetProjectsQuery({
    page: 1,
    limit: 100,
  });

  // Filter to manual-mode only — isolated from the AI flow
  const allProjects = (fetchResult?.data || []) as ManualProject[];
  const manualProjects = allProjects.filter(
    (p) => p.processingMode === "manual"
  );

  const filtered = search.trim()
    ? manualProjects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : manualProjects;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => router.push("/enterprise/projects")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Manual Workspaces</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Projects created with the manual setup wizard
          </p>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search manual projects..."
            className="pl-9 bg-background border-border/50 shadow-sm h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-12"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Manual Project
          </Button>
        </div>
      </div>

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        basePath="/enterprise/projects"
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center p-16 text-center border border-dashed border-gray-200 mt-8 min-h-[400px]">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search ? "No matching projects" : "No manual projects yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {search
              ? "Try a different search term."
              : "Create a project using the manual setup wizard to get started with your workspace."}
          </p>
          {!search && (
            <Button
              size="lg"
              className="rounded-full"
              onClick={() => setDialogOpen(true)}
            >
              + Create Manual Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((project) => (
            <ManualProjectCard
              key={project._id}
              project={project}
              basePath="/enterprise/projects"
            />
          ))}
        </div>
      )}
    </div>
  );
}
