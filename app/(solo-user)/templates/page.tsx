"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  BookOpen,
  Home,
  Building2,
  Factory,
  ShoppingBag,
  Hotel,
} from "lucide-react";
import { type Template } from "@/components/templates/mock-data";
import { TemplateDetailsModal } from "@/components/templates/TemplateDetailsModal";
import { TemplateCard } from "@/components/templates/TemplateCard";
import {
  useGetTemplatesQuery,
  useDeleteTemplateMutation,
} from "@/store/api/templatesApi";
import { Template as ApiTemplate } from "@/types/templates";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API Hooks
  const { data: apiResponse, isLoading } = useGetTemplatesQuery({});
  const [deleteTemplate] = useDeleteTemplateMutation();

  const handleOpenModal = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = async (template: Template) => {
    try {
      await deleteTemplate(template.id as string).unwrap();
      toast.success("Template deleted successfully");
      if (selectedTemplate?.id === template.id) {
        setIsModalOpen(false);
        setSelectedTemplate(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete template");
    }
  };

  // Map API Template to UI Template structure
  const mapApiTemplateToUi = (apiTemplate: ApiTemplate): Template => {
    const iconMap: Record<string, any> = {
      "🏠": Home,
      "🏢": Building2,
      "🏭": Factory,
      "🛍️": ShoppingBag,
      "🏨": Hotel,
    };

    return {
      id: apiTemplate._id,
      title: apiTemplate.name,
      description: apiTemplate.description,
      icon: iconMap[apiTemplate.icon] || Home,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      openedAt: apiTemplate.updatedAt
        ? `updated ${new Date(apiTemplate.updatedAt).toLocaleDateString()}`
        : "recently opened",
      team: [
        {
          avatar: `https://i.pravatar.cc/150?u=${apiTemplate._id}`,
          initials: apiTemplate.name.substring(0, 2).toUpperCase(),
        },
      ],
      extraUsers: "+0",
      badge: apiTemplate.type === "system" ? "SYSTEM DEFAULT" : "PRIVATE",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=450",
      boqGenerated: apiTemplate.boqCount || 0,
      estValue: "₦50M - ₦150M", // Placeholder as it's not in API
      sections: apiTemplate.boqResult.sections.map((s) => s.sectionName),
      features: apiTemplate.keyFeatures || [],
      tags: apiTemplate.tags || [],
      templateType:
        apiTemplate.type === "system" ? "System Provided" : "User Template",
      lastUpdated: apiTemplate.updatedAt
        ? new Date(apiTemplate.updatedAt).toLocaleDateString()
        : "Aug 15, 2024",
    };
  };

  const uiTemplates = apiResponse?.data?.map(mapApiTemplateToUi) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-muted/30 min-h-screen">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Template</h1>
        <p className="text-muted-foreground text-sm">
          Manage your standard and Organization workflow templates across the
          platform.
        </p>
      </div>

      {/* Action Button */}
      <div>
        <Button size={"lg"}>
          <Users className="w-4 h-4 mr-2" />
          System Template
        </Button>
      </div>

      {/* System Template Banner */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">System Template</h2>
          <Badge
            variant="outline"
            className="bg-transparent text-primary border-primary"
          >
            SYSTEM DEFAULT
          </Badge>
        </div>

        <Card className="border-2 border-dashed border-primary/30 bg-primary/5 shadow-none">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                System Template
              </h3>
              <p className="text-sm text-muted-foreground">
                Professional templates created by Quantify pro, optimized for
                Nigerian construction projects.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search templates by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 bg-card border-border/50 shadow-sm text-base rounded-xl focus:ring-primary/20"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="bg-card border-border/50 shadow-sm rounded-xl overflow-hidden animate-pulse"
              >
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          : uiTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onView={handleOpenModal}
                onDelete={handleDeleteTemplate}
              />
            ))}
      </div>

      <TemplateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
}
