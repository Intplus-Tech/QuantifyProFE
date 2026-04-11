"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { formatValue } from "@/components/clients/mockData";
import { useGetClientsQuery, useGetClientsStatsQuery } from "@/store/api/clientsApi";

export default function ClientsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: statsRes } = useGetClientsStatsQuery();

  const totalClients = statsRes?.data?.totalClients ?? 0;
  const totalValue = statsRes?.data?.totalBoqValue ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Stats & Action */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Card className="shadow-sm flex-1 sm:min-w-75">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                TOTAL MANAGED CLIENTS
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {totalClients}
                </span>
                <span className="text-xs font-medium text-green-600">
                  +{statsRes?.data?.newClientsThisMonth ?? 0} this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1 sm:min-w-87.5">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                PLATFORM TOTAL BOQ VALUE
              </p>
              <div className="text-3xl font-bold text-foreground">
                {formatValue(totalValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        <button
          className="flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-12 px-6 w-full lg:w-auto rounded-md font-medium"
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </button>
      </div>

      <ClientsTable />

      <AddClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
