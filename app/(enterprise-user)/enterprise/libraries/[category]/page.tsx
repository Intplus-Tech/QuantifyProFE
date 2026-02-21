"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const locations = ["Lagos", "Abuja", "Port Harcourt", "Kaduna"];

const categoryData: Record<string, any> = {
  earthworks: {
    title: "Earthworks Rate",
    subtitle:
      "Manage unit rates for excavation, soil disposal, and specialized machinery.",
    columns: [
      "ITEM DESCRIPTION",
      "UNIT",
      "BASE RATE",
      "MACHINERY",
      "LABOR",
      "FINAL RATE",
      "ACTIONS",
    ],
    items: [
      {
        id: 1,
        title: "Bulk Excavation",
        desc: "Excluding disposal, up to 2m depth",
        unit: "m",
        base: "4,500.50",
        mach: "7,500.50",
        lab: "2,500.50",
        final: "44,500.50",
      },
      {
        id: 2,
        title: "Trenching (per m)",
        desc: "For utilities, 600mm width, soft soil",
        unit: "m",
        base: "4,500.50",
        mach: "7,500.50",
        lab: "2,500.50",
        final: "44,500.50",
      },
      {
        id: 3,
        title: "Backfilling & Compaction",
        desc: "Layer thickness max 150mm",
        unit: "m",
        base: "4,500.50",
        mach: "7,500.50",
        lab: "2,500.50",
        final: "44,500.50",
      },
      {
        id: 4,
        title: "Disposal of Surplus Soil",
        desc: "Up to 10km transport distance",
        unit: "m",
        base: "4,500.50",
        mach: "7,500.50",
        lab: "2,500.50",
        final: "44,500.50",
      },
      {
        id: 5,
        title: "Rock Excavation",
        desc: "Requiring pneumatic breaker attachment",
        unit: "m",
        base: "4,500.50",
        mach: "7,500.50",
        lab: "2,500.50",
        final: "44,500.50",
      },
    ],
  },
  labor: {
    title: "Labour Rate",
    subtitle: "Manage unit rates for Labor rate.",
    columns: [
      "ITEM DESCRIPTION",
      "UNIT",
      "BASE RATE",
      "MARKUP",
      "FINAL RATE",
      "ACTIONS",
    ],
    items: [
      {
        id: 1,
        title: "Ready-mix Concrete C25/30",
        desc: "20mm aggregate, 75mm slump",
        unit: "m",
        base: "4,500.50",
        markup: "15%",
        final: "44,500.50",
      },
      {
        id: 2,
        title: "Formwork to Foundations",
        desc: "Softwood, height up to 1m",
        unit: "m",
        base: "4,500.50",
        markup: "12%",
        final: "44,500.50",
      },
      {
        id: 3,
        title: "Steel Reinforcement A393 Mesh",
        desc: "Fabric reinforcement, 4.8m x 2.4m",
        unit: "Sheet",
        base: "4,500.50",
        markup: "18%",
        final: "44,500.50",
      },
      {
        id: 4,
        title: "Earthwork Excavation (Bulk)",
        desc: "General site clearance, up to 2m depth",
        unit: "m",
        base: "4,500.50",
        markup: "8%",
        final: "44,500.50",
      },
    ],
  },
  mep: {
    title: "MEP Rate",
    subtitle:
      "Manage and verify comprehensive unit rates for Mechanical, Electrical, and Plumbing assemblies.",
    columns: [
      "COMPONENT ASSEMBLY",
      "UNIT",
      "MATERIAL COST",
      "LABOUR COST",
      "FINAL RATE",
      "ACTIONS",
    ],
    items: [
      {
        id: 1,
        title: "HVAC Ductwork",
        desc: "Galvanized Steel, Rectangular, inc. supports",
        unit: "m",
        mat: "4,500.50",
        lab: "4,500.50",
        final: "44,500.50",
      },
      {
        id: 2,
        title: "Copper Piping (15mm-28mm)",
        desc: "EN 1057 standard, brazed joints",
        unit: "m",
        mat: "4,500.50",
        lab: "4,500.50",
        final: "44,500.50",
      },
      {
        id: 3,
        title: "Electrical Conduits & Wiring",
        desc: "25mm PVC conduit inc. 2.5mm wiring",
        unit: "m",
        mat: "4,500.50",
        lab: "4,500.50",
        final: "44,500.50",
      },
      {
        id: 4,
        title: "Electrical Conduits & Wiring",
        desc: "25mm PVC conduit inc. 2.5mm wiring",
        unit: "m",
        mat: "4,500.50",
        lab: "4,500.50",
        final: "44,500.50",
      },
      {
        id: 5,
        title: "Sanitary Ware Fittings",
        desc: "Wall hung WC suite inc. concealed cistern",
        unit: "nr",
        mat: "4,500.50",
        lab: "4,500.50",
        final: "44,500.50",
      },
    ],
  },
  steel: {
    title: "Steel Rate",
    subtitle: "Rates for reinforcement, structural steel, and mesh products.",
    columns: [
      "ITEM DESCRIPTION",
      "UNIT",
      "BASE RATE",
      "MARKUP",
      "FINAL RATE",
      "ACTIONS",
    ],
    items: [
      {
        id: 1,
        title: "Reinforcement Bars (H8-H32)",
        desc: "High-yield steel, ribbed bars to BS 4449",
        unit: "tonne",
        base: "4,500.50",
        markup: "15%",
        final: "44,500.50",
      },
      {
        id: 2,
        title: "Structural Steel Sections (I-Beams)",
        desc: "Universal Beams (UB) grade S355JR",
        unit: "linear meter",
        base: "4,500.50",
        markup: "12%",
        final: "44,500.50",
      },
      {
        id: 3,
        title: "Steel Mesh Fabric (A393)",
        desc: "4.8m x 2.4m standard sheet, 10mm wire",
        unit: "Sheet",
        base: "4,500.50",
        markup: "18%",
        final: "44,500.50",
      },
    ],
  },
  default: {
    title: "Category Rate",
    subtitle: "Manage unit rates for this category.",
    columns: ["ITEM DESCRIPTION", "UNIT", "BASE RATE", "FINAL RATE", "ACTIONS"],
    items: [
      {
        id: 1,
        title: "Sample Item",
        desc: "Sample description",
        unit: "m",
        base: "4,500.50",
        final: "44,500.50",
      },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const category = (params.category as string) || "earthworks";
  const [activeTab, setActiveTab] = useState("Lagos");

  const data = categoryData[category] || categoryData.default;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.subtitle}</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
          Add New Item
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex w-full bg-white rounded-lg p-1 shadow-sm border border-border/50">
        {locations.map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveTab(loc)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === loc
                ? "bg-orange-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card className="shadow-sm overflow-hidden bg-white border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {data.columns.map((col: string, i: number) => (
                  <th
                    key={i}
                    className={`py-4 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider ${
                      col === "ACTIONS" ? "text-center" : "text-left"
                    } ${col === "FINAL RATE" ? "text-orange-500 bg-orange-50/50" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: any) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </p>
                  </td>
                  <td className="py-4 px-6 font-medium text-foreground">
                    {item.unit}
                  </td>

                  {/* Dynamic columns based on category */}
                  {category === "earthworks" && (
                    <>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.base}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.mach}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.lab}
                      </td>
                    </>
                  )}
                  {category === "labor" && (
                    <>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.base}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.markup}
                      </td>
                    </>
                  )}
                  {category === "mep" && (
                    <>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.mat}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.lab}
                      </td>
                    </>
                  )}
                  {category === "steel" && (
                    <>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.base}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {item.markup}
                      </td>
                    </>
                  )}
                  {!["earthworks", "labor", "mep", "steel"].includes(
                    category,
                  ) && (
                    <td className="py-4 px-6 font-medium text-foreground">
                      {item.base}
                    </td>
                  )}

                  <td className="py-4 px-6 font-bold text-orange-500 bg-orange-50/50">
                    {item.final}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-white">
          <p className="text-xs text-muted-foreground">
            Showing {data.items.length} of 42 items in{" "}
            {data.title.replace(" Rate", "")} Category
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-xs bg-orange-50 text-orange-600 border-orange-200 font-bold"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-xs">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-xs">
              3
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
