"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Check } from "lucide-react";

interface RolePermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Role = "admin" | "lead_surveyor" | "member";

interface PermissionRow {
  id: string;
  name: string;
  desc: string;
}

interface PermissionCategory {
  title: string;
  items: PermissionRow[];
}

const PERMISSION_DATA: PermissionCategory[] = [
  {
    title: "PROJECT MANAGEMENT",
    items: [
      {
        id: "create_delete_projects",
        name: "Create & Delete Projects",
        desc: "Allow users to initiate or remove entire workspace projects.",
      },
      {
        id: "edit_project_details",
        name: "Edit Project Details",
        desc: "Modify metadata, dates, and names of active projects.",
      },
    ],
  },
  {
    title: "FINANCIAL RECORDS",
    items: [
      {
        id: "view_invoices_billing",
        name: "View Invoices & Billing",
        desc: "Access financial summaries and enterprise billing settings.",
      },
      {
        id: "export_budget_reports",
        name: "Export Budget Reports",
        desc: "Download Excel and PDF versions of project budget audits.",
      },
    ],
  },
  {
    title: "TEAM MANAGEMENT",
    items: [
      {
        id: "invite_new_members",
        name: "Invite New Members",
        desc: "Add external contractors or new staff to the enterprise account.",
      },
      {
        id: "manage_role_permissions",
        name: "Manage Role Permissions",
        desc: "Grant or revoke access rights for existing team roles.",
      },
    ],
  },
];

const INITIAL_STATE: Record<string, Record<Role, boolean>> = {
  create_delete_projects: { admin: true, lead_surveyor: true, member: false },
  edit_project_details: { admin: true, lead_surveyor: true, member: true },
  view_invoices_billing: { admin: true, lead_surveyor: true, member: false },
  export_budget_reports: { admin: true, lead_surveyor: true, member: false },
  invite_new_members: { admin: true, lead_surveyor: false, member: false },
  manage_role_permissions: { admin: true, lead_surveyor: false, member: false },
};

export function RolePermissionsModal({
  open,
  onOpenChange,
}: RolePermissionsModalProps) {
  const [permissions, setPermissions] = useState(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (itemId: string, role: Role) => {
    setPermissions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [role]: !prev[itemId][role],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success("Role permissions updated successfully.");
    onOpenChange(false);
  };

  const handleDiscard = () => {
    setPermissions(INITIAL_STATE);
    onOpenChange(false);
  };

  const CustomCheckbox = ({
    checked,
    onChange,
    colorClass = "bg-[#F59E0B]",
  }: {
    checked: boolean;
    onChange: () => void;
    colorClass?: string;
  }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
          checked
            ? `${colorClass} border-transparent`
            : "border-slate-300 bg-transparent hover:border-slate-400"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white stroke-3" />}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! p-0 gap-0 overflow-hidden rounded-xl border-border/50">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Role Permissions
            </DialogTitle>
            <p className="text-base text-slate-500">
              Define what each team role can access and perform within your
              workspace.
            </p>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-8 py-2">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="text-left py-4 font-bold text-slate-400 text-[11px] uppercase tracking-wider w-1/2">
                  PERMISSION CAPABILITIES
                </th>
                <th className="text-center py-4">
                  <div className="inline-flex px-3 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                    ADMIN
                  </div>
                </th>
                <th className="text-center py-4">
                  <div className="inline-flex px-3 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
                    LEAD SURVEYOR
                  </div>
                </th>
                <th className="text-center py-4">
                  <div className="inline-flex px-3 py-1 rounded-md bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                    MEMBER
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {PERMISSION_DATA.map((category) => (
                <React.Fragment key={category.title}>
                  <tr>
                    <td colSpan={4} className="pt-6 pb-2">
                      <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                        {category.title}
                      </span>
                    </td>
                  </tr>
                  {category.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 pr-6">
                        <div className="space-y-1">
                          <p className="text-[15px] font-semibold text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-[13px] text-slate-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center">
                          <CustomCheckbox
                            checked={permissions[item.id].admin}
                            onChange={() => togglePermission(item.id, "admin")}
                          />
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center">
                          <CustomCheckbox
                            checked={permissions[item.id].lead_surveyor}
                            onChange={() =>
                              togglePermission(item.id, "lead_surveyor")
                            }
                          />
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex justify-center">
                          <CustomCheckbox
                            checked={permissions[item.id].member}
                            onChange={() => togglePermission(item.id, "member")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 border-t border-border/50 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-500">
            <Info className="w-4 h-4 shrink-0" />
            <p className="text-[13px]">
              "Owner" role permissions are fixed and cannot be modified for
              security reasons.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="h-11 px-6 font-semibold text-slate-600 border-slate-300 hover:bg-slate-100"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 px-6 font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] shadow-sm rounded-lg"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
