"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
  Eye,
  Edit,
  FolderOpen,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { INDUSTRY_COLORS, STATUS_COLORS, formatValue } from "./mockData";
import { Client } from "@/store/slices/clientsSlice";
import { useGetClientsQuery } from "@/store/api/clientsApi";
import { useEffect } from "react";
import {
  ViewProfileDialog,
  EditClientDialog,
  DeleteClientAlertDialog,
  ViewProjectsDialog,
  type UIClient,
} from "./ClientModals";

// ---------------------------------------------------------------------------
// SortIcon helper — no closure over state, stays outside component
// ---------------------------------------------------------------------------

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc")
    return <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />;
  if (isSorted === "desc")
    return <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 inline opacity-40" />;
}

// ---------------------------------------------------------------------------
// ClientsTable
// ---------------------------------------------------------------------------

interface ClientsTableProps {}

export function ClientsTable({}: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ---------- modal state ----------
  const [activeClient, setActiveClient] = useState<UIClient | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  function openView(client: UIClient) {
    setActiveClient(client);
    setViewOpen(true);
  }
  function openEdit(client: UIClient) {
    setActiveClient(client);
    setEditOpen(true);
  }
  function openDelete(client: UIClient) {
    setActiveClient(client);
    setDeleteOpen(true);
  }
  function openProjects() {
    setProjectsOpen(true);
  }
  // ------------------------------------

  const hasFilters =
    globalFilter !== "" || industryFilter !== "all" || statusFilter !== "all";

  const {
    data: clientsRes,
    isLoading,
    isFetching,
  } = useGetClientsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    industry: industryFilter !== "all" ? industryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const allData = clientsRes?.data || [];
  const totalRows = clientsRes?.pagination?.total || 0;
  const pageCount =
    clientsRes?.pagination?.pages || Math.ceil(totalRows / pagination.pageSize);

  function clearFilters() {
    setGlobalFilter("");
    setIndustryFilter("all");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  // Memoized so useReactTable receives a stable reference
  const data = useMemo(
    () =>
      allData.map((c: any) => ({
        ...c,
        initials:
          c.initials || typeof c.name === "string"
            ? c.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "NA",
        avatarBg: c.avatarBg || "bg-blue-100 text-blue-700",
      })),
    [allData],
  );

  // Columns defined inside component so action handlers can close over state
  const columns: ColumnDef<UIClient>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "CLIENT & COMPANY",
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className={`w-9 h-9 ${client.avatarBg}`}>
                <AvatarFallback className="bg-transparent text-xs font-semibold">
                  {client.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {client.clientCompanyName}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "industry",
        header: "INDUSTRY",
        cell: ({ getValue }) => {
          const industry = getValue<string>();
          const colorClass =
            (INDUSTRY_COLORS as Record<string, string>)[industry] ||
            "bg-gray-100 text-gray-700";
          return (
            <Badge
              variant="secondary"
              className={`border-0 font-medium ${colorClass}`}
            >
              {industry}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ getValue }) => {
          const status = getValue<string>() || "active";
          const statusColor =
            (STATUS_COLORS as Record<string, string>)[status] ||
            STATUS_COLORS["Active"];
          return (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
              <span className="font-medium text-foreground text-sm flex capitalize">
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "projects",
        header: "PROJECTS",
        cell: ({ getValue }) => (
          <div className="text-center font-medium text-foreground text-sm">
            {getValue<number>() || 0}
          </div>
        ),
      },
      {
        accessorKey: "valueRaw",
        header: "TOTAL BOQ VALUE",
        cell: ({ getValue }) => (
          <div className="text-right font-bold text-foreground text-sm">
            {formatValue(getValue<number>() || 0)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "ACTIONS",
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => openView(client)}
                  >
                    <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => openEdit(client)}
                  >
                    <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => openProjects()}
                  >
                    <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                    View Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => openDelete(client)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <>
      <div className="space-y-4">
        {/* Search & Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by client or company name..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-muted/30 border-border/50 h-12"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-primary/5 border-primary/20 text-primary font-medium h-12! py-3">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Public Works">Public Works</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-primary/5 border-primary/20 text-primary font-medium h-12! py-3">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-muted/10 hover:bg-muted/10 border-b border-border/50"
                >
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    const id = header.id;

                    return (
                      <TableHead
                        key={id}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={[
                          "py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                          id === "actions" || id === "projects"
                            ? "text-center"
                            : "",
                          id === "valueRaw" ? "text-right" : "",
                          canSort
                            ? "cursor-pointer select-none hover:text-foreground transition-colors"
                            : "",
                        ].join(" ")}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && <SortIcon isSorted={isSorted} />}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="flex justify-center flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm">Loading clients...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-muted-foreground"
                  >
                    No clients match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-6">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
            <p className="text-xs text-muted-foreground">
              {totalRows === 0
                ? "No results"
                : `Showing ${from}–${to} of ${totalRows} clients`}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-background"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              {Array.from({ length: pageCount }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(i)}
                  className={[
                    "h-8 w-8 p-0 text-xs",
                    i === pageIndex
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                      : "bg-background",
                  ].join(" ")}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-background"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Client Action Modals ────────────────────────────────────────────── */}

      <ViewProfileDialog
        client={activeClient}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

    
      <EditClientDialog
        client={activeClient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteClientAlertDialog
        client={activeClient}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <ViewProjectsDialog
        client={activeClient}
        open={projectsOpen}
        onOpenChange={setProjectsOpen}
      />
    </>
  );
}
