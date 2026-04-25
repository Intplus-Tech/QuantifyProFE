"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Check } from "lucide-react";
import { useGetTeamMembersQuery } from "@/store/api/companyApi";
import { useAddProjectMemberMutation, useGetProjectMembersQuery } from "@/store/api/projectsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  projectId,
}: InviteMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: teamData, isLoading: isLoadingTeam } = useGetTeamMembersQuery();
  const { data: projectMembersData } = useGetProjectMembersQuery({ projectId });
  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation();

  const projectMemberIds = useMemo(() => {
    return new Set(projectMembersData?.data?.map(m => m.userId) || []);
  }, [projectMembersData]);

  const filteredMembers = useMemo(() => {
    if (!teamData?.data) return [];
    return teamData.data.filter((member) => {
      const name = `${member.userId.firstName} ${member.userId.lastName}`.toLowerCase();
      const email = member.userId.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [teamData, searchQuery]);

  const handleInvite = async (userId: string) => {
    try {
      await addMember({
        projectId,
        body: {
          userId,
          role: "contributor", // Default role
        },
      }).unwrap();
      toast.success("Member invited successfully");
    } catch (error: any) {
      console.error("Failed to invite member:", error);
      toast.error(error?.data?.message || "Failed to invite member");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Invite Member</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter assignees"
              className="pl-9 bg-muted/50 border-none h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="h-[350px] px-2 py-4">
          <div className="space-y-1 px-4">
            {isLoadingTeam ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No members found
              </div>
            ) : (
              filteredMembers.map((member) => {
                const userId = member.userId._id;
                const isAlreadyMember = projectMemberIds.has(userId);
                const fullName = `${member.userId.firstName} ${member.userId.lastName}`;
                
                return (
                  <div
                    key={member._id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                      isAlreadyMember ? "opacity-50" : "hover:bg-slate-50 cursor-pointer group"
                    )}
                    onClick={() => !isAlreadyMember && handleInvite(userId)}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                      isAlreadyMember 
                        ? "bg-amber-500 border-amber-500" 
                        : "border-amber-500/30 group-hover:border-amber-500"
                    )}>
                      {isAlreadyMember && <Check className="w-4 h-4 text-white" />}
                    </div>

                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">
                          {fullName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {member.role || "Quantity Surveyor"}
                        </span>
                      </div>
                      
                      {isAdding && (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
