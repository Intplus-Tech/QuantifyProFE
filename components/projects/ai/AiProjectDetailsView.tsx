"use client";

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
import { useGetClientsQuery } from "@/store/api/clientsApi";
import { setAiDetails } from "@/store/slices/aiFlowSlice";
import type { RootState } from "@/store";
import { AiFlowCard, AiFlowShell } from "./AiFlowShell";

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

export function AiProjectDetailsView({ basePath = "/projects" }: { basePath?: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const details = useSelector((state: RootState) => state.aiFlow.details);

  const { data: clientsRes } = useGetClientsQuery({ limit: 100 });
  const clients = clientsRes?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectTitle: details.projectTitle,
      clientId: details.clientId,
      projectCode: details.projectCode,
      projectType: details.projectType,
      location: details.location,
      currency: details.currency || "NGN",
      description: details.description,
    },
  });

  const onSubmit = (values: FormValues) => {
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
    // TODO: Swap point — create the project server-side here and route on the
    // returned id instead of the local draft id.
    router.push(`${basePath}/ai/draft/drawings`);
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
            <Button type="submit" className="h-10 gap-2">
              Continue to Drawings
              <ArrowRight className="h-4 w-4" />
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
