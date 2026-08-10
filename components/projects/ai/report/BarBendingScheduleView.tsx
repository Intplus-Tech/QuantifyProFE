"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBbsRow } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { BAR_MASS_PER_M, bbsRowTotals, fmt, fmtInt } from "../calc";
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
import type { BbsGroup } from "../types";

export function BarBendingScheduleView() {
  const dispatch = useDispatch();
  const { bbsGroups, projectMeta } = useSelector((state: RootState) => state.aiFlow);

  const totals = useMemo(
    () => bbsRowTotals(bbsGroups.flatMap((g) => g.rows)),
    [bbsGroups],
  );

  const handleExportExcel = () => {
    const sheets: ExportSheet[] = bbsGroups.map((group) => ({
      name: group.title,
      rows: [
        ["BAR MARKS", "SIZE (MM)", "NO. BARS", "CUT LENGTH (M)", "TOTAL LENGTH (M)", "WEIGHT (KG)", "SHAPE CODE"],
        ...group.rows.map((row) => [
          row.barMark,
          row.size,
          row.noBars,
          row.cutLength,
          row.noBars * row.cutLength,
          row.weight,
          row.shapeCode,
        ]),
      ],
    }));

    exportToExcel(sheets, `BBS-${projectMeta.subject.replace(/\s+/g, "-")}`);
  };

  return (
    <>
      <ReportHeading
        prefix="Bar Bending Schedule"
        action={
          <ExportButtons onExportPdf={exportToPdf} onExportExcel={handleExportExcel} />
        }
      />

      <SummaryTiles
        title="BBS Summary"
        tiles={[
          { label: "Total Bars", value: fmtInt(totals.bars) },
          { label: "Total Length (m)", value: fmt(totals.totalLength, 1) },
          { label: "Total Weight (kg)", value: fmtInt(totals.weight) },
          { label: "Tons", value: fmt(totals.weight / 1000) },
        ]}
      />

      {bbsGroups.map((group, index) => (
        <BbsGroupTable
          key={group.id}
          group={group}
          defaultOpen={index === 0}
          onChange={(rowId, changes) =>
            dispatch(updateBbsRow({ groupId: group.id, rowId, changes }))
          }
        />
      ))}
    </>
  );
}

function BbsGroupTable({
  group,
  defaultOpen,
  onChange,
}: {
  group: BbsGroup;
  defaultOpen: boolean;
  onChange: (
    rowId: string,
    changes: Partial<{ size: number; noBars: number; cutLength: number }>,
  ) => void;
}) {
  const subtotal = bbsRowTotals(group.rows);

  return (
    <SectionCard title={group.title} badges={group.tags} defaultOpen={defaultOpen}>
      <table className="w-full min-w-[760px]">
        <thead className={theadCls}>
          <tr>
            <th className={th}>Bar Marks</th>
            <th className={`${th} text-right`}>Size (mm)</th>
            <th className={`${th} text-right`}>No. Bars</th>
            <th className={`${th} text-right`}>Cut Length (m)</th>
            <th className={`${th} text-right`}>Total Length (m)</th>
            <th className={`${th} text-right`}>Weight (kg)</th>
            <th className={`${th} text-right`}>Shape Code</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr key={row.id} className={trCls}>
              <td className={`${td} font-mono font-medium`}>{row.barMark}</td>
              <td className={tdNum}>
                <EditableCell
                  value={row.size}
                  dp={0}
                  ariaLabel={`${row.barMark} bar size`}
                  onCommit={(size) => {
                    const next = size ?? 0;
                    if (!BAR_MASS_PER_M[next]) return;
                    onChange(row.id, { size: next });
                  }}
                />
              </td>
              <td className={tdNum}>
                <EditableCell
                  value={row.noBars}
                  dp={0}
                  ariaLabel={`${row.barMark} number of bars`}
                  onCommit={(noBars) => onChange(row.id, { noBars: noBars ?? 0 })}
                />
              </td>
              <td className={tdNum}>
                <EditableCell
                  value={row.cutLength}
                  ariaLabel={`${row.barMark} cut length`}
                  onCommit={(cutLength) => onChange(row.id, { cutLength: cutLength ?? 0 })}
                />
              </td>
              <td className={`${tdNum} font-medium`}>
                {fmt(row.noBars * row.cutLength)}
              </td>
              <td className={tdNum}>{fmt(row.weight)}</td>
              <td className={tdNum}>{row.shapeCode}</td>
            </tr>
          ))}

          <tr className={totalRowCls}>
            <td className={td} colSpan={4}>
              Subtotal ({group.title.replace(" - BBS", "")})
            </td>
            <td className={tdNum}>{fmt(subtotal.totalLength)}</td>
            <td className={`${tdNum} text-amber-600`}>{fmt(subtotal.weight)}</td>
            <td className={tdNum}>—</td>
          </tr>
        </tbody>
      </table>
    </SectionCard>
  );
}
