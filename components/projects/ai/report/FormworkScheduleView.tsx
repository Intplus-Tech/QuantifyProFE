"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  removeFormworkBreakdownRow,
  updateFormworkBreakdownRow,
} from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { fmt, fmtInt } from "../calc";
import { EditableCell, EditableTextCell } from "../shared/EditableCell";
import { exportToExcel, exportToPdf } from "../shared/export";
import {
  ExportButtons,
  RowActions,
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

const averageStrikingTime = (values: string[]) => {
  const days = values
    .map((v) => Number.parseFloat(v))
    .filter((n) => Number.isFinite(n));
  if (days.length === 0) return "—";
  const avg = days.reduce((s, d) => s + d, 0) / days.length;
  return `${Number.isInteger(avg) ? avg : avg.toFixed(1)} (Avg)`;
};

export function FormworkScheduleView() {
  const dispatch = useDispatch();
  const { formworkBreakdown, projectMeta } = useSelector(
    (state: RootState) => state.aiFlow,
  );

  // Only one row is editable at a time.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      formworkBreakdown.reduce(
        (acc, row) => {
          acc.area += row.area;
          acc.plywoodSheets += row.plywoodSheets;
          acc.timber += row.timber;
          acc.steelProps += row.steelProps;
          return acc;
        },
        { area: 0, plywoodSheets: 0, timber: 0, steelProps: 0 },
      ),
    [formworkBreakdown],
  );

  const handleExportExcel = () => {
    exportToExcel(
      [
        {
          name: "FORMWORK BREAKDOWN BY ELEMENT",
          rows: [
            ["ELEMENT", "TYPE", "AREA (M2)", "PLYWOOD SHEETS", "TIMBER (M3)", "STEEL PROPS", "STRIKING TIME"],
            ...formworkBreakdown.map((row) => [
              row.element,
              row.type,
              row.area,
              row.plywoodSheets,
              row.timber,
              row.steelProps,
              row.strikingTime,
            ]),
            [
              "TOTAL",
              "",
              totals.area,
              totals.plywoodSheets,
              totals.timber,
              totals.steelProps,
              averageStrikingTime(formworkBreakdown.map((r) => r.strikingTime)),
            ],
          ],
        },
      ],
      `Formwork-Schedule-${projectMeta.subject.replace(/\s+/g, "-")}`,
    );
  };

  return (
    <>
      <ReportHeading
        prefix="Formwork Schedule"
        action={
          <ExportButtons onExportPdf={exportToPdf} onExportExcel={handleExportExcel} />
        }
      />

      <SummaryTiles
        title="Formwork Summary"
        tiles={[
          { label: "Total Area (m²)", value: fmt(totals.area) },
          { label: "Plywood Required", value: fmtInt(totals.plywoodSheets), hint: "sheets" },
          { label: "Timber Required (m³)", value: fmt(totals.timber, 1) },
          { label: "Steel Props", value: fmtInt(totals.steelProps), hint: "Nos." },
        ]}
      />

      <SectionCard title="Formwork Breakdown by Element">
        <table className="w-full min-w-[840px]">
          <thead className={theadCls}>
            <tr>
              <th className={th}>Element</th>
              <th className={th}>Type</th>
              <th className={`${th} text-right`}>Area (m²)</th>
              <th className={`${th} text-right`}>Plywood Sheets</th>
              <th className={`${th} text-right`}>Timber (m³)</th>
              <th className={`${th} text-right`}>Steel Props (Nos.)</th>
              <th className={th}>Striking Time</th>
              <th className={`${th} text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formworkBreakdown.map((row) => {
              const editing = editingRowId === row.id;
              return (
                <tr
                  key={row.id}
                  className={`${trCls} ${editing ? "bg-amber-50/40" : ""}`}
                >
                  <td className={`${td} font-medium`}>
                    <EditableTextCell
                      value={row.element}
                      editable={editing}
                      ariaLabel={`${row.element} element`}
                      onCommit={(element) =>
                        dispatch(
                          updateFormworkBreakdownRow({ id: row.id, changes: { element } }),
                        )
                      }
                    />
                  </td>
                  <td className={td}>
                    <EditableTextCell
                      value={row.type}
                      editable={editing}
                      ariaLabel={`${row.element} type`}
                      onCommit={(type) =>
                        dispatch(updateFormworkBreakdownRow({ id: row.id, changes: { type } }))
                      }
                    />
                  </td>
                  <td className={tdNum}>
                    <EditableCell
                      value={row.area}
                      editable={editing}
                      ariaLabel={`${row.element} area`}
                      onCommit={(area) =>
                        dispatch(
                          updateFormworkBreakdownRow({ id: row.id, changes: { area: area ?? 0 } }),
                        )
                      }
                    />
                  </td>
                  <td className={tdNum}>
                    <EditableCell
                      value={row.plywoodSheets}
                      editable={editing}
                      dp={0}
                      ariaLabel={`${row.element} plywood sheets`}
                      onCommit={(plywoodSheets) =>
                        dispatch(
                          updateFormworkBreakdownRow({
                            id: row.id,
                            changes: { plywoodSheets: plywoodSheets ?? 0 },
                          }),
                        )
                      }
                    />
                  </td>
                  <td className={tdNum}>
                    <EditableCell
                      value={row.timber}
                      editable={editing}
                      dp={1}
                      ariaLabel={`${row.element} timber`}
                      onCommit={(timber) =>
                        dispatch(
                          updateFormworkBreakdownRow({
                            id: row.id,
                            changes: { timber: timber ?? 0 },
                          }),
                        )
                      }
                    />
                  </td>
                  <td className={tdNum}>
                    <EditableCell
                      value={row.steelProps}
                      editable={editing}
                      dp={0}
                      ariaLabel={`${row.element} steel props`}
                      onCommit={(steelProps) =>
                        dispatch(
                          updateFormworkBreakdownRow({
                            id: row.id,
                            changes: { steelProps: steelProps ?? 0 },
                          }),
                        )
                      }
                    />
                  </td>
                  <td className={td}>
                    <EditableTextCell
                      value={row.strikingTime}
                      editable={editing}
                      ariaLabel={`${row.element} striking time`}
                      onCommit={(strikingTime) =>
                        dispatch(
                          updateFormworkBreakdownRow({ id: row.id, changes: { strikingTime } }),
                        )
                      }
                    />
                  </td>
                  <td className={`${td} text-center`}>
                    <RowActions
                      editing={editing}
                      label={row.element}
                      onToggleEdit={() =>
                        setEditingRowId((current) => (current === row.id ? null : row.id))
                      }
                      onDelete={() => {
                        if (editing) setEditingRowId(null);
                        dispatch(removeFormworkBreakdownRow(row.id));
                        toast.success(`${row.element} removed`);
                      }}
                    />
                  </td>
                </tr>
              );
            })}

            <tr className={totalRowCls}>
              <td className={td}>Total</td>
              <td className={td}>--</td>
              <td className={`${tdNum} text-amber-600`}>{fmt(totals.area)}</td>
              <td className={tdNum}>{fmtInt(totals.plywoodSheets)}</td>
              <td className={tdNum}>{fmt(totals.timber, 1)}</td>
              <td className={tdNum}>{fmtInt(totals.steelProps)}</td>
              <td className={td}>
                {averageStrikingTime(formworkBreakdown.map((r) => r.strikingTime))}
              </td>
              <td className={`${td} text-center`}>--</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}
