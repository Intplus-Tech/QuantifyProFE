"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateConcreteRow,
  updateFormworkMaterialRow,
  updateRebarRow,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import {
  concreteRowTotal,
  fmt,
  formworkRowTotal,
  rebarRowTotal,
  wastageAmount,
  withWastage,
} from "../calc";
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

export function MaterialScheduleView() {
  const dispatch = useDispatch();
  const {
    concreteSchedule,
    rebarSchedule,
    formworkMaterial,
    blindingVolume,
    boqSections,
    projectMeta,
  } = useSelector((state: RootState) => state.aiFlow);

  const totals = useMemo(() => {
    const concrete = concreteSchedule.reduce((s, r) => s + r.qty, 0);
    const concreteWastage = concreteSchedule.reduce(
      (s, r) => s + wastageAmount(r.qty, r.wastagePct),
      0,
    );
    const rebar = rebarSchedule.reduce((s, r) => s + r.qty, 0);
    const rebarWastage = rebarSchedule.reduce(
      (s, r) => s + wastageAmount(r.qty, r.wastagePct),
      0,
    );
    const formwork = formworkMaterial.reduce((s, r) => s + r.area, 0);
    const excavation = boqSections
      .flatMap((s) => s.items)
      .reduce((s, item) => s + (item.excavation ?? 0), 0);

    return {
      concrete,
      concreteWastage,
      concreteTotal: concrete + concreteWastage,
      concreteCost: concreteSchedule.reduce((s, r) => s + concreteRowTotal(r), 0),
      rebar,
      rebarWastage,
      rebarTotal: rebar + rebarWastage,
      rebarCost: rebarSchedule.reduce((s, r) => s + rebarRowTotal(r), 0),
      formwork,
      formworkCost: formworkMaterial.reduce((s, r) => s + formworkRowTotal(r), 0),
      excavation,
    };
  }, [concreteSchedule, rebarSchedule, formworkMaterial, boqSections]);

  const handleExportExcel = () => {
    const sheets: ExportSheet[] = [
      {
        name: "CONCRETE SCHEDULE",
        rows: [
          ["DESCRIPTION", "GRADE", "QTY (M3)", "WASTAGE", "TOTAL (M3)", "UNIT COST", "TOTAL COST"],
          ...concreteSchedule.map((r) => [
            r.description,
            r.grade,
            r.qty,
            wastageAmount(r.qty, r.wastagePct),
            withWastage(r.qty, r.wastagePct),
            r.unitCost ?? 0,
            concreteRowTotal(r),
          ]),
        ],
      },
      {
        name: "REINFORCEMENT SCHEDULE",
        rows: [
          ["BAR SIZE", "QTY (KG)", "WASTAGE", "TOTAL (KG)", "TONS", "UNIT COST", "TOTAL COST"],
          ...rebarSchedule.map((r) => [
            r.barSize,
            r.qty,
            wastageAmount(r.qty, r.wastagePct),
            withWastage(r.qty, r.wastagePct),
            withWastage(r.qty, r.wastagePct) / 1000,
            r.unitCost ?? 0,
            rebarRowTotal(r),
          ]),
        ],
      },
      {
        name: "FORMWORK SCHEDULE",
        rows: [
          ["ELEMENT", "QTY (M3)", "TYPE", "AREA (M2)", "UNIT COST", "TOTAL COST"],
          ...formworkMaterial.map((r) => [
            r.element,
            r.qty,
            r.type,
            r.area,
            r.unitCost ?? 0,
            formworkRowTotal(r),
          ]),
        ],
      },
    ];

    exportToExcel(sheets, `Material-Schedule-${projectMeta.subject.replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <ReportHeading
        prefix="Material Schedule"
        action={
          <ExportButtons onExportPdf={exportToPdf} onExportExcel={handleExportExcel} />
        }
      />

      <SummaryTiles
        title="Material Summary"
        tiles={[
          { label: "Total Concrete", value: fmt(totals.concrete), hint: "m³" },
          { label: "Total Rebar", value: fmt(totals.rebar / 1000), hint: "Tons" },
          { label: "Total Formwork", value: fmt(totals.formwork), hint: "m²" },
          { label: "Total Excavation", value: fmt(totals.excavation), hint: "m³" },
          { label: "Total Blinding", value: fmt(blindingVolume), hint: "m³" },
        ]}
      />

      {/* ── Concrete ────────────────────────────────────────────────── */}
      <SectionCard title="Concrete Schedule">
        <table className="w-full min-w-[760px]">
          <thead className={theadCls}>
            <tr>
              <th className={th}>Description</th>
              <th className={th}>Grade</th>
              <th className={`${th} text-right`}>Qty (m³)</th>
              <th className={`${th} text-right`}>Wastage</th>
              <th className={`${th} text-right`}>Total (m³)</th>
              <th className={`${th} text-right`}>Unit Cost</th>
              <th className={`${th} text-right`}>Total Cost (₦)</th>
            </tr>
          </thead>
          <tbody>
            {concreteSchedule.map((row) => (
              <tr key={row.id} className={trCls}>
                <td className={`${td} font-medium`}>{row.description}</td>
                <td className={td}>{row.grade}</td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.qty}
                    ariaLabel={`${row.description} quantity`}
                    onCommit={(qty) =>
                      dispatch(updateConcreteRow({ id: row.id, changes: { qty: qty ?? 0 } }))
                    }
                  />
                </td>
                <td className={tdNum}>
                  <span className="text-slate-500">
                    {fmt(wastageAmount(row.qty, row.wastagePct))}
                    <span className="ml-1 text-[9px] text-slate-400">
                      ({row.wastagePct}%)
                    </span>
                  </span>
                </td>
                <td className={`${tdNum} font-medium`}>
                  {fmt(withWastage(row.qty, row.wastagePct))}
                </td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.unitCost}
                    prefix="₦"
                    dp={0}
                    ariaLabel={`${row.description} unit cost`}
                    onCommit={(unitCost) =>
                      dispatch(updateConcreteRow({ id: row.id, changes: { unitCost } }))
                    }
                  />
                </td>
                <td className={`${tdNum} font-medium`}>{fmt(concreteRowTotal(row))}</td>
              </tr>
            ))}
            <tr className={totalRowCls}>
              <td className={td}>Total</td>
              <td className={td}>—</td>
              <td className={tdNum}>{fmt(totals.concrete)}</td>
              <td className={tdNum}>{fmt(totals.concreteWastage)}</td>
              <td className={tdNum}>{fmt(totals.concreteTotal)}</td>
              <td className={tdNum}>—</td>
              <td className={`${tdNum} text-amber-600`}>{fmt(totals.concreteCost)}</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>

      {/* ── Reinforcement ───────────────────────────────────────────── */}
      <SectionCard title="Reinforcement Schedule">
        <table className="w-full min-w-[760px]">
          <thead className={theadCls}>
            <tr>
              <th className={th}>Bar Size</th>
              <th className={`${th} text-right`}>Qty (kg)</th>
              <th className={`${th} text-right`}>Wastage</th>
              <th className={`${th} text-right`}>Total (kg)</th>
              <th className={`${th} text-right`}>Tons</th>
              <th className={`${th} text-right`}>Unit Cost</th>
              <th className={`${th} text-right`}>Total Cost (₦)</th>
            </tr>
          </thead>
          <tbody>
            {rebarSchedule.map((row) => (
              <tr key={row.id} className={trCls}>
                <td className={`${td} font-medium`}>{row.barSize}</td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.qty}
                    ariaLabel={`${row.barSize} quantity`}
                    onCommit={(qty) =>
                      dispatch(updateRebarRow({ id: row.id, changes: { qty: qty ?? 0 } }))
                    }
                  />
                </td>
                <td className={tdNum}>
                  <span className="text-slate-500">
                    {fmt(wastageAmount(row.qty, row.wastagePct))}
                    <span className="ml-1 text-[9px] text-slate-400">
                      ({row.wastagePct}%)
                    </span>
                  </span>
                </td>
                <td className={`${tdNum} font-medium`}>
                  {fmt(withWastage(row.qty, row.wastagePct))}
                </td>
                <td className={tdNum}>
                  {fmt(withWastage(row.qty, row.wastagePct) / 1000)}
                </td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.unitCost}
                    prefix="₦"
                    dp={0}
                    ariaLabel={`${row.barSize} unit cost`}
                    onCommit={(unitCost) =>
                      dispatch(updateRebarRow({ id: row.id, changes: { unitCost } }))
                    }
                  />
                </td>
                <td className={`${tdNum} font-medium`}>{fmt(rebarRowTotal(row))}</td>
              </tr>
            ))}
            <tr className={totalRowCls}>
              <td className={td}>Total</td>
              <td className={tdNum}>{fmt(totals.rebar)}</td>
              <td className={tdNum}>{fmt(totals.rebarWastage)}</td>
              <td className={tdNum}>{fmt(totals.rebarTotal)}</td>
              <td className={tdNum}>{fmt(totals.rebarTotal / 1000)}</td>
              <td className={tdNum}>—</td>
              <td className={`${tdNum} text-amber-600`}>{fmt(totals.rebarCost)}</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>

      {/* ── Formwork ────────────────────────────────────────────────── */}
      <SectionCard title="Formwork Schedule">
        <table className="w-full min-w-[700px]">
          <thead className={theadCls}>
            <tr>
              <th className={th}>Element</th>
              <th className={`${th} text-right`}>Qty (m³)</th>
              <th className={th}>Type</th>
              <th className={`${th} text-right`}>Area (m²)</th>
              <th className={`${th} text-right`}>Unit Cost</th>
              <th className={`${th} text-right`}>Total Cost (₦)</th>
            </tr>
          </thead>
          <tbody>
            {formworkMaterial.map((row) => (
              <tr key={row.id} className={trCls}>
                <td className={`${td} font-medium`}>{row.element}</td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.qty}
                    ariaLabel={`${row.element} quantity`}
                    onCommit={(qty) =>
                      dispatch(
                        updateFormworkMaterialRow({ id: row.id, changes: { qty: qty ?? 0 } }),
                      )
                    }
                  />
                </td>
                <td className={td}>{row.type}</td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.area}
                    ariaLabel={`${row.element} area`}
                    onCommit={(area) =>
                      dispatch(
                        updateFormworkMaterialRow({ id: row.id, changes: { area: area ?? 0 } }),
                      )
                    }
                  />
                </td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.unitCost}
                    prefix="₦"
                    dp={0}
                    ariaLabel={`${row.element} unit cost`}
                    onCommit={(unitCost) =>
                      dispatch(updateFormworkMaterialRow({ id: row.id, changes: { unitCost } }))
                    }
                  />
                </td>
                <td className={`${tdNum} font-medium`}>{fmt(formworkRowTotal(row))}</td>
              </tr>
            ))}
            <tr className={totalRowCls}>
              <td className={td}>Total</td>
              <td className={tdNum}>
                {fmt(formworkMaterial.reduce((s, r) => s + r.qty, 0))}
              </td>
              <td className={td}>—</td>
              <td className={tdNum}>{fmt(totals.formwork)}</td>
              <td className={tdNum}>—</td>
              <td className={`${tdNum} text-amber-600`}>{fmt(totals.formworkCost)}</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}
