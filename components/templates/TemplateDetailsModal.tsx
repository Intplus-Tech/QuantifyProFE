import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Copy, Calendar, Sparkles, Trash2, Loader2 } from "lucide-react";
import type { Template } from "@/components/templates/mock-data";
import { useGetTemplateByIdQuery, useDeleteTemplateMutation } from "@/store/api/templatesApi";
import { toast } from "sonner";
import { Home, Building2, Factory, ShoppingBag, Hotel } from "lucide-react";

export type TemplateDetails = Template;

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDetails | null;
  onApply?: (template: TemplateDetails) => void;
  onDeleteSuccess?: () => void;
}

export function TemplateDetailsModal({
  isOpen,
  onClose,
  template: initialTemplate,
  onApply,
  onDeleteSuccess
}: TemplateDetailsModalProps) {
  const { data: apiResponse, isLoading, isFetching } = useGetTemplateByIdQuery(
    initialTemplate?.id as string, 
    { skip: !isOpen || !initialTemplate?.id }
  );
  
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const handleRemove = async () => {
     if (!initialTemplate?.id) return;
     try {
       await deleteTemplate(initialTemplate.id as string).unwrap();
       toast.success("Template deleted successfully");
       onClose();
       if (onDeleteSuccess) {
         onDeleteSuccess();
       }
     } catch (error: any) {
       toast.error(error?.data?.message || "Failed to delete template");
     }
  };

  const apiData = apiResponse?.data;
  
  const mapApiTemplateToUi = (apiData: any): Template => {
    const iconMap: Record<string, any> = {
      "🏠": Home,
      "🏢": Building2,
      "🏭": Factory,
      "🛍️": ShoppingBag,
      "🏨": Hotel,
    };
    return {
      id: apiData._id,
      title: apiData.name,
      description: apiData.description,
      icon: iconMap[apiData.icon] || Home,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      openedAt: apiData.updatedAt
        ? `updated ${new Date(apiData.updatedAt).toLocaleDateString()}`
        : "recently opened",
      team: [{ avatar: `https://i.pravatar.cc/150?u=${apiData._id}`, initials: apiData.name.substring(0, 2).toUpperCase() }],
      extraUsers: "+0",
      badge: apiData.type === "system" ? "SYSTEM DEFAULT" : "ORGANIZATION",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=450",
      boqGenerated: apiData.boqCount || 0,
      estValue: "₦50M - ₦150M",
      sections: apiData.boqResult?.sections?.map((s: any) => s.sectionName) || [],
      features: apiData.keyFeatures || [],
      tags: apiData.tags || [],
      templateType: apiData.type === "system" ? "System Provided" : "Organization Template",
      lastUpdated: apiData.updatedAt ? new Date(apiData.updatedAt).toLocaleDateString() : "Aug 15, 2024",
    };
  };

  const template = apiData ? mapApiTemplateToUi(apiData) : initialTemplate;

  if (!template && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl p-0 overflow-hidden gap-0 bg-card border-none shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{template?.title ?? "Template details"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto w-full relative bg-background">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0 pr-8">
              {isLoading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                <>
                  <DialogTitle className="text-lg font-bold text-foreground truncate">
                    {template?.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="border-primary/40 text-primary bg-primary/10 uppercase text-[10px] font-bold tracking-wider shrink-0"
                  >
                    {template?.badge || "SYSTEM DEFAULT"}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Hero Image */}
                {isLoading ? (
                  <Skeleton className="w-full aspect-video rounded-2xl" />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-2xl overflow-hidden border border-border relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={template?.image}
                      alt={template?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                    </>
                  ) : (
                    <>
                      <Card className="shadow-none border border-border rounded-xl overflow-hidden bg-primary/5">
                        <CardContent className="p-5 flex flex-col gap-1">
                          <Copy className="w-5 h-5 text-primary mb-2" />
                          <div className="text-2xl font-bold text-foreground">
                            {template?.boqGenerated}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            BOQ Generated
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border border-border rounded-xl overflow-hidden bg-card">
                        <CardContent className="p-5 flex flex-col gap-1">
                          <svg
                            className="w-5 h-5 text-primary mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-2xl font-bold text-foreground">
                            {template?.estValue}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            Est. Value
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* BOQ Sections */}
                <div className="space-y-4">
                  {isLoading ? (
                    <Skeleton className="h-6 w-40" />
                  ) : (
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                      BOQ Sections ({template?.sections?.length || 0})
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 rounded-lg" />
                        ))
                      : template?.sections?.map((section, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm text-foreground font-medium">
                              {section}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Key Features */}
                  <div className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-6 w-32" />
                    ) : (
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Key Features
                      </h3>
                    )}
                    <ul className="space-y-3">
                      {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 w-full" />
                          ))
                        : template?.features?.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="leading-snug">{feature}</span>
                            </li>
                          ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Tags
                      </h3>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-16 rounded-full" />
                          ))
                        : template?.tags?.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-muted text-muted-foreground hover:bg-muted/80 border-none font-medium text-xs px-2.5 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-4">
                {isLoading ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full shadow-sm h-12 rounded-xl text-base font-semibold"
                      onClick={() => {
                        if (template) onApply?.(template);
                        onClose();
                      }}
                    >
                      Use Template
                    </Button>
                    
                    {template?.badge !== "SYSTEM DEFAULT" && (
                      <Button
                        variant="destructive"
                        className="w-full shadow-sm h-12 rounded-xl text-base font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-none"
                        onClick={handleRemove}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 mr-2" />}
                        {isDeleting ? "Deleting..." : "Delete Template"}
                      </Button>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <Card className="shadow-sm border border-border rounded-xl overflow-hidden bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 text-primary">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L2 12h3v8h14v-8h3L12 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium mb-0.5">
                          Template Type
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {template?.templateType}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isLoading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : (
                  <Card className="shadow-sm border border-border rounded-xl overflow-hidden bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium mb-0.5">
                          Last Updated
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {template?.lastUpdated}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isLoading ? (
                  <Skeleton className="h-32 w-full rounded-xl" />
                ) : (
                  <Card className="shadow-sm border border-primary/20 rounded-xl overflow-hidden bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                          Smart Template
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Professional templates created by Quantify pro,
                        optimized for Nigerian construction projects.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
