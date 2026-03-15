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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  dateRaw: Date;
  plan: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

const invoices: Invoice[] = [
  { id: "INV-2024-001", date: "Jan 12, 2024", dateRaw: new Date("2024-01-12"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-002", date: "Feb 12, 2024", dateRaw: new Date("2024-02-12"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-003", date: "Mar 12, 2024", dateRaw: new Date("2024-03-12"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-004", date: "Apr 12, 2024", dateRaw: new Date("2024-04-12"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-005", date: "May 12, 2024", dateRaw: new Date("2024-05-12"), plan: "Solo Monthly", amount: 12500, status: "Failed" },
  { id: "INV-2024-006", date: "May 14, 2024", dateRaw: new Date("2024-05-14"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-007", date: "Jun 12, 2024", dateRaw: new Date("2024-06-12"), plan: "Solo Monthly", amount: 12500, status: "Paid" },
  { id: "INV-2024-008", date: "Jul 12, 2024", dateRaw: new Date("2024-07-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
  { id: "INV-2024-009", date: "Aug 12, 2024", dateRaw: new Date("2024-08-12"), plan: "Solo Annual", amount: 125000, status: "Pending" },
  { id: "INV-2024-010", date: "Sep 12, 2024", dateRaw: new Date("2024-09-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
  { id: "INV-2024-011", date: "Oct 12, 2024", dateRaw: new Date("2024-10-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
  { id: "INV-2024-012", date: "Nov 12, 2024", dateRaw: new Date("2024-11-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
  { id: "INV-2024-013", date: "Dec 12, 2024", dateRaw: new Date("2024-12-12"), plan: "Solo Annual", amount: 125000, status: "Pending" },
  { id: "INV-2025-001", date: "Jan 12, 2025", dateRaw: new Date("2025-01-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
  { id: "INV-2025-002", date: "Feb 12, 2025", dateRaw: new Date("2025-02-12"), plan: "Solo Annual", amount: 125000, status: "Paid" },
];

type SortKey = "id" | "dateRaw" | "plan" | "amount" | "status";
type SortDir = "asc" | "desc" | null;

const statusColors: Record<Invoice["status"], string> = {
  Paid: "bg-green-100 text-green-700 hover:bg-green-100 border-0",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0",
  Failed: "bg-red-100 text-red-700 hover:bg-red-100 border-0",
};

const ITEMS_PER_PAGE = 6;

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingModal({ open, onOpenChange }: BillingModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateRaw");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === null) setSortKey("dateRaw");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let rows = [...invoices];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.plan.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        let cmp = 0;
        if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
        else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col || sortDir === null) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  }

  function ColHeader({ label, col }: { label: string; col: SortKey }) {
    return (
      <th
        className="py-3 px-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIcon col={col} />
        </span>
      </th>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">
            Billing History
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and download all your past invoices.
          </p>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 border-b border-border bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice, plan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-background border-border/50 h-9 text-sm"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-36 h-9 bg-background border-border/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <ColHeader label="Invoice" col="id" />
                <ColHeader label="Date" col="dateRaw" />
                <ColHeader label="Plan" col="plan" />
                <ColHeader label="Amount" col="amount" />
                <ColHeader label="Status" col="status" />
                <th className="py-3 px-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No invoices match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs font-medium text-foreground">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{inv.date}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{inv.plan}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ₦{inv.amount.toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`text-xs font-semibold ${statusColors[inv.status]}`}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        disabled={inv.status !== "Paid"}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-background">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} invoices
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => setPage(p)}
                className={`h-8 w-8 p-0 text-xs ${
                  currentPage === p
                    ? "bg-primary/10 text-primary border-primary/30 font-bold"
                    : ""
                }`}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
