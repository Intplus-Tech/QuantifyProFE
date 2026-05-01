"use client";

import { useState, useEffect } from "react";
import { useGetProjectByIdQuery } from "@/store/api/projectsApi";
import { Loader2, PenTool, Settings2, Plus, Calculator, Trash2, Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTakeoffConfig } from "./configs";
import type { TakeoffConfig, TakeoffTab, TakeoffSubTab, TakeoffTableConfig, TakeoffColumn } from "./configs";


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
  const { data: projectResponse, isLoading } = useGetProjectByIdQuery(projectId);

  // Load configuration
  const config = getTakeoffConfig(section, item);
  const [activeTab, setActiveTab] = useState(config.tabs[0].id);
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>({});

  // Initialize state for table rows
  const [tabRows, setTabRows] = useState<Record<string, Record<string, any>[]>>({});

  // Bending Summary State
  const [bendingSummaries, setBendingSummaries] = useState<Record<string, Record<string, string>>>({});
  const [isBendingModalOpen, setIsBendingModalOpen] = useState(false);
  const [bendingFormData, setBendingFormData] = useState<Record<string, string>>({
    Y6: "", Y8: "", Y10: "", Y12: "", Y16: "", Y20: "", Y25: ""
  });

  // Initialize default rows on mount
  useEffect(() => {
    const initialRows: Record<string, Record<string, any>[]> = {};
    const initialSubTabs: Record<string, string> = {};
    
    config.tabs.forEach((tab) => {
      if (tab.subTabs && tab.subTabs.length > 0) {
        initialSubTabs[tab.id] = tab.subTabs[0].id;
        tab.subTabs.forEach(sub => {
          if (sub.tables) {
            sub.tables.forEach(table => {
              initialRows[`${tab.id}-${sub.id}-${table.id}`] = [...table.defaultRows];
            });
          } else if (sub.defaultRows) {
            initialRows[`${tab.id}-${sub.id}`] = [...sub.defaultRows];
          }
        });
      } else if (tab.defaultRows) {
        initialRows[tab.id] = [...tab.defaultRows];
      }
    });
    
    setTabRows(initialRows);
    setActiveSubTabs(initialSubTabs);
  }, [section, item]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading takeoff section...</p>
      </div>
    );
  }

  const activeTabData = config.tabs.find((t) => t.id === activeTab);
  const hasSubTabs = activeTabData?.subTabs && activeTabData.subTabs.length > 0;
  const currentSubTabId = activeSubTabs[activeTab] || (hasSubTabs ? activeTabData!.subTabs![0].id : "");
  
  const tableData = hasSubTabs 
    ? activeTabData!.subTabs!.find(s => s.id === currentSubTabId)
    : activeTabData;

  const rowKey = hasSubTabs ? `${activeTab}-${currentSubTabId}` : activeTab;
  const currentRows = tabRows[rowKey] || [];

  const updateRow = (tabId: string, rowIndex: number, key: string, value: string, fallbackId?: string) => {
    setTabRows((prev) => {
      const newTabRows = [...(prev[tabId] || [])];
      if (!newTabRows[rowIndex]) {
        newTabRows[rowIndex] = { id: fallbackId || `ROW${rowIndex + 1}` };
      }
      newTabRows[rowIndex] = { ...newTabRows[rowIndex], [key]: value };
      return { ...prev, [tabId]: newTabRows };
    });
  };

  const addRow = (tabId: string, customPrefix?: string, defaultValues?: Record<string, any>) => {
    setTabRows((prev) => {
      const newTabRows = [...(prev[tabId] || [])];
      
      if (newTabRows.length === 0 && customPrefix) {
        newTabRows.push({ id: `${customPrefix}1`, shape: "rectangular", ...defaultValues });
      }

      const nextId = newTabRows.length > 0 ? newTabRows.length + 1 : 1;
      const prefix = customPrefix || (newTabRows.length > 0 && newTabRows[0].id ? newTabRows[0].id.replace(/[0-9]/g, '') : 'ROW');
      
      newTabRows.push({ id: `${prefix}${nextId}`, shape: "rectangular", ...defaultValues });
      return { ...prev, [tabId]: newTabRows };
    });
  };

  const deleteRow = (tabId: string, rowIndex: number) => {
    setTabRows((prev) => {
      const newTabRows = [...(prev[tabId] || [])];
      newTabRows.splice(rowIndex, 1);
      return { ...prev, [tabId]: newTabRows };
    });
  };

  return (
    <div className="space-y-6 pb-6 w-full max-w-full">
      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 w-full overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {config.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors border ${
                  isActive
                    ? "border-slate-300 text-slate-900 bg-white shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        {activeTabData && (
          <div className="space-y-6">
            
            {/* Header section matching screenshots */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                {activeTabData.icon && <activeTabData.icon className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{activeTabData.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{activeTabData.subtitle}</p>
              </div>
            </div>

            {/* Sub Tabs Navigation & Actions */}
            <div className="flex items-center justify-between mt-4">
              {hasSubTabs && activeTabData.subTabs ? (
                <div className="flex items-center gap-2">
                  {activeTabData.subTabs.map((subTab) => {
                    const isSubActive = currentSubTabId === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => setActiveSubTabs(prev => ({ ...prev, [activeTab]: subTab.id }))}
                        className={`px-4 py-2 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors border ${
                          isSubActive
                            ? "border-slate-300 text-slate-900 bg-white shadow-sm"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {subTab.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {tableData?.hasBendingSummary && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className={bendingSummaries[rowKey] ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white h-9 font-medium border-slate-900 shadow-sm" : "text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9 font-medium"}
                      onClick={() => {
                        setBendingFormData(bendingSummaries[rowKey] || { Y6: "", Y8: "", Y10: "", Y12: "", Y16: "", Y20: "", Y25: "" });
                        setIsBendingModalOpen(true);
                      }}
                    >
                      Bending Summary
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Preview Calculations
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Table Area */}
            {bendingSummaries[rowKey] ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] text-slate-500 bg-slate-50/80 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Y6</th>
                        <th className="px-4 py-3 font-semibold">Y8</th>
                        <th className="px-4 py-3 font-semibold">Y10</th>
                        <th className="px-4 py-3 font-semibold">Y12</th>
                        <th className="px-4 py-3 font-semibold">Y16</th>
                        <th className="px-4 py-3 font-semibold">Y20</th>
                        <th className="px-4 py-3 font-semibold">Y25</th>
                        <th className="px-4 py-3 font-bold text-white bg-green-500 whitespace-nowrap">TOTAL (kg)</th>
                        <th className="px-4 py-3 font-bold text-white bg-green-500 whitespace-nowrap">TOTAL (tons)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y6 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y8 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y10 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y12 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y16 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y20 || "0"}</td>
                        <td className="px-4 py-4">{bendingSummaries[rowKey].Y25 || "0"}</td>
                        <td className="px-4 py-4 font-bold text-slate-800">
                          {(() => {
                            const sum = ["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].reduce((acc, key) => {
                              const val = parseFloat(bendingSummaries[rowKey][key]?.replace(/,/g, '') || "0");
                              return acc + (isNaN(val) ? 0 : val);
                            }, 0);
                            return sum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                          })()}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-800">
                          {(() => {
                            const sum = ["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].reduce((acc, key) => {
                              const val = parseFloat(bendingSummaries[rowKey][key]?.replace(/,/g, '') || "0");
                              return acc + (isNaN(val) ? 0 : val);
                            }, 0);
                            return (sum / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : tableData?.groupedBy ? (() => {
              const sourceRowKey = hasSubTabs ? `${activeTab}-${tableData.groupedBy}` : tableData.groupedBy;
              // If source tab rows exist use them, else fallback to defaultRows of source tab, else []
              const sourceRows = tabRows[sourceRowKey] || config.tabs.find(t => t.id === activeTab)?.subTabs?.find(s => s.id === tableData.groupedBy)?.defaultRows || [];
              
              if (sourceRows.length === 0) {
                return (
                  <div className="p-8 text-center border rounded-xl bg-white border-slate-200">
                    <p className="text-slate-500">Please add rows to the {tableData.groupedBy.replace(/-/g, ' ')} tab first.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {sourceRows.map((sourceRow, idx) => {
                    const groupKey = sourceRow.id || `${tableData.groupIdPrefix || 'G'}${idx + 1}`;
                    const groupLabel = `${tableData.groupLabelPrefix || 'GROUP'} ${idx + 1}`;
                    const specificRowKey = `${rowKey}-${groupKey}`;
                    
                    let groupRows = tabRows[specificRowKey];
                    if (!groupRows || groupRows.length === 0) {
                      groupRows = [{ id: `${groupKey}-1` }];
                    }

                    return (
                      <div key={groupKey} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <Book className="w-4 h-4 text-slate-500" />
                          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">{groupLabel}</h3>
                        </div>
                        {renderTableGroup(groupRows, tableData.columns || [], specificRowKey, `${groupKey}-`)}
                      </div>
                    );
                  })}
                </div>
              );
            })() : tableData?.tables ? (
              <div className="space-y-6">
                {tableData.tables.map(table => {
                  const specificRowKey = `${rowKey}-${table.id}`;
                  const currentTableRows = tabRows[specificRowKey] || [];
                  return (
                    <div key={table.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <Book className="w-4 h-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">{table.label}</h3>
                      </div>
                      {renderTableGroup(currentTableRows, table.columns, specificRowKey, table.prefix)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                {renderTableGroup(currentRows, tableData?.columns || [], rowKey)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bending Summary Modal */}
      {isBendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
                  <PenTool className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Enter Bending Schedule Summary</h3>
                  <p className="text-xs text-slate-500">Enter measurements only.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBendingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-green-50/30">
              <div className="space-y-3 bg-white p-6 rounded-lg border border-green-100/50">
                {["Y6", "Y8", "Y10", "Y12", "Y16", "Y20", "Y25"].map((yKey) => (
                  <div key={yKey} className="flex items-center gap-4">
                    <label className="w-16 font-bold text-sm text-slate-800">{yKey}</label>
                    <Input
                      className="flex-1 bg-green-50/30 border-green-200 focus-visible:ring-green-500 text-slate-800 h-10"
                      value={bendingFormData[yKey]}
                      onChange={(e) => setBendingFormData(prev => ({ ...prev, [yKey]: e.target.value }))}
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <Button
                variant="outline"
                onClick={() => setIsBendingModalOpen(false)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setBendingSummaries(prev => ({ ...prev, [rowKey]: bendingFormData }));
                  setIsBendingModalOpen(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm border-0"
              >
                Save Summary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderTableGroup(rows: any[], columns: TakeoffColumn[], specificRowKey: string, customPrefix?: string) {
    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 bg-slate-50/80 uppercase tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-semibold whitespace-nowrap ${
                      col.highlight ? "bg-green-50/50 text-green-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.highlight && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shrink-0"></div>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => {
                const highlightCols = columns.filter((c) => c.highlight) || [];
                // For multiInput cols, check all 4 sub-values
                const isCompleted = highlightCols.length > 0 && highlightCols.every((c) => {
                  if (c.multiInput) {
                    return [0,1,2,3].every(i => {
                      const v = row[`${c.key}_${i}`];
                      return v !== undefined && v !== "" && v !== null;
                    });
                  }
                  const val = row[c.key];
                  return val !== undefined && val !== "" && val !== null;
                });

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    {columns.map((col) => {
                      let cellBg = "";
                      let textClass = "";
                      if (col.highlight) {
                        if (isCompleted) {
                          cellBg = "bg-green-50/50";
                          textClass = "text-green-700";
                        } else {
                          cellBg = "bg-orange-50/30";
                        }
                      }

                      if (col.multiInput) {
                        const subVals = [0,1,2,3].map(i => row[`${col.key}_${i}`] || "");
                        const allFilled = subVals.every(v => v !== "");
                        return (
                          <td key={col.key} className={`px-2 py-3 whitespace-nowrap min-w-[180px] transition-colors ${cellBg}`}>
                            {allFilled ? (
                              <span className={`text-xs font-medium ${textClass || 'text-slate-700'}`}>
                                {subVals.join(" - ")}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                {[0,1,2,3].map((i) => (
                                  <input
                                    key={i}
                                    type="text"
                                    className="w-10 h-9 text-xs text-center rounded border border-amber-400 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400 transition-colors"
                                    value={row[`${col.key}_${i}`] || ""}
                                    onChange={(e) => updateRow(specificRowKey, idx, `${col.key}_${i}`, e.target.value, row.id)}
                                  />
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      }

                      const value = row[col.key] || "";
                      return (
                        <td key={col.key} className={`px-4 py-3 whitespace-nowrap min-w-[120px] transition-colors ${cellBg}`}>
                          {col.readonly ? (
                            <span className={`text-xs font-semibold ${col.highlight && isCompleted ? "text-green-700" : "text-slate-800"}`}>
                              {value}
                            </span>
                          ) : col.type === "select" ? (
                            <select
                              className={`h-9 text-xs w-full transition-colors rounded-md px-2 border outline-none ${
                                !value
                                  ? "border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-500 bg-white"
                                  : `border-transparent bg-transparent hover:border-slate-200 focus-visible:ring-1 focus-visible:border-amber-500 focus-visible:bg-white font-medium ${textClass || 'text-slate-700'}`
                              }`}
                              value={value}
                              onChange={(e) => updateRow(specificRowKey, idx, col.key, e.target.value, row.id)}
                            >
                              {/* Only show blank option when nothing is selected yet */}
                              {!value && <option value=""></option>}
                              {col.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              className={`h-9 text-xs w-full transition-colors ${
                                !value
                                  ? "border-amber-400 focus-visible:ring-amber-500 bg-white"
                                  : `border-transparent bg-transparent hover:border-slate-200 focus-visible:border-amber-500 focus-visible:bg-white font-medium ${textClass || 'text-slate-700'}`
                              }`}
                              value={value}
                              onChange={(e) => updateRow(specificRowKey, idx, col.key, e.target.value, row.id)}
                              placeholder="---"
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-slate-400 ${rows.length <= 1 ? "opacity-30 cursor-not-allowed" : "hover:text-red-600 hover:bg-red-50"}`}
                        onClick={() => rows.length > 1 && deleteRow(specificRowKey, idx)}
                        disabled={rows.length <= 1}
                        title="Delete Row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addRow(specificRowKey, customPrefix)}
            className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          {!tableData?.hasBendingSummary && (
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 bg-white shadow-sm border-slate-200 hover:bg-slate-50 h-9"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Preview Calculations
            </Button>
          )}
        </div>
      </>
    );
  }
}
