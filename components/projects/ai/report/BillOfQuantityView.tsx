"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBoqItem } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { boqAmount, boqSectionTotals, fmt, fmtInt, fmtNaira } from "../calc";
import { EditableCell } from "../shared/EditableCell";
import { exportToExcel, exportToPdf, type ExportSheet } from "../shared/export";
import {
  ExportButtons,
  SectionCard,
  SummaryTiles,
  td,
  tdNum,
  th,
  theadCls,
  totalRowCls,
  trCls,
} from "../shared/ReportPrimitives";
import { ReportHeading } from "./ReportHeading";
import type { BoqSection } from "../types";

export function BillOfQuantityView() {
  const dispatch = useDispatch();
  const { boqSections, contingencyPct, vatPct, projectMeta } = useSelector(
    (state: RootState) => state.aiFlow,
  );

  const grand = useMemo(() => {
    const all = boqSections.flatMap((s) => s.items);
    const totals = boqSectionTotals(all);
    const contingency = totals.amount * (contingencyPct / 100);
    const vat = totals.amount * (vatPct / 100);

    return {
      ...totals,
      quantities: all.reduce((sum, item) => sum + item.qty, 0),
      contingency,
      vat,
      grandTotal: totals.amount + contingency + vat,
    };
  }, [boqSections, contingencyPct, vatPct]);

  const handleExportExcel = () => {
    const sheets: ExportSheet[] = boqSections.map((section) => ({
      name: section.title,
      rows: [
        [
          section.itemLabel,
          ...(section.descriptorLabel ? [section.descriptorLabel] : []),
          "QTY",
          "UNIT",
          "RATE",
          "AMOUNT",
          "CONCRETE (M3)",
          "REBAR (KG)",
          "FORMWORK (M2)",
          "EXCAVATION (M3)",
        ],
        ...section.items.map((item) => [
          item.label,
          ...(section.descriptorLabel ? [item.descriptor ?? ""] : []),
          item.qty,
          item.unit,
          item.rate ?? 0,
          boqAmount(item),
          item.concrete,
          item.rebar,
          item.formwork,
          item.excavation ?? "",
        ]),
      ],
    }));

    sheets.push({
      name: "SUMMARY",
      rows: [
        ["Total Direct Cost", grand.amount],
        [`Contingency (${contingencyPct}%)`, grand.contingency],
        [`VAT (${vatPct}%)`, grand.vat],
        ["GRAND TOTAL", grand.grandTotal],
      ],
    });

    exportToExcel(sheets, `BOQ-${projectMeta.subject.replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <ReportHeading
        prefix="Bill of Quantities"
        action={
          <ExportButtons onExportPdf={exportToPdf} onExportExcel={handleExportExcel} />
        }
      />

      <SummaryTiles
        title="BOQ Summary"
        tiles={[
          { label: "Total Quantities", value: fmtInt(grand.quantities) },
          { label: "Total Concrete (m³)", value: fmt(grand.concrete) },
          { label: "Total Rebar (Tons)", value: fmt(grand.rebar / 1000) },
          { label: "Total Formwork (m²)", value: fmt(grand.formwork) },
          { label: "Total Excavation (m³)", value: fmt(grand.excavation) },
        ]}
      />

      {boqSections.map((section) => (
        <BoqSectionTable
          key={section.id}
          section={section}
          onChange={(itemId, changes) =>
            dispatch(updateBoqItem({ sectionId: section.id, itemId, changes }))
          }
        />
      ))}

      <section className="rounded-lg border border-[#dbeef1] bg-white px-5 py-4">
        <dl className="ml-auto max-w-sm space-y-1.5">
          <SummaryLine label="Total Direct Cost" value={fmtNaira(grand.amount)} />
          <SummaryLine
            label={`Contingency (${contingencyPct}%)`}
            value={fmtNaira(grand.contingency)}
          />
          <SummaryLine label={`VAT (${vatPct}%)`} value={fmtNaira(grand.vat)} />
          <div className="flex items-baseline justify-between gap-6 border-t border-[#dbeef1] pt-2.5">
            <dt className="font-mono text-[12px] font-bold uppercase tracking-wide text-slate-700">
              Grand Total
            </dt>
            <dd className="font-mono text-xl font-bold tabular-nums text-amber-600">
              {fmtNaira(grand.grandTotal)}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function BoqSectionTable({
  section,
  onChange,
}: {
  section: BoqSection;
  onChange: (
    itemId: string,
    changes: Partial<{
      qty: number;
      rate: number | null;
      concrete: number;
      rebar: number;
      formwork: number;
      excavation: number | null;
    }>,
  ) => void;
}) {
  const totals = boqSectionTotals(section.items);
  const hasDescriptor = Boolean(section.descriptorLabel);

  return (
    <SectionCard title={section.title} count={section.count}>
      <table className="w-full min-w-[900px]">
        <thead className={theadCls}>
          <tr>
            <th className={th}>{section.itemLabel}</th>
            {hasDescriptor && <th className={th}>{section.descriptorLabel}</th>}
            <th className={`${th} text-right`}>Qty</th>
            <th className={th}>Unit</th>
            <th className={`${th} text-right`}>Rate (₦)</th>
            <th className={`${th} text-right`}>Amount (₦)</th>
            <th className={`${th} text-right`}>Concrete (m³)</th>
            <th className={`${th} text-right`}>Rebar (kg)</th>
            <th className={`${th} text-right`}>Formwork (m²)</th>
            <th className={`${th} text-right`}>Excavation (m³)</th>
          </tr>
        </thead>

        <tbody>
          {section.items.map((item) => (
            <tr key={item.id} className={trCls}>
              <td className={`${td} font-medium`}>{item.label}</td>
              {hasDescriptor && <td className={td}>{item.descriptor ?? "—"}</td>}
              <td className={tdNum}>
                <EditableCell
                  value={item.qty}
                  dp={0}
                  ariaLabel={`${item.label} quantity`}
                  onCommit={(qty) => onChange(item.id, { qty: qty ?? 0 })}
                />
              </td>
              <td className={td}>{item.unit}</td>
              <td className={tdNum}>
                <EditableCell
                  value={item.rate}
                  prefix="₦"
                  ariaLabel={`${item.label} rate`}
                  onCommit={(rate) => onChange(item.id, { rate })}
                />
              </td>
              <td className={`${tdNum} font-medium`}>{fmt(boqAmount(item))}</td>
              <td className={tdNum}>
                <EditableCell
                  value={item.concrete}
                  ariaLabel={`${item.label} concrete`}
                  onCommit={(concrete) => onChange(item.id, { concrete: concrete ?? 0 })}
                />
              </td>
              <td className={tdNum}>
                <EditableCell
                  value={item.rebar}
                  ariaLabel={`${item.label} rebar`}
                  onCommit={(rebar) => onChange(item.id, { rebar: rebar ?? 0 })}
                />
              </td>
              <td className={tdNum}>
                <EditableCell
                  value={item.formwork}
                  ariaLabel={`${item.label} formwork`}
                  onCommit={(formwork) => onChange(item.id, { formwork: formwork ?? 0 })}
                />
              </td>
              <td className={tdNum}>
                {item.excavation === null ? (
                  <span className="text-slate-300">—</span>
                ) : (
                  <EditableCell
                    value={item.excavation}
                    ariaLabel={`${item.label} excavation`}
                    onCommit={(excavation) => onChange(item.id, { excavation })}
                  />
                )}
              </td>
            </tr>
          ))}

          <tr className={totalRowCls}>
            <td className={td}>Total</td>
            {hasDescriptor && <td className={td}>—</td>}
            <td className={tdNum}>—</td>
            <td className={td}>—</td>
            <td className={tdNum}>—</td>
            <td className={`${tdNum} text-amber-600`}>{fmt(totals.amount)}</td>
            <td className={tdNum}>{fmt(totals.concrete)}</td>
            <td className={tdNum}>{fmt(totals.rebar)}</td>
            <td className={tdNum}>{fmt(totals.formwork)}</td>
            <td className={tdNum}>{fmt(totals.excavation)}</td>
          </tr>
        </tbody>
      </table>
    </SectionCard>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="font-mono text-[11px] text-slate-500">{label}</dt>
      <dd className="font-mono text-[12px] tabular-nums text-slate-700">{value}</dd>
    </div>
  );
}
