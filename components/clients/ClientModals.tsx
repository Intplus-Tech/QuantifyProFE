"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  FileText,
  AlertTriangle,
  Loader2,
  FolderOpen,
  Search,
  MapPin,
  MoreVertical,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INDUSTRY_COLORS, STATUS_COLORS } from "./mockData";
import { Client } from "@/types/clients";
import { Project } from "@/types/projects";
import {
  useUpdateClientMutation,
  useDeleteClientMutation,
} from "@/store/api/clientsApi";

// ---------------------------------------------------------------------------
// Shared type
// ---------------------------------------------------------------------------

export type UIClient = Client & {
  initials: string;
  avatarBg: string;
  projects?: number;
  valueRaw?: number;
};

// ---------------------------------------------------------------------------
// 1. ViewProfileDialog
// ---------------------------------------------------------------------------

interface ViewProfileDialogProps {
  client: UIClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-primary/10 p-2 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">
          {value || <span className="text-muted-foreground italic">—</span>}
        </p>
      </div>
    </div>
  );
}

export function ViewProfileDialog({
  client,
  open,
  onOpenChange,
}: ViewProfileDialogProps) {
  if (!client) return null;

  const industryColor =
    (INDUSTRY_COLORS as Record<string, string>)[client.industry] ||
    "bg-gray-100 text-gray-700";
  const statusColor =
    (STATUS_COLORS as Record<string, string>)[client.status] ||
    STATUS_COLORS["Active"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg! gap-0 p-0 overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-6 pb-5">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-4">
              <Avatar className={`w-14 h-14 ${client.avatarBg} shrink-0`}>
                <AvatarFallback className="bg-transparent text-lg font-bold">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {client.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                  {client.clientCompanyName}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={`border-0 text-xs font-medium ${industryColor}`}
                  >
                    {client.industry}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`}
                    />
                    <span className="text-xs font-medium text-foreground capitalize">
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Separator />

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileRow icon={Mail} label="Email" value={client.email} />
            <ProfileRow icon={Phone} label="Phone" value={client.phone} />
            <ProfileRow
              icon={Building2}
              label="Company"
              value={client.clientCompanyName}
            />
            <ProfileRow
              icon={Briefcase}
              label="Industry"
              value={client.industry}
            />
          </div>

          {client.notes && (
            <>
              <Separator />
              <ProfileRow icon={FileText} label="Notes" value={client.notes} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// 2. EditClientDialog
// ---------------------------------------------------------------------------

interface EditClientDialogProps {
  client: UIClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_EDIT_FORM = {
  name: "",
  clientCompanyName: "",
  industry: "",
  status: "",
  email: "",
  phone: "",
  notes: "",
};

export function EditClientDialog({
  client,
  open,
  onOpenChange,
}: EditClientDialogProps) {
  const [form, setForm] = useState(EMPTY_EDIT_FORM);
  const [updateClient, { isLoading: isSubmitting }] = useUpdateClientMutation();

  // Sync form whenever the client changes or the dialog opens
  useEffect(() => {
    if (client && open) {
      setForm({
        name: client.name || "",
        clientCompanyName: client.clientCompanyName || "",
        industry: client.industry || "",
        status: client.status || "",
        email: client.email || "",
        phone: client.phone || "",
        notes: client.notes || "",
      });
    }
  }, [client, open]);

  function handleChange(field: keyof typeof EMPTY_EDIT_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setForm(EMPTY_EDIT_FORM);
    onOpenChange(false);
  }

  async function handleSave() {
    if (!client) return;
    try {
      await updateClient({
        clientId: client._id,
        body: {
          name: form.name,
          clientCompanyName: form.clientCompanyName,
          industry: form.industry,
          status: form.status as Client["status"],
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        },
      }).unwrap();
      toast.success("Client updated successfully.", {
        description: `${form.name}'s details have been saved.`,
      });
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update client.");
    }
  }

  if (!client) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-xl! gap-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Edit Client Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the information for{" "}
            <span className="font-medium text-foreground">{client.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-client-name" className="text-sm font-medium">
              Client Name
            </Label>
            <Input
              id="edit-client-name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-muted/30 border-border/60 h-12"
              disabled={isSubmitting}
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-company-name" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="edit-company-name"
              placeholder="e.g. BuildRight Engineering"
              value={form.clientCompanyName}
              onChange={(e) =>
                handleChange("clientCompanyName", e.target.value)
              }
              className="bg-muted/30 border-border/60 h-12"
              disabled={isSubmitting}
            />
          </div>

          {/* Industry + Status side by side */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-sm font-medium">Industry</Label>
              <Select
                value={form.industry}
                onValueChange={(v) => handleChange("industry", v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-muted/30 border-border/60 h-12! py-3 w-full">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Infrastructure",
                    "Residential",
                    "Public Works",
                    "Commercial",
                    "Industrial",
                    "Healthcare",
                  ].map((ind) => (
                    <SelectItem key={ind} value={ind} className="py-2.5">
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleChange("status", v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="bg-muted/30 border-border/60 h-12! py-3 w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="py-2.5">
                    Active
                  </SelectItem>
                  <SelectItem value="pending_review" className="py-2.5">
                    Pending Review
                  </SelectItem>
                  <SelectItem value="inactive" className="py-2.5">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="edit-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-muted/30 border-border/60 h-12"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="edit-phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-muted/30 border-border/60 h-12"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="edit-notes"
              placeholder="Optional notes about the client..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="bg-muted/30 border-border/60 min-h-[80px]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-4"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="h-12 px-5"
            disabled={isSubmitting}
            onClick={handleSave}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// 3. DeleteClientAlertDialog
// ---------------------------------------------------------------------------

interface DeleteClientAlertDialogProps {
  client: UIClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteClientAlertDialog({
  client,
  open,
  onOpenChange,
}: DeleteClientAlertDialogProps) {
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  async function handleConfirm() {
    if (!client) return;
    try {
      await deleteClient(client._id).unwrap();
      toast.success("Client deleted.", {
        description: `${client.name} has been removed.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete client.");
    }
  }

  if (!client) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center text-center gap-4 pb-1">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                Delete Client
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                You are about to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {client.name}
                </span>
                {client.clientCompanyName && (
                  <>
                    {" "}from{" "}
                    <span className="font-semibold text-foreground">
                      {client.clientCompanyName}
                    </span>
                  </>
                )}
                . This action{" "}
                <span className="text-destructive font-medium">
                  cannot be undone
                </span>{" "}
                and will remove all associated records.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:gap-3 pt-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete Client"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// 4. ViewProjectsDialog — project list with search, filter, table + empty state
// ---------------------------------------------------------------------------

// Stage badge colours
const STAGE_COLORS: Record<string, string> = {
  Tendering: "bg-blue-100 text-blue-700",
  Construction: "bg-purple-100 text-purple-700",
  Planning: "bg-amber-100 text-amber-700",
  Handover: "bg-teal-100 text-teal-700",
  Completed: "bg-green-100 text-green-700",
  Draft: "bg-gray-100 text-gray-600",
};

// Project status dot colours
const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500",
  pending: "bg-amber-400",
  completed: "bg-slate-400",
  draft: "bg-gray-400",
};

function formatBoqValue(raw: number | undefined): string {
  if (!raw) return "—";
  return `₦${raw.toLocaleString("en-NG")}`;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  return `${mins}m ago`;
}

interface ViewProjectsDialogProps {
  client: UIClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * TODO (next developer): pass in data from useGetClientProjectsQuery.
   * Example:
   *   const { data } = useGetClientProjectsQuery({ clientId: client._id }, { skip: !client });
   *   <ViewProjectsDialog projects={data?.data} ... />
   */
  projects?: Project[];
}

export function ViewProjectsDialog({
  client,
  open,
  onOpenChange,
  projects = [],
}: ViewProjectsDialogProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      p.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const isEmpty = projects.length === 0;

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! gap-0 p-0 overflow-hidden">
        {/* ── Header ───────────────────────────────────────────── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {client.name}&apos;s Projects
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEmpty
                  ? "No projects linked to this client yet."
                  : `${projects.length} project${projects.length !== 1 ? "s" : ""} found`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Search + filter bar ─────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-4 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-muted/30 border-border/50"
              disabled={isEmpty}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            disabled={isEmpty}
          >
            <SelectTrigger className="w-38 h-10 bg-muted/30 border-border/50 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        <div className="overflow-auto max-h-[460px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/50">
                {[
                  "PROJECT DETAILS",
                  "STAGE",
                  "STATUS",
                  "LAST MODIFIED",
                  "BOQ VALUE",
                  "ACTIONS",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className={[
                      "py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                      h === "BOQ VALUE" ? "text-right" : "",
                      h === "ACTIONS" ? "text-center" : "",
                    ].join(" ")}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isEmpty ? (
                /* ── Empty state ── */
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15">
                        <FolderOpen className="w-8 h-8 text-primary/60" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          No projects yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
                          {client.name} has no projects linked yet. Projects
                          created for this client will appear here.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No projects match the current filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((project) => {
                  const stage = project.boqResult?.projectTitle
                    ? "Completed"
                    : "Draft";
                  const stageColor =
                    STAGE_COLORS[stage] || "bg-gray-100 text-gray-600";
                  const statusKey = project.status?.toLowerCase() || "draft";
                  const statusDot =
                    PROJECT_STATUS_COLORS[statusKey] || "bg-gray-400";

                  return (
                    <TableRow
                      key={project._id}
                      className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Project details */}
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                            <FolderOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground line-clamp-1">
                              {project.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {project.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Stage */}
                      <TableCell className="py-4 px-5">
                        <Badge
                          variant="secondary"
                          className={`border-0 font-medium text-xs ${stageColor}`}
                        >
                          {stage}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`}
                          />
                          <span className="text-sm font-medium capitalize text-foreground">
                            {project.status || "Draft"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Last modified */}
                      <TableCell className="py-4 px-5 text-sm text-muted-foreground whitespace-nowrap">
                        {relativeTime(project.updatedAt)}
                      </TableCell>

                      {/* BOQ value */}
                      <TableCell className="py-4 px-5 text-right font-bold text-sm text-foreground whitespace-nowrap">
                        {formatBoqValue(undefined)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 px-5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between bg-muted/5">
          <p className="text-xs text-muted-foreground">
            {isEmpty
              ? `No projects for ${client.name}`
              : `Showing ${filtered.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-5 text-sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
