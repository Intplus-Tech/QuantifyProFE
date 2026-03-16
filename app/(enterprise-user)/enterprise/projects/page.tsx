"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ArrowUpDown, Plus, MoreVertical } from "lucide-react";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

const mockProjects = [
  {
    id: 1,
    title: "Central Park Cafe",
    subtitle: "Draft Estimate",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    updatedAt: "1w ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=1", initials: "JD" }],
  },
  {
    id: 2,
    title: "Central Park Cafe",
    subtitle: "Draft Estimate",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    updatedAt: "1w ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=2", initials: "AS" }],
  },
  {
    id: 3,
    title: "Riverside Complex",
    subtitle: "Commercial  14,000 m",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    updatedAt: "2h ago",
    team: [
      { avatar: "https://i.pravatar.cc/150?u=3", initials: "MK" },
      { avatar: "https://i.pravatar.cc/150?u=4", initials: "BL" },
    ],
  },
  {
    id: 4,
    title: "Oakwood Residences",
    subtitle: "Residential  Phase 2",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    updatedAt: "1d ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=5", initials: "RJ" }],
  },
  {
    id: 5,
    title: "Metro Station Hub",
    subtitle: "Infrastructure  Civil",
    image:
      "https://images.unsplash.com/photo-1541888087525-efb8f5031314?w=800&q=80",
    updatedAt: "3d ago",
    team: [
      { avatar: "https://i.pravatar.cc/150?u=6", initials: "TR" },
      { avatar: "https://i.pravatar.cc/150?u=7", initials: "PL" },
      { avatar: "https://i.pravatar.cc/150?u=8", initials: "WQ" },
    ],
  },
  {
    id: 6,
    title: "Riverside Complex",
    subtitle: "Commercial  14,000 m",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    updatedAt: "2h ago",
    team: [
      { avatar: "https://i.pravatar.cc/150?u=3", initials: "MK" },
      { avatar: "https://i.pravatar.cc/150?u=4", initials: "BL" },
    ],
  },
  {
    id: 7,
    title: "Oakwood Residences",
    subtitle: "Residential  Phase 2",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    updatedAt: "1d ago",
    team: [{ avatar: "https://i.pravatar.cc/150?u=5", initials: "RJ" }],
  },
  {
    id: 8,
    title: "Metro Station Hub",
    subtitle: "Infrastructure  Civil",
    image:
      "https://images.unsplash.com/photo-1541888087525-efb8f5031314?w=800&q=80",
    updatedAt: "3d ago",
    team: [
      { avatar: "https://i.pravatar.cc/150?u=6", initials: "TR" },
      { avatar: "https://i.pravatar.cc/150?u=7", initials: "PL" },
      { avatar: "https://i.pravatar.cc/150?u=8", initials: "WQ" },
    ],
  },
];

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className=" mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            className="pl-9 bg-background border-border/50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="bg-background border-border/50 shadow-sm text-muted-foreground"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort by: Recent
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Project Card */}
        <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {/* Project Cards */}
        {mockProjects.map((project) => (
          <Card
            key={project.id}
            className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow border-border/50"
          >
            {/* Project Image */}
            <div className="relative h-48 w-full bg-muted">
              <img
                src={project.image}
                alt={project.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Project Details */}
            <CardContent className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base text-foreground line-clamp-1">
                  {project.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mt-1.5 -mr-2 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {project.subtitle}
              </p>

              {/* Card Footer (Avatars & Date) */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                <div className="flex -space-x-2">
                  {project.team.map((member, idx) => (
                    <Avatar
                      key={idx}
                      className="w-7 h-7 border-2 border-background"
                    >
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Updated {project.updatedAt}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
