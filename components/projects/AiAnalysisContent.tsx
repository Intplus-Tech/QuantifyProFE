"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setNewProjectDraft } from "@/store/slices/projectsSlice";
import { RootState } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { FileType, FileText, Zap, Shield, Sparkles, X, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AddClientDialog } from "@/components/clients/AddClientDialog";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

import { useFileAnalysisUpload } from "@/hooks/useFileAnalysisUpload";
import { useGetClientsQuery } from "@/store/api/clientsApi";

const SUPPORTED_FORMATS = {
  "3D_BIM": [".rvt", ".ifc", ".nwd", ".skp", ".fbx", ".obj"],
  "2D_CAD": [".dwg", ".dxf", ".dgn"],
};

const aiFormSchema = z.object({
  projectTitle: z.string().min(1, "Project Title is required"),
  projectCode: z.string().optional(),
  clientName: z.string().min(1, "Client Name is required"),
  clientId: z.string().min(1, "Please select a client"),
  projectType: z.string().min(1, "Project Type is required"),
  location: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  description: z.string().optional(),
  drawings: z.array(z.any()).min(1, "Please upload a drawing"),
  sourceJobId: z.string().optional(),
  uploadedFileType: z.string().optional(),
  companyId: z.string().optional(),
});

type AiFormValues = z.infer<typeof aiFormSchema>;

interface AiAnalysisContentProps {
  onCancel: () => void;
  onSwitchMode: () => void;
  onSubmitSuccess?: (data: AiFormValues) => void;
  basePath?: string;
}

