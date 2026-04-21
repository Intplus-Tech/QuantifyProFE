"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Building, Plus, Home, Building2, Factory, ShoppingBag, Hotel } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"system" | "organization">("system");
  const [systemSearch, setSystemSearch] = useState("");
  const debouncedSystemSearch = useDebounce(systemSearch, 500);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const debouncedOrgSearch = useDebounce(organizationSearch, 500);
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      badge: apiTemplate.type === "system" ? "SYSTEM DEFAULT" : "ORGANIZATION",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=450",
      boqGenerated: apiTemplate.boqCount || 0,
      estValue: "₦50M - ₦150M",
      sections: apiTemplate.boqResult?.sections?.map((s) => s.sectionName) || [],
      features: apiTemplate.keyFeatures || [],
      tags: apiTemplate.tags || [],
      templateType:
        apiTemplate.type === "system" ? "System Provided" : "Organization Template",
      lastUpdated: apiTemplate.updatedAt
        ? new Date(apiTemplate.updatedAt).toLocaleDateString()
        : "Aug 15, 2024",
    };
  };

  const uiTemplates = apiResponse?.data?.map(mapApiTemplateToUi) || [];

  const matchesSearch = (template: Template, searchQuery: string) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const searchableContent = [
      template.title,
      template.description,
      template.tags.join(" "),
      template.sections.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableContent.includes(normalizedQuery);
  };

  const systemTemplates = uiTemplates.filter(
    (template) =>
      template.badge === "SYSTEM DEFAULT" &&
      matchesSearch(template, debouncedSystemSearch),
  );

  const organizationTemplates = uiTemplates.filter(
    (template) =>
      template.badge === "ORGANIZATION" &&
      matchesSearch(template, debouncedOrgSearch),
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
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
      ))}
    </div>
  );

  return (
    <div className="space-y-8 bg-muted/30 min-h-screen">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Template</h1>
        <p className="text-muted-foreground text-sm">
          Manage your standard and Organization workflow templates across the
          platform.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "system" | "organization")
        }
        className="space-y-6"
      >
        <TabsList className="bg-transparent p-0 h-auto gap-2 rounded-none">
          <TabsTrigger
            value="system"
            className="h-11 px-4 rounded-lg border border-border/50 bg-card text-muted-foreground shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-primary/10"
          >
            <BookOpen className="w-4 h-4" />
            System Template
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className="h-11 px-4 rounded-lg border border-border/50 bg-card text-muted-foreground shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-primary/10"
          >
            <Building className="w-4 h-4" />
            Organization Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              System Template
            </h2>
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
                    Professional templates created by Quantify pro, optimized
                    for Nigerian construction projects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={systemSearch}
              onChange={(event) => setSystemSearch(event.target.value)}
              placeholder="Search system templates..."
              className="pl-12 h-14 bg-card border-border/50 shadow-sm text-base rounded-xl"
            />
          </div>

          {isLoading ? (
            renderSkeletons()
          ) : systemTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onView={handleOpenModal}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No system templates found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search to find available system templates.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Organizational Template
              </h2>
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </div>
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5 shadow-none">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Organizational Template
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Custom templates created by your team members based on
                    completed projects. Share and reuse proven BOQ structures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={organizationSearch}
              onChange={(event) => setOrganizationSearch(event.target.value)}
              placeholder="Search organization templates..."
              className="pl-12 h-14 bg-card border-border/50 shadow-sm text-base rounded-xl"
            />
          </div>

          {isLoading ? (
            renderSkeletons()
          ) : organizationTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizationTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onView={handleOpenModal}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No organization templates yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first team template to standardize recurring
                  project workflows.
                </p>
                <Button>
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <TemplateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
}
