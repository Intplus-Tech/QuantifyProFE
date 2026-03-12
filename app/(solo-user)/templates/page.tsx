"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  BookOpen,
} from "lucide-react";
import { mockTemplates, type Template } from "@/components/templates/mock-data";
import { TemplateDetailsModal } from "@/components/templates/TemplateDetailsModal";
import { TemplateCard } from "@/components/templates/TemplateCard";

export default function TemplatesPage() {
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
          placeholder="Search material description..."
          className="pl-12 h-14 bg-card border-border/50 shadow-sm text-base rounded-xl"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
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
