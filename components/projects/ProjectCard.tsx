import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { Project } from "@/types/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  // Temporary mock data for UI fields not yet supported by backend schema
  const defaultImage =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";
  const mockTeam = [
    { avatar: "https://i.pravatar.cc/150?u=1", initials: "JD" },
  ];

  return (
    <Card
      className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow border-border/50 cursor-pointer"
      onClick={() => router.push(`/projects/${project._id}/boq`)}
    >
      <div className="relative h-48 w-full bg-muted">
        <img
          src={defaultImage}
          alt={project.name}
          className="object-cover w-full h-full"
        />
      </div>

      <CardContent className="p-5 flex flex-col flex-1 bg-card">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-base text-foreground line-clamp-1">
            {project.name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1.5 -mr-2 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
          {project.description || "Project Draft"}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
          <div className="flex -space-x-2">
            {mockTeam.map((member, idx) => (
              <Avatar key={idx} className="w-7 h-7 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-[10px]">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
