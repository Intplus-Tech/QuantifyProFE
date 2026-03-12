"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Building,
  Plus,
} from "lucide-react";
import { mockTemplates, type Template } from "@/components/templates/mock-data";
import { TemplateDetailsModal } from "@/components/templates/TemplateDetailsModal";
import { TemplateCard } from "@/components/templates/TemplateCard";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"system" | "organization">(
    "system",
  );
  const [systemSearch, setSystemSearch] = useState("");
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    if (selectedTemplate?.id === template.id) {
      setIsModalOpen(false);
      setSelectedTemplate(null);
    }
  };

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

  const systemTemplates = templates.filter(
    (template) =>
      template.badge === "SYSTEM DEFAULT" && matchesSearch(template, systemSearch),
  );

  const organizationTemplates = templates.filter(
    (template) =>
      template.badge === "ORGANIZATION" &&
      matchesSearch(template, organizationSearch),
  );

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
            <h2 className="text-xl font-bold text-foreground">System Template</h2>
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

          {systemTemplates.length > 0 ? (
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

          {organizationTemplates.length > 0 ? (
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
                  Create your first team template to standardize recurring project workflows.
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
