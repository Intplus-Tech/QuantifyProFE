"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Wrench, MapPin, Calendar, ArrowRight } from "lucide-react";
import type { Project } from "@/types/projects";

interface ManualProjectCardProps {
  project: Project;
  basePath?: string; // "/projects" | "/enterprise/projects"
}

const defaultImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";

export function ManualProjectCard({
  project,
  basePath = "/projects",
}: ManualProjectCardProps) {
  const router = useRouter();

  function handleOpen() {
    router.push(`${basePath}/${project._id}`);
  }

  return (
    <Card
      className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 border-border/50 cursor-pointer group"
      onClick={handleOpen}
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        <img
          src={defaultImage}
          alt={project.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {/* Manual mode badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-semibold gap-1 shadow">
            <Wrench className="w-2.5 h-2.5" />
            Manual
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1 bg-card">
        {/* Title row */}
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 flex-1 pr-2">
            {project.name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1.5 -mr-2 text-muted-foreground hover:text-foreground shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description || "No description provided."}
        </p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.projectLocation && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5" />
              {project.projectLocation}
            </span>
          )}
          {project.projectType && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {project.projectType}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Open workspace
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
