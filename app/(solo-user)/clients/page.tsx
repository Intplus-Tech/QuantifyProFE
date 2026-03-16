"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { mockClients, formatValue } from "@/components/clients/mockData";

const totalClients = mockClients.length;
const totalValue = mockClients.reduce((sum, c) => sum + c.valueRaw, 0);

export default function ClientsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
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
                  +4 this month
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

        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-12 px-6 w-full lg:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>

      <ClientsTable data={mockClients} />

      <AddClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
