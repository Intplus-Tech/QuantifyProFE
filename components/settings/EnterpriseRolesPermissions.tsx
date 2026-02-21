"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Users,
  Eye,
  Edit,
  Trash2,
  FolderOpen,
  FileText,
  Settings,
  CreditCard,
  UserPlus,
} from "lucide-react";

const roles = [
  {
    id: 1,
    name: "Owner",
    description: "Full access to all features, billing, and team management",
    members: 1,
    color: "bg-primary/10 text-primary border-primary/20",
    isSystem: true,
    permissions: {
      projects: { view: true, create: true, edit: true, delete: true },
      team: { view: true, invite: true, manage: true, remove: true },
      billing: { view: true, manage: true },
      settings: { view: true, manage: true },
      templates: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 2,
    name: "Admin",
    description: "Manage team members, projects, and organization settings",
    members: 3,
    color: "bg-orange-100 text-orange-600 border-orange-200",
    isSystem: true,
    permissions: {
      projects: { view: true, create: true, edit: true, delete: true },
      team: { view: true, invite: true, manage: true, remove: false },
      billing: { view: true, manage: false },
      settings: { view: true, manage: true },
      templates: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 3,
    name: "Manager",
    description: "Create and manage projects, view team information",
    members: 5,
    color: "bg-blue-100 text-blue-600 border-blue-200",
    isSystem: true,
    permissions: {
      projects: { view: true, create: true, edit: true, delete: false },
      team: { view: true, invite: false, manage: false, remove: false },
      billing: { view: false, manage: false },
      settings: { view: true, manage: false },
      templates: { view: true, create: true, edit: true, delete: false },
    },
  },
  {
    id: 4,
    name: "Member",
    description: "Work on assigned projects and create estimates",
    members: 7,
    color: "bg-gray-100 text-gray-600 border-gray-200",
    isSystem: true,
    permissions: {
      projects: { view: true, create: true, edit: true, delete: false },
      team: { view: true, invite: false, manage: false, remove: false },
      billing: { view: false, manage: false },
      settings: { view: false, manage: false },
      templates: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 5,
    name: "Viewer",
    description: "View-only access to projects and reports",
    members: 2,
    color: "bg-purple-100 text-purple-600 border-purple-200",
    isSystem: true,
    permissions: {
      projects: { view: true, create: false, edit: false, delete: false },
      team: { view: false, invite: false, manage: false, remove: false },
      billing: { view: false, manage: false },
      settings: { view: false, manage: false },
      templates: { view: true, create: false, edit: false, delete: false },
    },
  },
];

const permissionCategories = [
  {
    name: "Projects",
    icon: FolderOpen,
    permissions: ["View", "Create", "Edit", "Delete"],
  },
  {
    name: "Team",
    icon: Users,
    permissions: ["View", "Invite", "Manage", "Remove"],
  },
  {
    name: "Billing",
    icon: CreditCard,
    permissions: ["View", "Manage"],
  },
  {
    name: "Settings",
    icon: Settings,
    permissions: ["View", "Manage"],
  },
  {
    name: "Templates",
    icon: FileText,
    permissions: ["View", "Create", "Edit", "Delete"],
  },
];

export default function EnterpriseRolesPermissions() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Roles & Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Define access levels and permissions for your team members
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="shadow-sm border-border/50 overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color.split(" ").slice(0, 1).join(" ")}`}
                  >
                    <Shield
                      className={`w-5 h-5 ${role.color.split(" ").slice(1, 2).join(" ")}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-foreground">
                        {role.name}
                      </CardTitle>
                      {role.isSystem && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium border-border/50 text-muted-foreground"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 border-0 font-medium"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {role.members} members
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-slate-50/80 rounded-lg p-4 border border-border/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground uppercase tracking-wider">
                        Category
                      </th>
                      {["View", "Create", "Edit/Manage", "Delete/Remove"].map(
                        (perm) => (
                          <th
                            key={perm}
                            className="text-center py-2 px-3 font-semibold text-muted-foreground uppercase tracking-wider"
                          >
                            {perm}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(role.permissions).map(
                      ([category, perms]) => {
                        const permValues = Object.values(perms);
                        return (
                          <tr
                            key={category}
                            className="border-t border-border/20"
                          >
                            <td className="py-2.5 px-3 font-medium text-foreground capitalize">
                              {category}
                            </td>
                            {permValues.map((enabled, idx) => (
                              <td key={idx} className="text-center py-2.5 px-3">
                                <Switch
                                  checked={enabled}
                                  disabled
                                  className="data-[state=checked]:bg-primary scale-75"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
