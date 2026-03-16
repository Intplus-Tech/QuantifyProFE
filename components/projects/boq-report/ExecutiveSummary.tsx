"use client";

import type { CostCategory, ResourceAllocation } from "./types";
import { Pie, PieChart, Cell, BarChart, Bar, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ExecutiveSummaryProps {
  costCategories: CostCategory[];
  resourceAllocations: ResourceAllocation[];
  grandTotal: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

const hexColors: Record<string, string> = {
  "bg-amber-500": "#FF7A00", // Vibrant orange
  "bg-blue-500": "#00C2FF",  // Cyan/Light Blue
  "bg-emerald-500": "#6DD400", // Bright Green
  "bg-violet-500": "#8b5cf6",
  "bg-rose-500": "#f43f5e",
};

// Custom Bar Shape for Resource Allocation
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  const barY = Math.max(y, 0); // Ensure we don't go negative
  
  return (
    <g>
      {/* Light background for the bar */}
      <rect x={x} y={barY} width={width} height={height} fill="#FFF8EB" rx={2} />
      {/* Darker base border for the bar */}
      <rect x={x} y={barY + height - 4} width={width} height={4} fill="#FFC85C" rx={1} />
      {/* Percentage label floating just above the bottom border */}
      {height > 24 && (
        <text 
          x={x + width / 2} 
          y={barY + height - 16} 
          fill="#334155" 
          textAnchor="middle" 
          fontWeight="700" 
          fontSize={14}
        >
          {payload.percentage}%
        </text>
      )}
    </g>
  );
};

// Custom Label for Pie Chart shown on the outside
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill } = props;
  const RADIAN = Math.PI / 180;
  // Push the label significantly outside the arc
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  const textAnchor = x > cx ? 'start' : 'end';
  
  // Format percentage (e.g., "45%")
  const percentText = `${(percent * 100).toFixed(0)}%`;
  // Clean up "Works" or "Services" for a shorter label
  const shortName = name.replace(" Works", "").replace(" Services", "");
  
  return (
    <g>
      <text x={x} y={y - 8} fill={fill} textAnchor={textAnchor} dominantBaseline="central" className="text-xs font-bold font-sans">
        {percentText}
      </text>
      <text x={x} y={y + 8} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" className="text-[10px] font-medium font-sans">
        {shortName}
      </text>
    </g>
  );
};

export function ExecutiveSummary({
  costCategories,
  resourceAllocations,
  grandTotal,
}: ExecutiveSummaryProps) {

  const pieData = costCategories.map((cat) => ({
    name: cat.name,
    value: cat.value,
    percentage: cat.percentage,
    fill: hexColors[cat.color] ?? "#f59e0b",
  }));

  const pieConfig = {
    value: { label: "Cost" },
    ...Object.fromEntries(
      costCategories.map((cat) => [cat.name, { label: cat.name, color: hexColors[cat.color] ?? "#f59e0b" }])
    )
  };

  const barData = resourceAllocations.map((res) => ({
    label: res.label,
    // Provide a shortened label for the X Axis
    shortLabel: res.label === "Equipment" ? "EQUIP." : res.label.toUpperCase(),
    percentage: res.percentage,
  }));

  return (
    <div>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
        Executive Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left: Cost Distribution */}
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 lg:p-8 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Cost Distribution by Category
          </h3>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
            {formatCurrency(grandTotal)}
          </p>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Donut Chart */}
            <div className="w-full h-[220px]">
              <ChartContainer config={pieConfig} className="w-full h-full pb-0">
                <PieChart>
                  <defs>
                    {/* Soft drop shadow for the pie chart */}
                    <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.08" />
                    </filter>
                  </defs>
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    stroke="#ffffff"
                    strokeWidth={5}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    filter="url(#pie-shadow)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Legend placed below the chart */}
            <div className="flex items-center justify-center gap-6 mt-8">
              {costCategories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: hexColors[cat.color] ?? "#ccc" }} 
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {cat.name.replace(" Works", "").replace(" Services", "")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Resource Allocation */}
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-6 lg:p-8 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Resource Allocation
          </h3>
          <p className="text-xs font-medium text-slate-500 mb-8">
            Labor vs Materials vs Equipment
          </p>

          <div className="flex-1 flex flex-col justify-end">
            <div className="w-full h-[220px]">
              <ChartContainer config={{}} className="w-full h-full">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="shortLabel" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700, fontFamily: "sans-serif" }}
                    dy={10}
                  />
                  {/* Provide enough height space using domain */}
                  <Bar 
                    dataKey="percentage" 
                    shape={<CustomBar />} 
                    isAnimationActive={false} 
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
