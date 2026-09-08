"use client";

import { Loader2, PackageSearch, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMaterialTakeoffQuery } from "@/store/api/boqDocumentApi";
import { fmt } from "../calc";
import {
  SectionCard,
  SummaryTiles,
  td,
  tdNum,
  th,
  theadCls,
  trCls,
} from "../shared/ReportPrimitives";
import { ReportHeading } from "./ReportHeading";

/**
 * What has to be bought, from GET /projects/:id/material-takeoff.
 *
 * The BOQ bills *work* — one line of concrete in m³. This is the cement, sand
 * and steel behind it, with the server's waste factors already applied.
 *
 * Not to be confused with the older /takeoff/:id/material-schedule, which
 * counts takeoff elements by type rather than materials to order.
 */
export function MaterialScheduleView({ projectId }: { projectId: string }) {
  const { data, isLoading, isFetching, error, refetch } =
    useGetMaterialTakeoffQuery(projectId, { skip: !projectId });

  const result = data?.data;
  const materials = result?.materials ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#dbeef1] bg-white px-5 py-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        Working out the materials…
      </div>
    );
  }

  const status = (error as { status?: number } | undefined)?.status;

  if (status === 404 || (!error && materials.length === 0)) {
    return (
      <>
        <ReportHeading prefix="Material Schedule" />
        <div className="rounded-lg border border-[#dbeef1] bg-white px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <PackageSearch className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Nothing to order yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
            Materials are worked out from a finalized takeoff. Generate the bill
            of quantities first and they appear here.
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ReportHeading prefix="Material Schedule" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-center">
          <TriangleAlert className="mx-auto h-6 w-6 text-red-500" />
          <p className="mt-2 text-sm font-medium text-slate-800">
            Couldn&apos;t load the materials
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8 text-[11px]"
            onClick={() => void refetch()}
          >
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Retry
          </Button>
        </div>
      </>
    );
  }

  // One tile per material keeps the units honest — they don't share a scale, so
  // there is nothing meaningful to sum across cement in bags and steel in kg.
  const tiles = materials.slice(0, 4).map((material) => ({
    label: material.label,
    value: `${fmt(material.quantity)} ${material.unit}`,
    hint: `${fmt(material.netQuantity)} measured + ${material.wastePercentage}% waste`,
  }));

  return (
    <>
      <ReportHeading
        prefix="Material Schedule"
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw
              className={`mr-1.5 h-3 w-3 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      <SummaryTiles title="To order" tiles={tiles} />

      <SectionCard
        title="MATERIALS"
        count={`(${materials.length} ${materials.length === 1 ? "material" : "materials"})`}
      >
        <table className="w-full min-w-[720px]">
          <thead className={theadCls}>
            <tr>
              <th className={th}>Material</th>
              <th className={`${th} text-right`}>Measured</th>
              <th className={`${th} text-right`}>Waste</th>
              <th className={`${th} text-right`}>Order Quantity</th>
              <th className={th}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.material} className={trCls}>
                <td className={`${td} font-medium`}>{material.label}</td>
                <td className={tdNum}>{fmt(material.netQuantity)}</td>
                <td className={tdNum}>{material.wastePercentage}%</td>
                <td className={`${tdNum} font-semibold text-slate-800`}>
                  {fmt(material.quantity)}
                </td>
                <td className={td}>{material.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <p className="text-[11px] leading-relaxed text-slate-500">
        <span className="font-medium text-slate-600">Order Quantity</span> is
        what to buy — the measured figure with waste added. Order against that
        column, not the measured one.
      </p>
    </>
  );
}
