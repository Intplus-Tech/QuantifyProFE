"use client";

import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Building2, CalendarDays, User } from "lucide-react";
import type { RootState } from "@/store";
import { ReportPageHeader } from "../shared/ReportPrimitives";

export function ReportHeading({
  prefix,
  action,
}: {
  prefix: string;
  action?: ReactNode;
}) {
  const meta = useSelector((state: RootState) => state.aiFlow.projectMeta);

  return (
    <ReportPageHeader
      title={`${prefix} - ${meta.subject.replace(" - ", " ")}`}
      action={action}
      meta={[
        {
          icon: <Building2 className="h-3 w-3 text-slate-400" />,
          label: `Project: ${meta.projectTitle}`,
        },
        {
          icon: <User className="h-3 w-3 text-slate-400" />,
          label: `Client: ${meta.clientName}`,
        },
        {
          icon: <CalendarDays className="h-3 w-3 text-slate-400" />,
          label: `Date: ${meta.date}`,
        },
      ]}
    />
  );
}
