"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Mail,
  PlusCircle,
  MonitorPlay,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { SupportTicketModal } from "./SupportTicketModal";

const categories = [
  {
    icon: MonitorPlay,
    title: "Automation",
    subtitle: "AI Flows",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: CreditCard,
    title: "Billing",
    subtitle: "Invoices & Plans",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Sparkles,
    title: "Features",
    subtitle: "Tools & Platform",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const recentTickets = [
  {
    id: "#TK-45920",
    subject: "Bulk export failed on large datasets",
    category: "Technical Support",
    created: "Oct 24, 2023",
    status: "In Progress",
    statusColor: "bg-amber-100 text-amber-600",
  },
  {
    id: "#TK-45919",
    subject: "Updating billing card information",
    category: "Account & Billing",
    created: "Oct 22, 2023",
    status: "In Progress",
    statusColor: "bg-amber-100 text-amber-600",
  },
  {
    id: "#TK-45891",
    subject: "Request for new reporting module",
    category: "Feature Request",
    created: "Oct 18, 2023",
    status: "Resolved",
    statusColor: "bg-green-100 text-green-600",
  },
];

export default function EnterpriseHelpSupport() {
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    How can we help you?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Search our knowledge base for quick answers to common questions.
                  </p>
                </div>

                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for technical issues, billing, or features..."
                    className="pl-12 bg-white border-border/50 h-12 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center`}
                      >
                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-sm">{cat.title}</p>
                        <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground">
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Email Support
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      RESPONSE IN &lt; 24 HOURS
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  onClick={() => setTicketOpen(true)}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Open New Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Tickets */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-foreground">
              Your Recent Tickets
            </CardTitle>
            <button className="text-xs font-semibold text-primary hover:text-primary/80 uppercase tracking-wider">
              VIEW ALL
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/5">
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-6 text-muted-foreground text-sm font-mono">
                        {ticket.id}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {ticket.created}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          className={`border-0 text-[10px] font-bold uppercase tracking-wider ${ticket.statusColor}`}
                        >
                          {ticket.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <SupportTicketModal open={ticketOpen} onOpenChange={setTicketOpen} />
    </>
  );
}
