"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useGetClientsQuery } from "@/store/api/clientsApi";
import { useCreateProjectMutation } from "@/store/api/projectsApi";
import {
  clearAiDetails,
  setAiDetails,
  setAiProjectId,
} from "@/store/slices/aiFlowSlice";
import { apiMessage, describeApiError, isValidObjectId } from "@/utils/apiError";
import type { RootState } from "@/store";
import { AiFlowCard, AiFlowShell } from "./AiFlowShell";

/** UI label → backend enum, matching the manual wizard's mapping. */
function toProjectType(uiValue: string): string {
  const map: Record<string, string> = {
    Residential: "residential",
    Commercial: "commercial",
    Infrastructure: "infrastructure",
    Industrial: "industrial",
    "Mixed Use": "mixed_use",
    Institutional: "institutional",
  };
  return map[uiValue] ?? uiValue.toLowerCase().replace(/[\s-]+/g, "_");
}

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Infrastructure",
  "Mixed Use",
  "Institutional",
];

const CURRENCIES = [
  { code: "NGN", label: "₦ Naira (NGN)" },
  { code: "USD", label: "$ Dollar (USD)" },
  { code: "GBP", label: "£ Pound (GBP)" },
  { code: "EUR", label: "€ Euro (EUR)" },
];

const schema = z.object({
  projectTitle: z.string().min(1, "Project name is required"),
  clientId: z.string().min(1, "Select a client"),
  projectCode: z.string().optional(),
  projectType: z.string().min(1, "Project type is required"),
  location: z.string().optional(),
  currency: z.string().min(1),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const BLANK_FORM: FormValues = {
  projectTitle: "",
  clientId: "",
  projectCode: "",
  projectType: "",
  location: "",
  currency: "NGN",
  description: "",
};

export function AiProjectDetailsView({ basePath = "/projects" }: { basePath?: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const { data: clientsRes } = useGetClientsQuery({ limit: 100 });
  const clients = clientsRes?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // /ai/new always starts a *new* project, so the form never seeds itself
    // from the previous one. Redux keeps the details for the report headings,
    // and sessionStorage keeps Redux, so reading either one back into the form
    // is what left the last project's name, client and address sitting here.
    defaultValues: BLANK_FORM,
  });

  useEffect(() => {
    // Clear the persisted copy too, otherwise a hard refresh on this route
    // rehydrates the old details straight back out of sessionStorage.
    dispatch(clearAiDetails());
    reset(BLANK_FORM);
    // Mount only: re-running on every dispatch would wipe the user's typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Step 1 of the documented flow — create the project, because the takeoff
   * session hangs off a real projectId. If creation fails the flow still
   * continues on the local `draft` id so the screens stay walkable; the AI
   * calls then stay dormant until a session can be opened.
   */
  const onSubmit = async (values: FormValues) => {
    const client = clients.find((c) => c._id === values.clientId);
    dispatch(
      setAiDetails({
        ...values,
        projectCode: values.projectCode ?? "",
        location: values.location ?? "",
        description: values.description ?? "",
        clientName: client?.name ?? "",
      }),
    );

    try {
      const response = await createProject({
        name: values.projectTitle,
        description: values.description || undefined,
        // `source`, `processingMode` and `name` are the API's required trio.
        // AI takeoff writes into the same MeasurementSession records the
        // manual canvas uses, so the source is the drawing, and processingMode
        // is what marks the project as AI-driven.
        source: "manual-drawn",
        processingMode: "ai",
        clientId: values.clientId || undefined,
        clientName: client?.name || undefined,
        projectCode: values.projectCode || undefined,
        projectType: values.projectType ? toProjectType(values.projectType) : undefined,
        projectLocation: values.location || undefined,
        currency: values.currency || undefined,
        companyId: currentUser?._id || undefined,
      } as Parameters<typeof createProject>[0]).unwrap();

      // POST /projects answers with the bare Project, while GET wraps it in
      // { success, data }. Accept either rather than silently losing the id.
      const wrapped = response as unknown as { data?: { _id?: string }; _id?: string };
      const createdId = wrapped.data?._id ?? wrapped._id;

      if (!isValidObjectId(createdId)) {
        toast.error("Could not create the project", {
          description: "The server did not return a project id. Please try again.",
        });
        return;
      }

      dispatch(setAiProjectId(createdId));
      toast.success(apiMessage(response, "Project created successfully."), {
        description: values.projectTitle,
      });
      // Leave a clean form behind. `reset()` with no argument restores the
      // defaultValues, which are seeded from Redux — and Redux is persisted to
      // sessionStorage — so the values have to be cleared in all three places.
      dispatch(clearAiDetails());
      reset(BLANK_FORM);
      router.push(`${basePath}/ai/${createdId}/drawings`);
    } catch (error) {
      // Staying put is deliberate: continuing on a placeholder id makes every
      // downstream call fail with "Invalid project ID" far from the cause.
      toast.error("Could not create the project", {
        description: describeApiError(error, "Please check the form and try again."),
      });
    }
  };

  return (
    <AiFlowShell backHref={basePath}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AiFlowCard
          title="Project Details"
          description="Tell us about the project before we analyse your drawings. These details appear on every report the AI generates."
          action={
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </span>
          }
          footer={
            <Button type="submit" className="h-10 gap-2" disabled={isCreatingProject}>
              {isCreatingProject ? "Creating project…" : "Continue to Drawings"}
              {!isCreatingProject && <ArrowRight className="h-4 w-4" />}
            </Button>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormRow label="Project Name" required error={errors.projectTitle?.message}>
              <Input
                {...register("projectTitle")}
                placeholder="Proposed Residential Development"
              />
            </FormRow>

            <FormRow label="Client" required error={errors.clientId?.message}>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 && (
                        <div className="px-2 py-3 text-xs text-slate-400">
                          No clients yet — add one from the Clients page.
                        </div>
                      )}
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <FormRow label="Project ID / Ref">
              <Input {...register("projectCode")} placeholder="EX-204-London" />
            </FormRow>

            <FormRow label="Project Type" required error={errors.projectType?.message}>
              <Controller
                control={control}
                name="projectType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <FormRow label="Site Address">
              <Input
                {...register("location")}
                placeholder="Plot 21, Block 107, Lekki Peninsula"
              />
            </FormRow>

            <FormRow label="Currency">
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormRow>

            <div className="sm:col-span-2">
              <FormRow label="Description">
                <Textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Scope notes, procurement route, anything the estimate should account for."
                />
              </FormRow>
            </div>
          </div>
        </AiFlowCard>
      </form>
    </AiFlowShell>
  );
}

function FormRow({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
