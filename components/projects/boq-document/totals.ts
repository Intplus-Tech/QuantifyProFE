import type {
  BOQBill,
  BOQDocument,
  BOQItem,
  BOQSubsection,
  SummaryRow,
} from "./types";

export function itemAmount(item: BOQItem): number {
  if (item.qty !== null && item.rate !== null) return item.qty * item.rate;
  return item.lumpSum ?? 0;
}

export function subsectionTotal(subsection: BOQSubsection): number {
  return subsection.items.reduce((sum, item) => sum + itemAmount(item), 0);
}

export function billTotal(bill: BOQBill): number {
  return bill.subsections.reduce((sum, sub) => sum + subsectionTotal(sub), 0);
}

export function summaryRowAmount(row: SummaryRow, bills: BOQBill[]): number {
  if (row.billId) {
    const bill = bills.find((b) => b.id === row.billId);
    if (bill) return billTotal(bill);
  }
  return row.amount ?? 0;
}

export interface DocumentTotals {
  preliminaries: number;
  mainBuilding: number;
  externalWorks: number;
  subTotal: number;
  contingency: number;
  vat: number;
  grandTotal: number;
}

/**
 * Preliminaries (Bill 1) is reported separately on the grand total card, so it
 * is excluded from the main-building sub-total.
 */
export function documentTotals(doc: BOQDocument): DocumentTotals {
  const prelimNo = doc.preliminariesBillNo;

  const preliminaries = prelimNo
    ? doc.summaryRows
        .filter((row) => row.billNo === prelimNo)
        .reduce((sum, row) => sum + summaryRowAmount(row, doc.bills), 0)
    : 0;

  const mainBuilding = doc.summaryRows
    .filter((row) => !prelimNo || row.billNo !== prelimNo)
    .reduce((sum, row) => sum + summaryRowAmount(row, doc.bills), 0);

  const subTotal = mainBuilding + preliminaries + doc.externalWorks;
  const contingency = subTotal * doc.contingencyRate;
  const vat = subTotal * doc.vatRate;

  return {
    preliminaries,
    mainBuilding,
    externalWorks: doc.externalWorks,
    subTotal,
    contingency,
    vat,
    grandTotal: subTotal + contingency + vat,
  };
}

export function findItem(
  doc: BOQDocument,
  itemId: string,
): { bill: BOQBill; subsection: BOQSubsection; item: BOQItem } | null {
  for (const bill of doc.bills) {
    for (const subsection of bill.subsections) {
      const item = subsection.items.find((i) => i.id === itemId);
      if (item) return { bill, subsection, item };
    }
  }
  return null;
}

export function replaceItem(doc: BOQDocument, updated: BOQItem): BOQDocument {
  return {
    ...doc,
    bills: doc.bills.map((bill) => ({
      ...bill,
      subsections: bill.subsections.map((sub) => ({
        ...sub,
        items: sub.items.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      })),
    })),
  };
}

export function deleteItem(doc: BOQDocument, itemId: string): BOQDocument {
  return {
    ...doc,
    bills: doc.bills.map((bill) => ({
      ...bill,
      subsections: bill.subsections.map((sub) => ({
        ...sub,
        items: sub.items.filter((item) => item.id !== itemId),
      })),
    })),
  };
}
