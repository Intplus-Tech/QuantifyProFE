import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  ExternalLink,
  UserPlus,
  Trash2,
  Image as ImageIcon,
  FileX,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { Project } from "@/types/projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProjectMutation } from "@/store/api/projectsApi";
import { toast } from "sonner";
import { UpdateThumbnailModal } from "./modals/UpdateThumbnailModal";
import { InviteMemberModal } from "./modals/InviteMemberModal";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveTemplateDialog, setShowRemoveTemplateDialog] =
    useState(false);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const isAiMode = project.processingMode === "ai";
  const processingModeLabel = isAiMode ? "AI" : "Manual";
  const projectRoute = isAiMode ? `/projects/${project._id}/boq` : `/projects/${project._id}`;

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleDelete = async () => {
    try {
      await deleteProject(project._id).unwrap();
      toast.success("Project deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete project");
    }
  };

  const handleRemoveTemplate = () => {
    // Placeholder for remove from template logic
    toast.success("Project removed from templates");
    setShowRemoveTemplateDialog(false);
  };

  const defaultImage =
    project.thumbnailUrl ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

  return (
    <>
      <Card
        className="group overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 border-border/50 cursor-pointer relative"
        onClick={() => router.push(projectRoute)}
      >
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          <img
            src={defaultImage}
            alt={project.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge
              className={`text-[10px] font-semibold gap-1 shadow ${isAiMode
                ? "bg-sky-500/90 text-white"
                : "bg-primary/90 text-primary-foreground"
                }`}
            >
              {isAiMode ? (
                <Sparkles className="w-2.5 h-2.5" />
              ) : (
                <Wrench className="w-2.5 h-2.5" />
              )}
              {processingModeLabel}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <CardContent className="p-5 flex flex-col flex-1 bg-card relative">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-base text-foreground line-clamp-1 flex-1 pr-2">
              {project.name}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mt-1.5 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(projectRoute);
                  }}
                  className="gap-2 px-3 py-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span>Open</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInviteModal(true);
                  }}
                  className="gap-2 px-3 py-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  <span>Invite Member</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRemoveTemplateDialog(true);
                  }}
                  className="gap-2 px-3 py-2 cursor-pointer"
                >
                  <FileX className="w-4 h-4 text-muted-foreground" />
                  <span>Remove Template</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThumbnailModal(true);
                  }}
                  className="gap-2 px-3 py-2 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span>Update Thumbnail</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="gap-2 px-3 py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-10">
            {project.description || "Project Draft"}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
            <div className="flex -space-x-2">
              <Avatar className="w-7 h-7 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {project.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={project._id}
      />

      <UpdateThumbnailModal
        isOpen={showThumbnailModal}
        onClose={() => setShowThumbnailModal(false)}
        projectId={project._id}
        projectName={project.name}
        currentThumbnail={project.thumbnailUrl}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project "{project.name}" and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showRemoveTemplateDialog}
        onOpenChange={setShowRemoveTemplateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Templates?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{project.name}" from the list of templates. The
              project itself will remain available in your projects list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemoveTemplate();
              }}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Confirm Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
