"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash2,
  Users,
} from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Adebayo Johnson",
    email: "adebayo@quantifypro.com",
    avatar: "https://i.pravatar.cc/150?u=adebayo",
    initials: "AJ",
    role: "Owner",
    roleBg: "bg-primary/10 text-primary",
    department: "Management",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "Online now",
  },
  {
    id: 2,
    name: "Sarah Miller",
    email: "sarah.m@quantifypro.com",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    initials: "SM",
    role: "Admin",
    roleBg: "bg-orange-100 text-orange-600",
    department: "Quantity Surveying",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "2 hours ago",
  },
  {
    id: 3,
    name: "David Hughes",
    email: "david.h@quantifypro.com",
    avatar: "https://i.pravatar.cc/150?u=david",
    initials: "DH",
    role: "Manager",
    roleBg: "bg-blue-100 text-blue-600",
    department: "Civil Engineering",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "1 day ago",
  },
  {
    id: 4,
    name: "Lisa Johnson",
    email: "lisa.j@quantifypro.com",
    avatar: "https://i.pravatar.cc/150?u=lisa",
    initials: "LJ",
    role: "Member",
    roleBg: "bg-gray-100 text-gray-600",
    department: "Estimating",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "3 days ago",
  },
  {
    id: 5,
    name: "Michael Okon",
    email: "michael.o@quantifypro.com",
    avatar: "",
    initials: "MO",
    role: "Member",
    roleBg: "bg-gray-100 text-gray-600",
    department: "Projects",
    status: "Pending",
    statusColor: "bg-yellow-500",
    lastActive: "Invitation sent",
  },
  {
    id: 6,
    name: "Grace Adeleke",
    email: "grace.a@quantifypro.com",
    avatar: "https://i.pravatar.cc/150?u=grace",
    initials: "GA",
    role: "Viewer",
    roleBg: "bg-purple-100 text-purple-600",
    department: "Finance",
    status: "Active",
    statusColor: "bg-green-500",
    lastActive: "5 hours ago",
  },
];

export default function EnterpriseTeamManagement() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">18</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">25</p>
                <p className="text-xs text-muted-foreground">Total Seats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Invite Bar */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search team members..."
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[150px] bg-white border-border/50">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card className="shadow-sm overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  MEMBER
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  ROLE
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  DEPARTMENT
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  STATUS
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  LAST ACTIVE
                </th>
                <th className="text-center py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} />
                        ) : null}
                        <AvatarFallback className="text-xs font-semibold bg-orange-100 text-orange-600">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant="secondary"
                      className={`border-0 font-medium ${member.roleBg}`}
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-foreground">
                    {member.department}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${member.statusColor}`}
                      />
                      <span className="font-medium text-foreground text-sm">
                        {member.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground text-sm">
                    {member.lastActive}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-orange-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
