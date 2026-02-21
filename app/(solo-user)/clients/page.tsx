"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  FolderOpen,
  Trash2,
} from "lucide-react";

const mockClients = [
  {
    id: 1,
    initials: "AN",
    avatarBg: "bg-orange-100 text-orange-600",
    name: "Ahmed Nasser",
    company: "Global Build Co.",
    industry: "Infrastructure",
    industryColor: "bg-blue-50 text-blue-600 hover:bg-blue-50",
    status: "Active",
    statusColor: "bg-green-500",
    projects: 12,
    value: "32,211,240,000",
  },
  {
    id: 2,
    initials: "SM",
    avatarBg: "bg-orange-100 text-orange-600",
    name: "Sarah Miller",
    company: "Metro Developers Ltd.",
    industry: "Residential",
    industryColor: "bg-purple-50 text-purple-600 hover:bg-purple-50",
    status: "Active",
    statusColor: "bg-green-500",
    projects: 8,
    value: "132,211,240,000",
  },
  {
    id: 3,
    initials: "DH",
    avatarBg: "bg-gray-100 text-gray-600",
    name: "David Hughes",
    company: "Public Works Dept.",
    industry: "Public Works",
    industryColor: "bg-yellow-50 text-yellow-600 hover:bg-yellow-50",
    status: "Pending Review",
    statusColor: "bg-yellow-500",
    projects: 3,
    value: "332,211,240,000",
  },
  {
    id: 4,
    initials: "LJ",
    avatarBg: "bg-red-100 text-red-600",
    name: "Lisa Johnson",
    company: "Urban Core Design",
    industry: "Commercial",
    industryColor: "bg-green-50 text-green-600 hover:bg-green-50",
    status: "Active",
    statusColor: "bg-green-500",
    projects: 21,
    value: "12,132,211,240,000",
  },
];

export default function ClientsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Stats & Action */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Total Managed Clients */}
          <Card className="shadow-sm flex-1 sm:min-w-[300px]">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                TOTAL MANAGED CLIENTS
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">128</span>
                <span className="text-xs font-medium text-green-600">
                  +4 this month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Platform Total BOQ Value */}
          <Card className="shadow-sm flex-1 sm:min-w-[350px]">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                PLATFORM TOTAL BOQ VALUE
              </p>
              <div className="text-3xl font-bold text-foreground">
                89,932,211,240,000
              </div>
            </CardContent>
          </Card>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-12 px-6 w-full lg:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by client or company name..."
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px] bg-orange-50/50 border-orange-100 text-orange-700 font-medium">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="public">Public Works</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  CLIENT & COMPANY
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  INDUSTRY
                </th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  STATUS
                </th>
                <th className="text-center py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  PROJECTS
                </th>
                <th className="text-right py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  TOTAL BOQ VALUE
                </th>
                <th className="text-center py-4 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className={"w-10 h-10 " + client.avatarBg}>
                        <AvatarFallback className="bg-transparent font-semibold">
                          {client.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {client.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant="secondary"
                      className={"border-0 font-medium " + client.industryColor}
                    >
                      {client.industry}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={"w-2 h-2 rounded-full " + client.statusColor}
                      />
                      <span className="font-medium text-foreground">
                        {client.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-foreground">
                    {client.projects}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-foreground">
                    {client.value}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-orange-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                          View Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
          <p className="text-xs text-muted-foreground">
            Showing 1 to 4 of 48 clients
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-background"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-xs bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-xs bg-background"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-xs bg-background"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-background"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
