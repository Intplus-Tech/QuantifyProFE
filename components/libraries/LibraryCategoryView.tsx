"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FilePenLine,
  FileSpreadsheet,
  Plus,
  RefreshCcw,
  Undo2,
  Upload,
} from "lucide-react";
import { allCategoryData, libraryTabCategories } from "./mock-data";

interface LibraryCategoryViewProps {
  categoryId: string;
  basePath: string;
}

interface NewRowFormState {
  id: string;
  particulars: string;
  unit: string;
  rate: string;
  lastUpdated: string;
  price: string;
}

interface LibraryRow {
  id: string;
  particulars: string;
  unit: string;
  rate: string;
  lastUpdated: string;
  price: string;
  isSelected: boolean;
}

const UNIT_OPTIONS = ["SQMT", "CUM", "M", "M2", "M3", "KG", "TON",];

export function LibraryCategoryView({
  categoryId,
  basePath,
}: LibraryCategoryViewProps) {
  const categoryData =
    allCategoryData[categoryId] ?? allCategoryData["default"];

  const activeTab =
    libraryTabCategories.find((tab) => tab.id === categoryId) ??
    libraryTabCategories[0];

  const sectionCode = activeTab.label.split(":")[0] ?? "A";

  const initialRows = useMemo<LibraryRow[]>(
    () =>
      categoryData.items.map((item, index) => {
        const baseRate =
          item.rate ?? item.base ?? item.mat ?? item.mach ?? item.final ?? "0.00";
        return {
          id: `${sectionCode}${index + 1}`,
          particulars: item.title,
          unit: String(item.unit ?? "").toUpperCase(),
          rate: String(baseRate),
          lastUpdated: String(item.lastUpdated ?? "03/2025"),
          price: String(item.final ?? baseRate),
          isSelected: false,
        };
      }),
    [categoryData.items, sectionCode],
  );

  const [rows, setRows] = useState(initialRows);
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [isEditRowDialogOpen, setIsEditRowDialogOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [newRowForm, setNewRowForm] = useState<NewRowFormState>({
    id: "",
    particulars: "",
    unit: "SQMT",
    rate: "0.00",
    lastUpdated: "03/2025",
    price: "0.00",
  });
  const [editRowForm, setEditRowForm] = useState<NewRowFormState>({
    id: "",
    particulars: "",
    unit: "SQMT",
    rate: "0.00",
    lastUpdated: "03/2025",
    price: "0.00",
  });
  const allRowsSelected = rows.length > 0 && rows.every((row) => row.isSelected);
  const selectedRowsCount = rows.filter((row) => row.isSelected).length;

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  function escapeCsvValue(value: string) {
    const escaped = value.replaceAll('"', '""');
    return `"${escaped}"`;
  }

  function triggerCsvDownload(fileName: string, rowsToExport: string[][]) {
    const csvContent = rowsToExport
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportDatabase() {
    const csvRows = [
      ["ID", "Particulars", "Unit", "Rate (N)", "Last Updated", "Price"],
      ...rows.map((row) => [
        row.id,
        row.particulars,
        row.unit,
        row.rate,
        row.lastUpdated,
        row.price,
      ]),
    ];

    const safeCategory = activeTab.label
      .toLowerCase()
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replaceAll(":", "");
    triggerCsvDownload(`library-${safeCategory}.csv`, csvRows);
  }

  function handleDownloadTemplate() {
    const templateRows = [
      ["ID", "Particulars", "Unit", "Rate (N)", "Last Updated", "Price"],
      ["", "", "SQMT", "0.00", "MM/YYYY", "0.00"],
    ];

    triggerCsvDownload("library-template.csv", templateRows);
  }

  function updatePrice(id: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, price: value } : row)),
    );
  }

  function toggleSelection(id: string, checked: boolean) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, isSelected: checked } : row,
      ),
    );
  }

  function toggleSelectAll(checked: boolean) {
    setRows((prev) => prev.map((row) => ({ ...row, isSelected: checked })));
  }

  function getNextRowId() {
    const maxSuffix = rows.reduce((max, row) => {
      const match = row.id.match(new RegExp(`^${sectionCode}(\\d+)$`));
      if (!match) {
        return max;
      }
      const suffix = Number(match[1]);
      return Number.isNaN(suffix) ? max : Math.max(max, suffix);
    }, 0);

    return `${sectionCode}${maxSuffix + 1}`;
  }

  function openAddRowDialog() {
    setNewRowForm({
      id: getNextRowId(),
      particulars: "",
      unit: "SQMT",
      rate: "0.00",
      lastUpdated: "03/2025",
      price: "0.00",
    });
    setIsAddRowDialogOpen(true);
  }

  function updateNewRowForm(field: keyof NewRowFormState, value: string) {
    setNewRowForm((prev) => ({ ...prev, [field]: value }));
  }

  function submitAddRowForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const resolvedId = getNextRowId();

    const particulars = newRowForm.particulars.trim();
    const unit = newRowForm.unit.trim().toUpperCase();
    const rate = newRowForm.rate.trim();
    const lastUpdated = newRowForm.lastUpdated.trim();
    const price = newRowForm.price.trim();

    if (!particulars || !unit || !rate || !lastUpdated || !price) {
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        id: resolvedId,
        particulars,
        unit,
        rate,
        lastUpdated,
        price,
        isSelected: false,
      },
    ]);

    setIsAddRowDialogOpen(false);
  }

  function openEditRowDialog(rowId: string) {
    const rowToEdit = rows.find((row) => row.id === rowId);
    if (!rowToEdit) {
      return;
    }

    setEditingRowId(rowId);
    setEditRowForm({
      id: rowToEdit.id,
      particulars: rowToEdit.particulars,
      unit: rowToEdit.unit,
      rate: rowToEdit.rate,
      lastUpdated: rowToEdit.lastUpdated,
      price: rowToEdit.price,
    });
    setIsEditRowDialogOpen(true);
  }

  function updateEditRowForm(field: keyof NewRowFormState, value: string) {
    setEditRowForm((prev) => ({ ...prev, [field]: value }));
  }

  function closeEditRowDialog() {
    setIsEditRowDialogOpen(false);
    setEditingRowId(null);
  }

  function submitEditRowForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRowId) {
      return;
    }

    const particulars = editRowForm.particulars.trim();
    const unit = editRowForm.unit.trim().toUpperCase();
    const rate = editRowForm.rate.trim();
    const lastUpdated = editRowForm.lastUpdated.trim();
    const price = editRowForm.price.trim();

    if (!particulars || !unit || !rate || !lastUpdated || !price) {
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === editingRowId
          ? {
            ...row,
            particulars,
            unit,
            rate,
            lastUpdated,
            price,
          }
          : row,
      ),
    );

    closeEditRowDialog();
  }

  function deleteSelected() {
    setRows((prev) => prev.filter((row) => !row.isSelected));
  }

  function resetRows() {
    setRows(initialRows);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground md:text-sm">
            A central, project-independent rate library for maintaining default
            prices, and cost build-ups across the whole platform. Only the
            green cells are editable inputs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Rate List
          </Button>
          <Button variant="outline" onClick={handleExportDatabase}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <RefreshCcw className="mr-2 h-4 w-4" />
            New Rate
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-2 text-sm font-semibold text-muted-foreground md:text-base">Quick actions</p>
          <Button
          >
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
          <Button variant="outline" onClick={handleExportDatabase}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Database
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button className="bg-chart-2 text-primary-foreground hover:opacity-90">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Update New Prices
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        {libraryTabCategories.map((tab) => (
          <Link
            key={tab.id}
            href={`${basePath}/${tab.id}`}
            className={`rounded-md border text-sm px-3 py-2 leading-none transition-colors ${tab.id === activeTab.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 md:px-5 md:py-4">
          <h2 className="text-xl font-semibold text-foreground md:text-lg">{activeTab.sectionTitle}</h2>
          <span className="text-xs text-muted-foreground md:text-sm">
            {selectedRowsCount > 0
              ? `${selectedRowsCount} selected / ${rows.length} rows`
              : `${rows.length} rows`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allRowsSelected}
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-primary/30"
                  />
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">ID</th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">Particulars</th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">Unit</th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">Rate (₦)</th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold md:px-5 md:py-3 md:text-base">Last Updated</th>
                <th className="px-4 py-2.5 text-right text-sm font-semibold md:px-5 md:py-3 md:text-base">Price</th>
                <th className="px-4 py-2.5 text-center text-sm font-semibold md:px-5 md:py-3 md:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t border-border ${row.isSelected ? "bg-accent" : "bg-card"}`}
                >
                  <td className="px-4 py-3 md:px-5 md:py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.id}`}
                      checked={row.isSelected}
                      onChange={(event) => toggleSelection(row.id, event.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-4 py-3 text-base text-foreground md:px-5 md:py-4">{row.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground md:px-5 md:py-4 md:text-base">{row.particulars}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground md:px-5 md:py-4 md:text-base">{row.unit}</td>
                  <td className="px-4 py-3 text-sm text-foreground md:px-5 md:py-4 md:text-base">{row.rate}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground md:px-5 md:py-4 md:text-base">{row.lastUpdated}</td>
                  <td className="px-4 py-2.5 md:px-5 md:py-3">
                    <input
                      value={row.price}
                      onChange={(event) => updatePrice(row.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      className="h-10 w-full rounded-md border border-primary/40 bg-primary/10 px-3 text-right text-sm font-semibold text-primary outline-none focus:border-primary md:h-11 md:px-4 md:text-base"
                    />
                  </td>
                  <td className="px-4 py-3 text-center md:px-5 md:py-4">
                    <Button
                      variant="outline"
                      className="h-8 border-border bg-card px-2.5 text-xs"
                      onClick={() => openEditRowDialog(row.id)}
                    >
                      <FilePenLine className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-muted px-4 py-3 md:px-5 md:py-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 border-border bg-card px-3 text-sm md:h-10 md:px-4 md:text-base"
              onClick={openAddRowDialog}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Row
            </Button>
            <Button
              variant="outline"
              className="h-9 border-border bg-card px-3 text-sm md:h-10 md:px-4 md:text-base"
              onClick={deleteSelected}
              disabled={selectedRowsCount === 0}
            >
              Delete Selected
            </Button>
            <Button variant="outline" className="h-9 border-border bg-card px-3 text-sm md:h-10 md:px-4 md:text-base" onClick={resetRows}>
              <Undo2 className="mr-1 h-4 w-4" />
              Reset Row
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isAddRowDialogOpen} onOpenChange={setIsAddRowDialogOpen}>
        <DialogContent className="sm:max-w-lg gap-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add New Library Row</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitAddRowForm} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-row-id">ID</Label>
                <Input
                  id="new-row-id"
                  value={newRowForm.id}
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-row-unit">Unit</Label>
                <Select
                  value={newRowForm.unit}
                  onValueChange={(value) => updateNewRowForm("unit", value)}
                >
                  <SelectTrigger id="new-row-unit" className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((unitOption) => (
                      <SelectItem key={unitOption} value={unitOption}>
                        {unitOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-row-particulars">Particulars</Label>
              <Input
                id="new-row-particulars"
                value={newRowForm.particulars}
                onChange={(event) => updateNewRowForm("particulars", event.target.value)}
                placeholder="Enter work item description"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-row-rate">Rate (N)</Label>
                <Input
                  id="new-row-rate"
                  value={newRowForm.rate}
                  onChange={(event) => updateNewRowForm("rate", event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-row-last-updated">Last Updated</Label>
                <Input
                  id="new-row-last-updated"
                  value={newRowForm.lastUpdated}
                  onChange={(event) => updateNewRowForm("lastUpdated", event.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-row-price">Price</Label>
                <Input
                  id="new-row-price"
                  value={newRowForm.price}
                  onChange={(event) => updateNewRowForm("price", event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRowDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Row</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditRowDialogOpen} onOpenChange={setIsEditRowDialogOpen}>
        <DialogContent className="sm:max-w-lg gap-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Library Row</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitEditRowForm} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-row-id">ID</Label>
                <Input id="edit-row-id" value={editRowForm.id} readOnly disabled />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-row-unit">Unit</Label>
                <Select
                  value={editRowForm.unit}
                  onValueChange={(value) => updateEditRowForm("unit", value)}
                >
                  <SelectTrigger id="edit-row-unit" className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((unitOption) => (
                      <SelectItem key={unitOption} value={unitOption}>
                        {unitOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-row-particulars">Particulars</Label>
              <Input
                id="edit-row-particulars"
                value={editRowForm.particulars}
                onChange={(event) => updateEditRowForm("particulars", event.target.value)}
                placeholder="Enter work item description"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-row-rate">Rate (N)</Label>
                <Input
                  id="edit-row-rate"
                  value={editRowForm.rate}
                  onChange={(event) => updateEditRowForm("rate", event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-row-last-updated">Last Updated</Label>
                <Input
                  id="edit-row-last-updated"
                  value={editRowForm.lastUpdated}
                  onChange={(event) => updateEditRowForm("lastUpdated", event.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-row-price">Price</Label>
                <Input
                  id="edit-row-price"
                  value={editRowForm.price}
                  onChange={(event) => updateEditRowForm("price", event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditRowDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
