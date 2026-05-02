"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  updateTabRows,
  updateBendingSummaries,
} from "@/store/slices/takeoffSlice";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { useUpsertTakeoffElementsMutation } from "@/store/api/manualProjectApi";
import {
  Loader2,
  PenTool,
  Plus,
  Calculator,
  Trash2,
  Book,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTakeoffConfig } from "./configs";
import {
  buildElementsPayload,
  buildElementsWithReinforcement,
  extractReinfRowsMap,
} from "./utils/takeoffPayloadBuilder";
import type { TakeoffTab, TakeoffSubTab, TakeoffColumn } from "./configs";

function BendingSummaryRow({ summary }: { summary: Record<string, string> }) {
  const calculateTotal = (isTons = false) => {
    const sum = ["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].reduce(
      (acc, key) => {
        const val = parseFloat(summary[key]?.replace(/,/g, "") || "0");
        return acc + (isNaN(val) ? 0 : val);
      },
      0,
    );
    return isTons
      ? (sum / 1000).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : sum.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-slate-500 bg-slate-50/80 uppercase tracking-wider">
            <tr>
              {["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].map((y) => (
                <th key={y} className="px-4 py-3 font-semibold">
                  {y}
                </th>
              ))}
              <th className="px-4 py-3 font-bold text-white bg-green-500 whitespace-nowrap">
                TOTAL (kg)
              </th>
              <th className="px-4 py-3 font-bold text-white bg-green-500 whitespace-nowrap">
                TOTAL (tons)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/40 transition-colors font-medium">
              {["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].map((y) => (
                <td key={y} className="px-4 py-4 text-slate-700">
                  {summary[y] || "0"}
                </td>
              ))}
              <td className="px-4 py-4 font-bold text-slate-800">
                {calculateTotal()}
              </td>
              <td className="px-4 py-4 font-bold text-slate-800">
                {calculateTotal(true)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Modal for entering bending schedule weights (Y6-Y25).
 */
function BendingScheduleModal({
  isOpen,
  onClose,
  formData,
  onUpdateField,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: Record<string, string>;
  onUpdateField: (key: string, value: string) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
              <PenTool className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Enter Bending Schedule Summary
              </h3>
              <p className="text-xs text-slate-500">Enter measurements only.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 bg-green-50/30">
          <div className="space-y-3 bg-white p-6 rounded-lg border border-green-100/50">
            {["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].map((yKey) => (
              <div key={yKey} className="flex items-center gap-4">
                <label className="w-16 font-bold text-sm text-slate-800">
                  {yKey}
                </label>
                <Input
                  className="flex-1 bg-green-50/30 border-green-200 focus-visible:ring-green-500 text-slate-800 h-10"
                  value={formData[yKey] || ""}
                  onChange={(e) => onUpdateField(yKey, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm border-0"
          >
            Save Summary
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable table component for takeoff data entry.
 */
function TakeoffDataTable({
  rows,
  columns,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  isSingleTable = false,
  customPrefix,
  showBendingButton = false,
}: {
  rows: any[];
  columns: TakeoffColumn[];
  onUpdateRow: (
    idx: number,
    key: string,
    value: string,
    fallbackId: string,
  ) => void;
  onAddRow?: () => void;
  onDeleteRow?: (idx: number) => void;
  isSingleTable?: boolean;
  customPrefix?: string;
  showBendingButton?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-slate-500 bg-slate-50/80 uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold whitespace-nowrap ${col.highlight ? "bg-green-50/50 text-green-700" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.highlight && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shrink-0" />
                    )}
                  </div>
                </th>
              ))}
              {!isSingleTable && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => {
              const highlightCols = columns.filter((c) => c.highlight) || [];
              const isCompleted =
                highlightCols.length > 0 &&
                highlightCols.every((c) => {
                  if (c.multiInput) {
                    return [0, 1, 2, 3].every((i) => {
                      const v = row[`${c.key}_${i}`];
                      return v !== undefined && v !== "" && v !== null;
                    });
                  }
                  const val = row[c.key];
                  return val !== undefined && val !== "" && val !== null;
                });

              return (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  {columns.map((col) => {
                    const cellBg = col.highlight
                      ? isCompleted
                        ? "bg-green-50/50"
                        : "bg-orange-50/30"
                      : "";
                    const textClass =
                      col.highlight && isCompleted ? "text-green-700" : "";

                    if (col.multiInput) {
                      const subVals = [0, 1, 2, 3].map(
                        (i) => row[`${col.key}_${i}`] || "",
                      );
                      const allFilled = subVals.every((v) => v !== "");
                      return (
                        <td
                          key={col.key}
                          className={`px-2 py-3 whitespace-nowrap min-w-[180px] transition-colors ${cellBg}`}
                        >
                          {allFilled ? (
                            <span
                              className={`text-xs font-medium ${textClass || "text-slate-700"}`}
                            >
                              {subVals.join(" - ")}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              {[0, 1, 2, 3].map((i) => (
                                <input
                                  key={i}
                                  type="text"
                                  className="w-10 h-9 text-xs text-center rounded border border-amber-400 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400 transition-colors"
                                  value={row[`${col.key}_${i}`] || ""}
                                  onChange={(e) =>
                                    onUpdateRow(
                                      idx,
                                      `${col.key}_${i}`,
                                      e.target.value,
                                      row.id,
                                    )
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    }

                    const value = row[col.key] || "";
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 whitespace-nowrap min-w-[120px] transition-colors ${cellBg}`}
                      >
                        {col.readonly ||
                        (col.key === "id" && col.readonly !== false) ? (
                          <span
                            className={`text-xs font-semibold ${textClass || "text-slate-800"}`}
                          >
                            {value}
                          </span>
                        ) : col.type === "select" ? (
                          <select
                            className={`h-9 text-xs w-full transition-colors rounded-md px-2 border outline-none ${!value ? "border-amber-400 bg-white" : `border-transparent bg-transparent hover:border-slate-200 font-medium ${textClass || "text-slate-700"}`}`}
                            value={value}
                            onChange={(e) =>
                              onUpdateRow(idx, col.key, e.target.value, row.id)
                            }
                          >
                            {!value && <option value=""></option>}
                            {col.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            className={`h-9 text-xs w-full transition-colors ${!value ? "border-amber-400 bg-white" : `border-transparent bg-transparent hover:border-slate-200 font-medium ${textClass || "text-slate-700"}`}`}
                            value={value}
                            onChange={(e) =>
                              onUpdateRow(idx, col.key, e.target.value, row.id)
                            }
                            placeholder="---"
                          />
                        )}
                      </td>
                    );
                  })}
                  {!isSingleTable && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-slate-400 ${rows.length <= 1 ? "opacity-30 cursor-not-allowed" : "hover:text-red-600 hover:bg-red-50"}`}
                        onClick={() => rows.length > 1 && onDeleteRow?.(idx)}
                        disabled={rows.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 bg-white border-t border-slate-100">
        {!isSingleTable && onAddRow && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddRow}
            className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Row
          </Button>
        )}
        {!showBendingButton && (
          <Button
            variant="outline"
            size="sm"
            className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9"
          >
            <Calculator className="w-4 h-4 mr-2" /> Preview Calculations
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main View Component ─────────────────────────────────────────────────────

interface TakeoffItemViewProps {
  projectId: string;
  basePath: string;
  section: string;
  item: string;
}

export function TakeoffItemView({
  projectId,
  basePath,
  section,
  item,
}: TakeoffItemViewProps) {
  const dispatch = useDispatch();
  const { isLoading } = useGetProjectByIdQuery(projectId);
  const [upsertTakeoffElements, { isLoading: isSaving }] = useUpsertTakeoffElementsMutation();

  // Redux state
  const stateKey = `${projectId}-${section}-${item}`;
  const takeoffData = useSelector(
    (state: RootState) => state.takeoff.data[stateKey],
  );
  const tabRows = takeoffData?.tabRows || {};
  const bendingSummaries = takeoffData?.bendingSummaries || {};

  // Config & Local Navigation
  const config = getTakeoffConfig(section, item);
  const [activeTab, setActiveTab] = useState(config?.tabs[0].id || "");
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>(
    {},
  );

  // Bending Modal Local State
  const [isBendingModalOpen, setIsBendingModalOpen] = useState(false);
  const [bendingFormData, setBendingFormData] = useState<
    Record<string, string>
  >({
    Y6: "",
    Y8: "",
    Y10: "",
    Y12: "",
    Y16: "",
    Y20: "",
    Y25: "",
  });

  // Initialization Logic
  useEffect(() => {
    if (config && Object.keys(tabRows).length === 0) {
      const initialRows: Record<string, any[]> = {};
      const initialSubTabs: Record<string, string> = {};

      config.tabs.forEach((tab) => {
        if (tab.subTabs?.length) {
          initialSubTabs[tab.id] = tab.subTabs[0].id;
          tab.subTabs.forEach((sub) => {
            if (sub.subTabs?.length) {
              initialSubTabs[`${tab.id}-${sub.id}`] = sub.subTabs[0].id;
              sub.subTabs.forEach((ss) => {
                const key = `${tab.id}-${sub.id}-${ss.id}`;
                if (ss.tables)
                  ss.tables.forEach(
                    (t) => (initialRows[`${key}-${t.id}`] = [...t.defaultRows]),
                  );
                else if (ss.defaultRows) initialRows[key] = [...ss.defaultRows];
              });
            } else if (sub.tables)
              sub.tables.forEach(
                (t) =>
                  (initialRows[`${tab.id}-${sub.id}-${t.id}`] = [
                    ...t.defaultRows,
                  ]),
              );
            else if (sub.defaultRows)
              initialRows[`${tab.id}-${sub.id}`] = [...sub.defaultRows];
          });
        } else if (tab.defaultRows) initialRows[tab.id] = [...tab.defaultRows];
      });

      dispatch(
        updateTabRows({ projectId, section, item, tabRows: initialRows }),
      );
      setActiveSubTabs(initialSubTabs);
    }
  }, [section, item, projectId, dispatch, config]);

  // Derived state for current view
  const activeTabData = config?.tabs.find((t) => t.id === activeTab);
  const hasSubTabs = !!activeTabData?.subTabs?.length;
  const currentSubTabId =
    activeSubTabs[activeTab] ||
    (hasSubTabs ? activeTabData?.subTabs?.[0].id : "");
  const currentSubTabData = hasSubTabs
    ? activeTabData?.subTabs?.find((s) => s.id === currentSubTabId)
    : null;

  const hasSubSubTabs = !!currentSubTabData?.subTabs?.length;
  const currentSubSubTabId =
    activeSubTabs[`${activeTab}-${currentSubTabId}`] ||
    (hasSubSubTabs ? currentSubTabData?.subTabs?.[0].id : "");
  const currentSubSubTabData = hasSubSubTabs
    ? currentSubTabData?.subTabs?.find((s) => s.id === currentSubSubTabId)
    : null;

  const tableData = hasSubSubTabs
    ? currentSubSubTabData
    : hasSubTabs
      ? currentSubTabData
      : activeTabData;

  let rowKey = activeTab;
  if (hasSubTabs) rowKey = `${activeTab}-${currentSubTabId}`;
  if (hasSubSubTabs)
    rowKey = `${activeTab}-${currentSubTabId}-${currentSubSubTabId}`;

  const currentRows = tabRows[rowKey] || [];

  // Row Sync logic
  useEffect(() => {
    if (tableData?.groupedBy && tableData?.singleTable) {
      const sourceKey = hasSubSubTabs
        ? `${activeTab}-${currentSubTabId}-${tableData.groupedBy}`
        : `${activeTab}-${tableData.groupedBy}`;
      const sourceRows = tabRows[sourceKey] || [];
      const rows = tabRows[rowKey] || [];

      if (
        sourceRows.length !== rows.length ||
        sourceRows.some((sr, i) => sr.id !== rows[i]?.id)
      ) {
        const newRows = sourceRows.map((sr) => ({
          ...(rows.find((cr) => cr.id === sr.id) || {}),
          id: sr.id,
        }));
        dispatch(
          updateTabRows({
            projectId,
            section,
            item,
            tabRows: { ...tabRows, [rowKey]: newRows },
          }),
        );
      }
    }
  }, [
    tableData,
    activeTab,
    currentSubTabId,
    hasSubSubTabs,
    tabRows,
    rowKey,
    projectId,
    section,
    item,
    dispatch,
  ]);

  // Handlers
  const handleUpdateRow = (
    tId: string,
    idx: number,
    key: string,
    val: string,
    fallbackId: string,
  ) => {
    const rows = [...(tabRows[tId] || [])];
    rows[idx] = { ...(rows[idx] || { id: fallbackId }), [key]: val };
    dispatch(
      updateTabRows({
        projectId,
        section,
        item,
        tabRows: { ...tabRows, [tId]: rows },
      }),
    );
  };

  const handleAddRow = (tId: string, prefix?: string) => {
    const rows = [...(tabRows[tId] || [])];
    const p = prefix || rows[0]?.id?.replace(/[0-9]/g, "") || "ROW";
    rows.push({ id: `${p}${rows.length + 1}` });
    dispatch(
      updateTabRows({
        projectId,
        section,
        item,
        tabRows: { ...tabRows, [tId]: rows },
      }),
    );
  };

  const handleDeleteRow = (tId: string, idx: number) => {
    const rows = [...(tabRows[tId] || [])];
    rows.splice(idx, 1);
    dispatch(
      updateTabRows({
        projectId,
        section,
        item,
        tabRows: { ...tabRows, [tId]: rows },
      }),
    );
  };

  const handleSaveWorkspace = useCallback(() => {
    if (!config) return;
    const batches: {
      endpoint: string;
      elementType: string;
      payload: unknown;
    }[] = [];

    for (const tab of config.tabs) {
      if (tab.subTabs?.length) {
        for (const subTab of tab.subTabs) {
          if (subTab.subTabs?.length) {
            for (const ss of subTab.subTabs) {
              const key = `${tab.id}-${subTab.id}-${ss.id}`;
                if (ss.tables?.length) {
                  for (const t of ss.tables) {
                    if (!t.elementType) continue;
                    const rows = tabRows[`${key}-${t.id}`] || [];
                    if (rows.length)
                      batches.push({
                        endpoint: `PUT /takeoff/${projectId}/elements/${t.elementType}`,
                        elementType: t.elementType,
                        payload: buildElementsPayload(rows),
                      });
                  }
                } else if (ss.groupedBy) {
                  if (!ss.elementType) continue;
                  const concreteSS = subTab.subTabs.find(
                    (s) => s.id === ss.groupedBy,
                  );
                  if (!concreteSS?.elementType) continue;
                  const concreteRows =
                    tabRows[`${tab.id}-${subTab.id}-${ss.groupedBy}`] || [];
                  if (concreteRows.length) {
                    const reinfRowsMap = extractReinfRowsMap(
                      tabRows,
                      key,
                      concreteRows,
                    );
                    batches.push({
                      endpoint: `PUT /takeoff/${projectId}/elements/${concreteSS.elementType}`,
                      elementType: concreteSS.elementType,
                      payload: buildElementsWithReinforcement(
                        concreteRows,
                        reinfRowsMap,
                      ),
                    });
                  }
                } else if (ss.elementType) {
                  const rows = tabRows[key] || [];
                  if (rows.length)
                    batches.push({
                      endpoint: `PUT /takeoff/${projectId}/elements/${ss.elementType}`,
                      elementType: ss.elementType,
                      payload: buildElementsPayload(rows),
                    });
                }
            }
          } else if (subTab.tables?.length) {
            for (const table of subTab.tables) {
              if (!table.elementType) continue;
              const rows = tabRows[`${tab.id}-${subTab.id}-${table.id}`] || [];
              if (rows.length)
                batches.push({
                  endpoint: `PUT /takeoff/${projectId}/elements/${table.elementType}`,
                  elementType: table.elementType,
                  payload: buildElementsPayload(rows),
                });
            }
          } else if (subTab.groupedBy) {
            if (!subTab.elementType) continue;
            const concreteSubTab = tab.subTabs.find(
              (s) => s.id === subTab.groupedBy,
            );
            if (!concreteSubTab?.elementType) continue;
            const concreteRows = tabRows[`${tab.id}-${subTab.groupedBy}`] || [];
            if (concreteRows.length) {
              const reinfRowsMap = extractReinfRowsMap(
                tabRows,
                `${tab.id}-${subTab.id}`,
                concreteRows,
              );
              batches.push({
                endpoint: `PUT /takeoff/${projectId}/elements/${concreteSubTab.elementType}`,
                elementType: concreteSubTab.elementType,
                payload: buildElementsWithReinforcement(
                  concreteRows,
                  reinfRowsMap,
                ),
              });
            }
          } else if (subTab.elementType) {
            const rows = tabRows[`${tab.id}-${subTab.id}`] || [];
            if (rows.length)
              batches.push({
                endpoint: `PUT /takeoff/${projectId}/elements/${subTab.elementType}`,
                elementType: subTab.elementType,
                payload: buildElementsPayload(rows),
              });
          }
        }
      } else if (tab.elementType) {
        const rows = tabRows[tab.id] || [];
        if (rows.length)
          batches.push({
            endpoint: `PUT /takeoff/${projectId}/elements/${tab.elementType}`,
            elementType: tab.elementType,
            payload: buildElementsPayload(rows),
          });
      }
    }

    console.group(
      `%c[SaveWorkspace] ${section}/${item} — ${batches.length} batch(es)`,
      "color: #f59e0b; font-weight: bold;",
    );
    batches.forEach((b) => {
      console.group(`%c${b.endpoint}`, "color: #3b82f6;");
      console.log("payload:", JSON.stringify(b.payload, null, 2));
      console.groupEnd();
    });
    console.groupEnd();

    // Fire API requests
    Promise.allSettled(
      batches.map((batch) =>
        upsertTakeoffElements({
          projectId,
          elementType: batch.elementType,
          body: batch.payload,
        }).unwrap(),
      ),
    ).then((results) => {
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error(`[SaveWorkspace] ${failed.length} batch(es) failed to save.`);
      } else {
        console.log(`[SaveWorkspace] All batches saved successfully.`);
      }
    });
  }, [config, tabRows, projectId, section, item, upsertTakeoffElements]);

  if (isLoading || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading takeoff section...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 w-full max-w-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {config.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors ${activeTab === tab.id ? "border-slate-300 text-slate-900 bg-white shadow-sm" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={handleSaveWorkspace}
            disabled={isSaving}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm border-0 h-9 px-4"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isSaving ? "Saving..." : "Save Workspace"}
          </Button>
        </div>

        {activeTabData && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                {activeTabData.icon && (
                  <activeTabData.icon className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTabData.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTabData.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between">
                {hasSubTabs && activeTabData.subTabs && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {activeTabData.subTabs.map((subTab) => {
                      const isActive = currentSubTabId === subTab.id;
                      return (
                        <div key={subTab.id} className="flex items-center">
                          <button
                            onClick={() =>
                              setActiveSubTabs((p) => ({
                                ...p,
                                [activeTab]: subTab.id,
                              }))
                            }
                            className={`px-4 py-2 text-[11px] font-bold rounded-l-md border transition-colors ${isActive ? "border-slate-300 text-slate-900 bg-white shadow-sm z-10" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md"}`}
                          >
                            {subTab.label}
                          </button>
                          {isActive && subTab.subTabs?.length && (
                            <div className="flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-md px-1.5 py-1 -ml-px animate-in fade-in slide-in-from-left-4 duration-300">
                              {subTab.subTabs.map((ss) => (
                                <button
                                  key={ss.id}
                                  onClick={() =>
                                    setActiveSubTabs((p) => ({
                                      ...p,
                                      [`${activeTab}-${subTab.id}`]: ss.id,
                                    }))
                                  }
                                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${currentSubSubTabId === ss.id ? "bg-white text-amber-700 shadow-sm border border-amber-200" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                  {ss.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {tableData?.hasBendingSummary && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          bendingSummaries[rowKey]
                            ? "bg-slate-900 text-white hover:bg-slate-800 h-9 font-medium border-slate-900"
                            : "text-slate-600 bg-white h-9 border-slate-200"
                        }
                        onClick={() => {
                          setBendingFormData(
                            bendingSummaries[rowKey] || {
                              Y6: "",
                              Y8: "",
                              Y10: "",
                              Y12: "",
                              Y16: "",
                              Y20: "",
                              Y25: "",
                            },
                          );
                          setIsBendingModalOpen(true);
                        }}
                      >
                        Bending Summary
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {bendingSummaries[rowKey] ? (
              <BendingSummaryRow summary={bendingSummaries[rowKey]} />
            ) : tableData?.groupedBy && !tableData?.singleTable ? (
              <div className="space-y-6">
                {(() => {
                  const sKey = hasSubTabs
                    ? `${activeTab}-${tableData.groupedBy}`
                    : tableData.groupedBy || "";
                  const sRows = tabRows[sKey] || [];
                  return sRows.map((sr, idx) => {
                    const gKey =
                      sr.id || `${tableData.groupIdPrefix || "G"}${idx + 1}`;
                    const sRowKey = `${rowKey}-${gKey}`;
                    const gRows = tabRows[sRowKey]?.length
                      ? tabRows[sRowKey]
                      : [{ id: `${gKey}-1` }];
                    return (
                      <div
                        key={gKey}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm"
                      >
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <Book className="w-4 h-4 text-slate-500" />
                          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
                            {tableData.groupLabelPrefix} {idx + 1}
                          </h3>
                        </div>
                        <TakeoffDataTable
                          rows={gRows}
                          columns={tableData.columns || []}
                          onUpdateRow={(ridx, k, v, fid) =>
                            handleUpdateRow(sRowKey, ridx, k, v, fid)
                          }
                          onAddRow={() => handleAddRow(sRowKey, `${gKey}-`)}
                          onDeleteRow={(ridx) => handleDeleteRow(sRowKey, ridx)}
                          customPrefix={`${gKey}-`}
                          showBendingButton={!!tableData.hasBendingSummary}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            ) : tableData?.tables ? (
              <div className="space-y-6">
                {tableData.tables.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                      <Book className="w-4 h-4 text-slate-500" />
                      <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
                        {t.label}
                      </h3>
                    </div>
                    <TakeoffDataTable
                      rows={tabRows[`${rowKey}-${t.id}`] || []}
                      columns={t.columns}
                      onUpdateRow={(ridx, k, v, fid) =>
                        handleUpdateRow(`${rowKey}-${t.id}`, ridx, k, v, fid)
                      }
                      onAddRow={() =>
                        handleAddRow(`${rowKey}-${t.id}`, t.prefix)
                      }
                      onDeleteRow={(ridx) =>
                        handleDeleteRow(`${rowKey}-${t.id}`, ridx)
                      }
                      customPrefix={t.prefix}
                      showBendingButton={!!tableData.hasBendingSummary}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <TakeoffDataTable
                rows={currentRows}
                columns={tableData?.columns || []}
                onUpdateRow={(ridx, k, v, fid) =>
                  handleUpdateRow(rowKey, ridx, k, v, fid)
                }
                onAddRow={() =>
                  handleAddRow(rowKey, (tableData as any)?.prefix)
                }
                onDeleteRow={(ridx) => handleDeleteRow(rowKey, ridx)}
                isSingleTable={!!tableData?.singleTable}
                showBendingButton={!!tableData?.hasBendingSummary}
              />
            )}
          </div>
        )}
      </div>

      <BendingScheduleModal
        isOpen={isBendingModalOpen}
        onClose={() => setIsBendingModalOpen(false)}
        formData={bendingFormData}
        onUpdateField={(k, v) => setBendingFormData((p) => ({ ...p, [k]: v }))}
        onSave={() => {
          dispatch(
            updateBendingSummaries({
              projectId,
              section,
              item,
              bendingSummaries: {
                ...bendingSummaries,
                [rowKey]: bendingFormData,
              },
            }),
          );
          setIsBendingModalOpen(false);
        }}
      />
    </div>
  );
}
