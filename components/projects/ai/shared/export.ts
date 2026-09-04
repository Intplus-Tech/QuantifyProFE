import { toast } from "sonner";

export interface ExportSheet {
  name: string;
  /** first row is treated as the header row */
  rows: (string | number | null)[][];
}

const escapeCsv = (cell: string | number | null) => {
  const value = cell === null ? "" : String(cell);
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * TODO: Swap point — the client supplied a fixed BOQ workbook template that
 * exports must match. Once that .xlsx lands, install `exceljs`, load the
 * template as the workbook base, write these sheets into the named ranges and
 * download the result. Until then this emits CSV, which Excel opens natively
 * but carries no template formatting.
 */
export function exportToExcel(sheets: ExportSheet[], filename: string) {
  if (sheets.length === 0) return;

  const body = sheets
    .map((sheet) => {
      const header = sheets.length > 1 ? `${sheet.name}\n` : "";
      return header + sheet.rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    })
    .join("\n\n");

  // BOM so Excel picks up UTF-8 (₦, ³, ²) instead of the system codepage.
  download(
    new Blob(["﻿" + body], { type: "text/csv;charset=utf-8;" }),
    `${filename}.csv`,
  );

  toast.success("Exported", {
    description: "Awaiting the client's workbook template for formatted .xlsx output.",
  });
}

/**
 * TODO: Swap point — uses the browser print dialog (Save as PDF). Replace with
 * a server-rendered PDF once the BOQ template defines page furniture.
 */
export function exportToPdf() {
  window.print();
}
