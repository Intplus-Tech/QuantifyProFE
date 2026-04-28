"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreVertical,
  Plus,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberModal } from "./InviteMemberModal";
import { RolePermissionsModal } from "./RolePermissionsModal";
import {
  useGetTeamMembersQuery,
  useResendTeamInvitationMutation,
  useDeleteTeamMemberMutation,
} from "@/store/api/companyApi";
import { TeamMember } from "@/types/api";

export function CompanyTeamManagement() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const { data: teamResponse, isLoading: isTeamLoading } = useGetTeamMembersQuery();
  const [resendInvitation, { isLoading: isResending }] = useResendTeamInvitationMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation();

  const teamMembers = teamResponse?.data || [];

  const handleResend = async (id: string, email: string) => {
    try {
      await resendInvitation(id).unwrap();
      toast.success(`Invitation resent to ${email}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resend invitation.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      await deleteMember(id).unwrap();
      toast.success("Team member removed.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove team member.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "invited":
      case "pending":
        return "bg-primary";
      case "offline":
        return "bg-gray-300";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold text-foreground">
            Team Members
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-9 font-semibold text-slate-600 border-slate-300 hover:bg-slate-100"
              onClick={() => setRoleOpen(true)}
            >
              Role Permissions
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
              onClick={() => setInviteOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[200px]">
            {isTeamLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-sm">No team members found.</p>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="text-primary text-xs font-semibold mt-1 hover:underline"
                >
                  Invite your first member
                </button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-y border-border bg-muted/5">
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                      NAME & EMAIL
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                      ROLE
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-muted-foreground uppercase tracking-wider tabular-nums">
                      PERMISSIONS
                    </th>
                    <th className="text-right py-3 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member: TeamMember) => (
                    <tr
                      key={member.id || member._id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback
                              className="text-[10px] font-semibold bg-primary/10 text-primary"
                            >
                              {member.userId?.firstName || member.userId?.lastName
                                ? `${member.userId.firstName?.[0] || ""}${member.userId.lastName?.[0] || ""}`.toUpperCase()
                                : member.userId?.email?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {member.userId?.firstName || member.userId?.lastName
                                ? `${member.userId.firstName} ${member.userId.lastName}`
                                : "Pending User"}
                            </p>
                            <p className="text-muted-foreground">
                              {member.userId?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <Badge
                          variant="secondary"
                          className="border-0 font-medium capitalize"
                        >
                          {member.role || "Member"}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)}`}
                          />
                          <span className="font-medium text-muted-foreground capitalize">
                            {member.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-muted-foreground">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {member.permissions?.map((p) => (
                            <Badge key={p} variant="outline" className="text-[9px] px-1.5 py-0">
                              {p.replace("_", " ")}
                            </Badge>
                          )) || <span className="text-[10px] opacity-40">None</span>}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(member.status === "invited" || member.status === "pending") && (
                              <DropdownMenuItem
                                onClick={() => handleResend(member.id || member._id || "", member.userId?.email || "")}
                                className="flex items-center gap-2"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Resend Invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(member.id || member._id || "")}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!isTeamLoading && teamMembers.length > 0 && (
            <div className="p-4 text-right">
              <button className="text-xs font-semibold text-primary hover:text-primary/80">
                View All
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />
      <RolePermissionsModal open={roleOpen} onOpenChange={setRoleOpen} />
    </>
  );
}
