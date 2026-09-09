import { toast } from "sonner";
import type { BoqDocument } from "@/types/boqDocument";
import { currencySymbol } from "@/components/projects/boq-document/format";

/**
 * Export the bill as a workbook laid out like the client's own: item number,
 * description, quantity, unit, rate, amount, then the closing sub-total,
 * preliminaries, VAT and total block.
 *
 * exceljs is loaded on demand — it is ~1MB and only ever needed when someone
 * actually presses Export, so it stays out of the page bundle.
 */

const HEADER_FILL = "FFF3F4F6";
const GROUP_FILL = "FFEEF1FB";
const SECTION_FILL = "FFFEF6E7";

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

const safeName = (value: string) =>
  (value || "bill-of-quantities")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .toLowerCase();

export async function exportBoqToExcel(doc: BoqDocument) {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = doc.meta.preparedBy || "QuantifyPro";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Bill of Quantities", {
      views: [{ state: "frozen", ySplit: 6 }],
      pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true },
    });

    sheet.columns = [
      { key: "no", width: 8 },
      { key: "description", width: 68 },
      { key: "quantity", width: 12 },
      { key: "unit", width: 8 },
      { key: "rate", width: 16 },
      { key: "amount", width: 18 },
    ];

    const symbol = currencySymbol(doc.meta.currency);
    const money = `"${symbol}"#,##0.00`;

    // ── Title block ────────────────────────────────────────────────────────
    const title = sheet.addRow([`BILL OF QUANTITIES — ${doc.meta.projectTitle}`]);
    title.font = { bold: true, size: 14 };
    sheet.mergeCells(title.number, 1, title.number, 6);

    for (const [label, value] of [
      ["Client", doc.meta.clientName],
      ["Location", doc.meta.location],
      ["Prepared by", doc.meta.preparedBy],
    ] as const) {
      if (!value) continue;
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { bold: true, size: 9 };
      row.getCell(2).font = { size: 9 };
    }
    sheet.addRow([]);

    // ── Column headings ────────────────────────────────────────────────────
    const head = sheet.addRow(["ITEM", "DESCRIPTION", "QTY", "UNIT", "RATE", "AMOUNT"]);
    head.font = { bold: true, size: 10 };
    head.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
      cell.border = { bottom: { style: "thin" } };
    });
    head.getCell(3).alignment = { horizontal: "right" };
    head.getCell(5).alignment = { horizontal: "right" };
    head.getCell(6).alignment = { horizontal: "right" };

    // ── The bill ───────────────────────────────────────────────────────────
    for (const group of doc.elementGroups) {
      sheet.addRow([]);

      const groupRow = sheet.addRow([
        "",
        `ELEMENT NO. ${group.elementNo}: ${group.title}`,
        "",
        "",
        "",
        group.total || null,
      ]);
      groupRow.font = { bold: true, size: 11 };
      groupRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_FILL } };
      });
      groupRow.getCell(6).numFmt = money;

      for (const section of group.sections) {
        const sectionRow = sheet.addRow([
          "",
          section.sectionCode
            ? `${section.sectionCode}: ${section.title}`
            : section.title,
        ]);
        sectionRow.font = { bold: true, size: 10 };
        sectionRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: SECTION_FILL },
          };
        });

        for (const row of section.rows) {
          const text = [row.descriptionLeadIn, row.description]
            .filter(Boolean)
            .join(" ");

          if (row.rowType !== "item") {
            const noteRow = sheet.addRow(["", text]);
            noteRow.getCell(2).font = {
              italic: row.rowType === "note",
              bold: row.rowType === "header",
              size: 9,
            };
            noteRow.getCell(2).alignment = { wrapText: true, vertical: "top" };
            continue;
          }

          const itemRow = sheet.addRow([
            row.itemCode ?? "",
            text,
            row.quantity ?? null,
            row.unit ?? "",
            row.rate ?? null,
            row.amount ?? null,
          ]);
          itemRow.getCell(2).alignment = { wrapText: true, vertical: "top" };
          itemRow.getCell(3).numFmt = "#,##0.00";
          itemRow.getCell(5).numFmt = money;
          itemRow.getCell(6).numFmt = money;
          itemRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = { bottom: { style: "hair", color: { argb: "FFE5E7EB" } } };
          });
        }

        const totalRow = sheet.addRow([
          "",
          "",
          "",
          "",
          "Section Total",
          section.total || null,
        ]);
        totalRow.getCell(5).font = { bold: true, size: 9 };
        totalRow.getCell(6).font = { bold: true, size: 10 };
        totalRow.getCell(6).numFmt = money;
      }
    }

    // ── Closing summary ────────────────────────────────────────────────────
    sheet.addRow([]);
    const summaryHead = sheet.addRow(["", "SUMMARY"]);
    summaryHead.font = { bold: true, size: 12 };

    for (const entry of doc.summary.entries) {
      const row = sheet.addRow([
        "",
        `Element No. ${entry.elementNo}: ${entry.title}`,
        "",
        "",
        "",
        entry.amount || null,
      ]);
      row.getCell(6).numFmt = money;
    }

    const sub = sheet.addRow(["", "Sub-total", "", "", "", doc.summary.subTotal || null]);
    sub.font = { bold: true };
    sub.getCell(6).numFmt = money;

    for (const adjustment of doc.summary.adjustments) {
      const row = sheet.addRow([
        "",
        adjustment.label,
        "",
        "",
        `${adjustment.percentage}%`,
        adjustment.amount || null,
      ]);
      row.getCell(6).numFmt = money;
    }

    const grand = sheet.addRow([
      "",
      "TOTAL",
      "",
      "",
      "",
      doc.summary.grandTotal || null,
    ]);
    grand.font = { bold: true, size: 12 };
    grand.getCell(6).numFmt = money;
    grand.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { top: { style: "double" } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    download(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${safeName(doc.meta.projectTitle)}-boq.xlsx`,
    );

    toast.success("Workbook exported", {
      description: "Opened as .xlsx with the bill laid out as in your template.",
    });
  } catch (error) {
    toast.error("Could not build the workbook", {
      description:
        error instanceof Error ? error.message : "Try again in a moment.",
    });
  }
}

/**
 * PDF is the browser's own print-to-PDF. The page carries print styles, so the
 * output is the bill without the app chrome — and it needs no extra dependency
 * or a server round trip.
 */
export function exportBoqToPdf() {
  toast.info("Choose “Save as PDF” in the print dialog");
  window.print();
}
