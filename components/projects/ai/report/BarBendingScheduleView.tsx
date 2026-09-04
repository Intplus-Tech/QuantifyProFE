"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { removeBbsRow, updateBbsRow } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { BAR_MASS_PER_M, bbsRowTotals, fmt, fmtInt } from "../calc";
import { EditableCell, EditableTextCell } from "../shared/EditableCell";
import { exportToExcel, exportToPdf, type ExportSheet } from "../shared/export";
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
import type { BbsGroup } from "../types";

export function BarBendingScheduleView() {
  const dispatch = useDispatch();
  const { bbsGroups, projectMeta } = useSelector((state: RootState) => state.aiFlow);

  // Only one row across the whole schedule is editable at a time.
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

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
          editingRowId={editingRowId}
          onToggleEdit={(rowId) =>
            setEditingRowId((current) => (current === rowId ? null : rowId))
          }
          onDelete={(rowId, label) => {
            if (editingRowId === rowId) setEditingRowId(null);
            dispatch(removeBbsRow({ groupId: group.id, rowId }));
            toast.success(`${label} removed`);
          }}
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
  editingRowId,
  onToggleEdit,
  onDelete,
  onChange,
}: {
  group: BbsGroup;
  defaultOpen: boolean;
  editingRowId: string | null;
  onToggleEdit: (rowId: string) => void;
  onDelete: (rowId: string, label: string) => void;
  onChange: (
    rowId: string,
    changes: Partial<{
      size: number;
      noBars: number;
      cutLength: number;
      shapeCode: string;
    }>,
  ) => void;
}) {
  const subtotal = bbsRowTotals(group.rows);

  return (
    <SectionCard title={group.title} badges={group.tags} defaultOpen={defaultOpen}>
      <table className="w-full min-w-[840px]">
        <thead className={theadCls}>
          <tr>
            <th className={th}>Bar Marks</th>
            <th className={`${th} text-right`}>Size (mm)</th>
            <th className={`${th} text-right`}>No. Bars</th>
            <th className={`${th} text-right`}>Cut Length (m)</th>
            <th className={`${th} text-right`}>Total Length (m)</th>
            <th className={`${th} text-right`}>Weight (kg)</th>
            <th className={`${th} text-right`}>Shape Code</th>
            <th className={`${th} text-center`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => {
            const editing = editingRowId === row.id;
            return (
              <tr
                key={row.id}
                className={`${trCls} ${editing ? "bg-amber-50/40" : ""}`}
              >
                <td className={`${td} font-mono font-medium`}>{row.barMark}</td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.size}
                    editable={editing}
                    dp={0}
                    ariaLabel={`${row.barMark} bar size`}
                    onCommit={(size) => {
                      const next = size ?? 0;
                      if (!BAR_MASS_PER_M[next]) {
                        toast.error(`${next}mm is not a standard bar size`);
                        return;
                      }
                      onChange(row.id, { size: next });
                    }}
                  />
                </td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.noBars}
                    editable={editing}
                    dp={0}
                    ariaLabel={`${row.barMark} number of bars`}
                    onCommit={(noBars) => onChange(row.id, { noBars: noBars ?? 0 })}
                  />
                </td>
                <td className={tdNum}>
                  <EditableCell
                    value={row.cutLength}
                    editable={editing}
                    ariaLabel={`${row.barMark} cut length`}
                    onCommit={(cutLength) =>
                      onChange(row.id, { cutLength: cutLength ?? 0 })
                    }
                  />
                </td>
                <td className={`${tdNum} font-medium`}>
                  {fmt(row.noBars * row.cutLength)}
                </td>
                <td className={tdNum}>{fmt(row.weight)}</td>
                <td className={tdNum}>
                  <EditableTextCell
                    value={row.shapeCode}
                    editable={editing}
                    ariaLabel={`${row.barMark} shape code`}
                    onCommit={(shapeCode) => onChange(row.id, { shapeCode })}
                  />
                </td>
                <td className={`${td} text-center`}>
                  <RowActions
                    editing={editing}
                    label={row.barMark}
                    onToggleEdit={() => onToggleEdit(row.id)}
                    onDelete={() => onDelete(row.id, row.barMark)}
                  />
                </td>
              </tr>
            );
          })}

          <tr className={totalRowCls}>
            <td className={td} colSpan={4}>
              Subtotal ({group.title.replace(" - BBS", "")})
            </td>
            <td className={tdNum}>{fmt(subtotal.totalLength)}</td>
            <td className={`${tdNum} text-amber-600`}>{fmt(subtotal.weight)}</td>
            <td className={tdNum}>--</td>
            <td className={`${td} text-center`}>--</td>
          </tr>
        </tbody>
      </table>
    </SectionCard>
  );
}