export function AiAnalysisContent({
  onCancel,
  onSwitchMode,
  onSubmitSuccess,
  basePath = "/projects",
}: AiAnalysisContentProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const { data: clientsRes } = useGetClientsQuery({ limit: 100 });
  const clientsList = clientsRes?.data || [];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AiFormValues>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      projectTitle: "",
      projectCode: "",
      clientName: "",
      clientId: "",
      projectType: "",
      location: "",
      source: "",
      description: "",
      drawings: [],
      sourceJobId: "",
      uploadedFileType: "",
    },
  });

  const { isUploading, uploadProgress, handleUpload } = useFileAnalysisUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);

  const drawings = watch("drawings");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      try {
        setValue("drawings", acceptedFiles, { shouldValidate: true });

        // Build preview relying on the first file
        const firstFile = acceptedFiles[0];
        setPreviewUrl(URL.createObjectURL(firstFile));

        const { projectType, location, description } = getValues();

        const { type, response } = await handleUpload(
          acceptedFiles,
          { projectType, location, description },
          SUPPORTED_FORMATS,
        );

        if (response.success) {
          setValue("uploadedFileType", type);
          const responseData = response.data as any;
          const jobId = responseData?.jobId || responseData?.urn;
          if (jobId) {
            setValue("sourceJobId", jobId);
            toast.success(
              response.message || "File uploaded and processing started.",
            );
          }
        }
      } catch (error) {
        // Error handling is managed inside the hook's toast
        console.error("Upload failed", error);
      }
    },
    [getValues, handleUpload, setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "application/octet-stream": [
        ...SUPPORTED_FORMATS["3D_BIM"],
        ...SUPPORTED_FORMATS["2D_CAD"],
      ],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
  });

  const removeFile = (indexToRemove: number) => {
    setValue(
      "drawings",
      drawings.filter((_, i) => i !== indexToRemove),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: AiFormValues) => {
    // API integration: replace this with a real POST that returns a projectId
    console.log("Form Data:", data);

    // Ensure fileUrl is included in the draft
    const finalData = {
      ...data,
      fileUrl: previewUrl,
      fileName: data.drawings[0]?.name || "drawing.file",
      companyId:
        currentUser?.role === "company" || currentUser?._id
          ? currentUser._id
          : currentUser?._id,
    };

    dispatch(setNewProjectDraft(finalData));
    toast.success("Project information saved as draft.");
    const mockProjectId = crypto.randomUUID();
    onSubmitSuccess?.(data);
    // Navigate to the processing page
    router.push(`${basePath}/${mockProjectId}/processing`);
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
      <DialogHeader className="shrink-0 px-6 py-5 pb-4 text-center border-b border-border/50 bg-muted/10">
        <DialogTitle className="text-xl font-bold">
          AI-Powered Drawing Analysis
        </DialogTitle>
        <DialogDescription className="text-center text-sm pt-1.5">
          Upload your project drawings to automatically generate cost estimates
          and detailed Bills of Quantities.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <form
          id="ai-analysis-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Project Information Section */}
          <div className="border rounded-xl p-5 bg-card text-card-foreground shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-base mb-1">
                Project Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Basic identity and physical location of the site.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Project Title</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("projectTitle")}
                    placeholder="e.g. Skyline Residency - Phase 2"
                    className="h-12"
                  />
                </FieldContent>
                <FieldError
                  errors={[{ message: errors.projectTitle?.message }]}
                />
              </Field>

              <Field>
                <FieldLabel>Project Code / Reference</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("projectCode")}
                    placeholder="PRJ-2024-001"
                    className="h-12"
                  />
                </FieldContent>
                <FieldError
                  errors={[{ message: errors.projectCode?.message }]}
                />
              </Field>

              <Field>
                <FieldLabel>Client Name</FieldLabel>
                <FieldContent className="text-card-foreground!">
                  <Controller
                    control={control}
                    name="clientId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => {
                          if (val === "ADD_NEW") {
                            setIsAddClientDialogOpen(true);
                            return;
                          }
                          field.onChange(val);
                          const client = clientsList.find((c) => c._id === val);
                          if (client) {
                            setValue("clientName", client.name);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-12! py-3! w-full">
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientsList.length === 0 ? (
                            <SelectItem value="ADD_NEW" className="text-amber-600 font-medium focus:text-amber-700">
                              <Plus className="w-4 h-4 mr-2 inline" />
                              Add New Client
                            </SelectItem>
                          ) : (
                            <>
                              {clientsList.map((client) => (
                                <SelectItem key={client._id} value={client._id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                              <SelectItem value="ADD_NEW" className="text-amber-600 font-medium border-t mt-1 focus:text-amber-700">
                                <Plus className="w-4 h-4 mr-2 inline" />
                                Add New Client
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
                <FieldError
                  errors={[
                    {
                      message:
                        errors.clientId?.message || errors.clientName?.message,
                    },
                  ]}
                />
              </Field>

              <Field>
                <FieldLabel>Project Type</FieldLabel>
                <FieldContent className="text-card-foreground!">
                  <Controller
                    control={control}
                    name="projectType"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-12! py-3! w-full">
                          <SelectValue placeholder="Select Project Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High-Rise Residential">
                            High-Rise Residential
                          </SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Infrastructure">
                            Infrastructure
                          </SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
                <FieldError
                  errors={[{ message: errors.projectType?.message }]}
                />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Project Location (Address)</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("location")}
                    placeholder="123 Construction Ave, Midtown..."
                    className="h-12"
                  />
                </FieldContent>
                <FieldError errors={[{ message: errors.location?.message }]} />
              </Field>

              <Field>
                <FieldLabel>Source</FieldLabel>
                <FieldContent className="text-card-foreground!">
                  <Controller
                    control={control}
                    name="source"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-12! py-3! w-full">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf_boq">PDF/BOQ</SelectItem>
                          <SelectItem value="bim">BIM</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldContent>
                <FieldError errors={[{ message: errors.source?.message }]} />
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("description")}
                    placeholder="Project description or notes"
                    className="h-12"
                  />
                </FieldContent>
                <FieldError
                  errors={[{ message: errors.description?.message }]}
                />
              </Field>
            </div>
          </div>

          {/* Drawings Section */}
          <div className="border rounded-xl p-5 bg-card text-card-foreground shadow-sm">

            <div
              {...getRootProps({
                className: `relative overflow-hidden mt-2 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-primary"
                    : "border-border/60 hover:border-primary/50"
                }`,
              })}
            >
              <input {...getInputProps()} />
              {/* Mesh Gradient Background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl opacity-80 dark:opacity-40">
                <div className="absolute -left-1/4 -top-1/4 w-3/4 h-[150%] bg-sky-300/30 blur-[80px] rounded-full"></div>
                <div className="absolute -right-1/4 -bottom-1/4 w-3/4 h-[150%] bg-orange-300/30 blur-[80px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-[120%] bg-amber-100/40 blur-[60px] rounded-full"></div>
              </div>

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <div className="flex justify-center gap-5 mb-5">
                  <div className="flex flex-col items-center justify-center p-3 w-[72px] h-[72px] bg-background/90 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <FileType className="w-7 h-7 text-amber-500 mb-1.5" />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      .CAD
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 w-[72px] h-[72px] bg-background/90 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <FileText className="w-7 h-7 text-amber-500 mb-1.5" />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      .PDF
                    </span>
                  </div>
                </div>

                <h4 className="text-xl font-bold text-foreground mb-1.5 drop-shadow-sm">
                  {isUploading
                    ? `Uploading... ${uploadProgress}%`
                    : "Drag and drop your drawing here"}
                </h4>
                {isUploading && (
                  <div className="w-full max-w-xs mt-2 mb-4">
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-amber-100"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-8">
                  {isUploading ? (
                    "Please wait while we process the upload."
                  ) : (
                    <>
                      Or{" "}
                      <span className="text-amber-500 font-semibold hover:text-amber-600 transition-colors">
                        browse files
                      </span>{" "}
                      from your computer
                    </>
                  )}
                </p>

                <div className="inline-flex items-center justify-center bg-background/70 backdrop-blur-md border rounded-full px-5 py-2 text-xs text-foreground font-medium shadow-xs">
                  <Sparkles className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                  Supported formats: .cad, .pdf, .rvt (Max 30MB)
                </div>
              </div>
            </div>

            {/* Error for missing files */}
            {errors.drawings && (
              <p className="text-destructive text-sm mt-3">
                {errors.drawings.message?.toString()}
              </p>
            )}

            {/* List of selected files */}
            {drawings.length > 0 && (
              <div className="mt-4 space-y-2">
                {drawings.map((file: File, index: number) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      type="button"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
          <div className="flex gap-3 border rounded-lg p-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[10px] font-bold tracking-wider uppercase mb-1">
                Auto-Quantities
              </h5>
              <p className="text-xs text-muted-foreground">
                AI identifies wall types, floor areas, and fixture counts
                automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-3 border rounded-lg p-3">
            <FileText className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[10px] font-bold tracking-wider uppercase mb-1">
                BOQ Export
              </h5>
              <p className="text-xs text-muted-foreground">
                Generated estimates are compatible with Excel, and Pdf.
              </p>
            </div>
          </div>
          <div className="flex gap-3 border rounded-lg p-3">
            <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[10px] font-bold tracking-wider uppercase mb-1">
                Secure Storage
              </h5>
              <p className="text-xs text-muted-foreground">
                All drawings are encrypted and stored in SOC2 compliant servers.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center mb-2">
          <span className="text-sm text-muted-foreground">
            Switch to{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-amber-500 font-medium hover:underline"
            >
              Manual Entry Mode
            </button>
          </span>
        </div>
      </div>

      <div className="shrink-0 p-6 py-4 border-t border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center text-sm text-muted-foreground w-full sm:w-auto">
          <Sparkles className="w-4 h-4 mr-2" />
          AI analysis takes approx. 30-60 seconds per sheet
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="ai-analysis-form"
            disabled={isSubmitting || isUploading}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm border border-amber-600/20"
          >
            <Zap className="w-4 h-4 mr-2 fill-current" />
            Process with AI
          </Button>
        </div>
      </div>
      {isAddClientDialogOpen && (
        <AddClientDialog
          open={isAddClientDialogOpen}
          onOpenChange={setIsAddClientDialogOpen}
          onSuccess={(client) => {
            setValue("clientId", client._id);
            setValue("clientName", client.name);
          }}
        />
      )}
    </DialogContent>
  );
}
