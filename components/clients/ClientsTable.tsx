"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
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
} from "lucide-react";
import {
  type Client,
  INDUSTRY_COLORS,
  STATUS_COLORS,
  formatValue,
} from "./mockData";

// Defined outside component — stable reference, no closure over component state
const columns: ColumnDef<Client>[] = [
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
            <p className="font-semibold text-foreground text-sm">{client.name}</p>
            <p className="text-xs text-muted-foreground">{client.company}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "industry",
    header: "INDUSTRY",
    cell: ({ getValue }) => {
      const industry = getValue<Client["industry"]>();
      return (
        <Badge
          variant="secondary"
          className={`border-0 font-medium ${INDUSTRY_COLORS[industry]}`}
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
      const status = getValue<Client["status"]>();
      return (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[status]}`} />
          <span className="font-medium text-foreground text-sm">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "projects",
    header: "PROJECTS",
    cell: ({ getValue }) => (
      <div className="text-center font-medium text-foreground text-sm">
        {getValue<number>()}
      </div>
    ),
  },
  {
    accessorKey: "valueRaw",
    header: "TOTAL BOQ VALUE",
    cell: ({ getValue }) => (
      <div className="text-right font-bold text-foreground text-sm">
        {formatValue(getValue<number>())}
      </div>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    enableSorting: false,
    cell: () => (
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
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
              View Projects
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />;
  if (isSorted === "desc") return <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 inline opacity-40" />;
}

interface ClientsTableProps {
  data: Client[];
}

export function ClientsTable({ data: allData }: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const hasFilters = globalFilter !== "" || industryFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setGlobalFilter("");
    setIndustryFilter("all");
    setStatusFilter("all");
  }

  // Memoized so useReactTable receives a stable reference — only changes when
  // filter values actually change, preventing infinite re-render loops.
  const data = useMemo(
    () =>
      allData.filter((c) => {
        if (industryFilter !== "all" && c.industry !== industryFilter) return false;
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        return true;
      }),
    [allData, industryFilter, statusFilter],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const pageCount = table.getPageCount();

  return (
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
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-primary/5 border-primary/20 text-primary font-medium">
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
              <SelectTrigger className="w-full sm:w-40 bg-primary/5 border-primary/20 text-primary font-medium">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
              <TableRow key={hg.id} className="bg-muted/10 hover:bg-muted/10 border-b border-border/50">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  const id = header.id;

                  return (
                    <TableHead
                      key={id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={[
                        "py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                        id === "actions" || id === "projects" ? "text-center" : "",
                        id === "valueRaw" ? "text-right" : "",
                        canSort ? "cursor-pointer select-none hover:text-foreground transition-colors" : "",
                      ].join(" ")}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIcon isSorted={isSorted} />}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
}
