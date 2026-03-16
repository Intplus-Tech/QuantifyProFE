"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import type { Template } from "@/components/templates/mock-data";

interface TemplateCardProps {
  template: Template;
  onView: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export function TemplateCard({ template, onView, onDelete }: TemplateCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const Icon = template.icon;

  return (
    <>
      <Card
        className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden flex flex-col cursor-pointer"
        onClick={() => onView(template)}
      >
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.iconBg}`}
            >
              <Icon className={`w-6 h-6 ${template.iconColor}`} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(template);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-6 flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
              {template.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {template.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {template.team.map((member, idx) => (
                  <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground hover:bg-muted border-0 font-medium px-2 py-0.5 text-xs rounded-full"
              >
                {template.extraUsers}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {template.openedAt}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{template.title}&quot; from your template list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(template);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
