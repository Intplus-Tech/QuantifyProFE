"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Coins, RefreshCw, ShieldAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddCreditsMutation,
  useGetCreditsBalanceQuery,
  useGetCreditsHistoryQuery,
  useGetCreditsPricingQuery,
  useGetCreditsUsageQuery,
  useGetCreditsUsageByProviderQuery,
} from "@/store/api/creditsApi";
import type { RootState } from "@/store";
import { apiMessage, describeApiError } from "@/utils/apiError";

/**
 * AI credits: balance, history, pricing and usage, plus the admin allocation
 * call. `POST /credits/add` is also what creates a missing credit account —
 * without one, every AI takeoff page analysis is refused up front.
 */
export function AiCreditsPanel() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const balance = useGetCreditsBalanceQuery();
  const history = useGetCreditsHistoryQuery();
  const pricing = useGetCreditsPricingQuery();
  const usage = useGetCreditsUsageQuery();
  const byProvider = useGetCreditsUsageByProviderQuery();

  const [addCredits, { isLoading: isAdding }] = useAddCreditsMutation();

  const [userId, setUserId] = useState(currentUser?._id ?? "");
  const [amount, setAmount] = useState("500");

  const missingAccount =
    balance.isError &&
    ((balance.error as { status?: number } | undefined)?.status === 404 ||
      /credit account/i.test(describeApiError(balance.error, "")));

  const handleAdd = async () => {
    if (!userId.trim() || !Number(amount)) {
      toast.error("A user id and a credit amount are both required.");
      return;
    }

    try {
      const response = await addCredits({
        userId: userId.trim(),
        amount: Number(amount),
        type: "allocation",
        description: "Manual allocation from settings",
      }).unwrap();

      toast.success(apiMessage(response, "Credits added successfully."));
      void balance.refetch();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(
        status === 403 ? "Admin role required" : "Could not add credits",
        {
          description:
            status === 403
              ? "This account is not an admin, so it cannot allocate credits. Ask whoever owns the backend to run POST /credits/add."
              : describeApiError(error, "Please try again."),
        },
      );
    }
  };

  const stat = (label: string, value: string | number | undefined) => (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
        {value ?? "—"}
      </p>
    </div>
  );

  const data = balance.data?.data;

  return (
    <section className="space-y-5">
      <header className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-slate-900">AI Credits</h2>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 gap-1.5 text-[11px]"
          onClick={() => void balance.refetch()}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${balance.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {missingAccount && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-xs leading-relaxed text-amber-900">
            <p className="font-medium">No credit account exists for this user.</p>
            <p className="mt-1">
              AI takeoff reserves credits before each page analysis, so extraction
              is refused until one exists. Allocating credits below creates it —
              which requires an admin account.
            </p>
          </div>
        </div>
      )}

      {balance.isError && !missingAccount && (
        <p className="text-xs text-red-600">
          {describeApiError(balance.error, "Could not read the credit balance.")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat("Available", data?.available ?? data?.balance)}
        {stat("Total", data?.total)}
        {stat("Used", data?.used)}
        {stat("Reserved", data?.reserved)}
      </div>

      {/* Admin allocation — also provisions a missing account */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Allocate credits (admin)
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[240px] flex-1 text-xs text-slate-600">
            User ID
            <Input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="65a1b2c3d4e5f6a7b8c9d0e1"
              className="mt-1 h-9 font-mono text-xs"
            />
          </label>
          <label className="w-32 text-xs text-slate-600">
            Amount
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 h-9 text-xs tabular-nums"
            />
          </label>
          <Button className="h-9" onClick={handleAdd} disabled={isAdding}>
            {isAdding ? "Adding…" : "Add credits"}
          </Button>
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Defaults to your own user id. Returns 403 unless the signed-in account
          has the admin role.
        </p>
      </div>

      {/* Pricing / usage — read-only diagnostics */}
      <div className="grid gap-3 lg:grid-cols-3">
        <DiagnosticCard
          title="Pricing"
          empty="No pricing returned"
          rows={(pricing.data?.data ?? []).map((p) => ({
            label: p.name ?? p.id,
            value: `${p.credits} credits`,
          }))}
        />
        <DiagnosticCard
          title="Usage by operation"
          empty="No usage yet"
          rows={(usage.data?.data ?? []).map((u, index) => ({
            label: String(u.operationType ?? `#${index + 1}`),
            value: String(u.credits ?? u.count ?? "—"),
          }))}
        />
        <DiagnosticCard
          title="Usage by provider"
          empty="No usage yet"
          rows={(byProvider.data?.data ?? []).map((u, index) => ({
            label: String(u.provider ?? `#${index + 1}`),
            value: String(u.credits ?? u.count ?? "—"),
          }))}
        />
      </div>

      <DiagnosticCard
        title="Recent transactions"
        empty="No transactions yet"
        rows={(history.data?.data ?? []).slice(0, 8).map((h) => ({
          label: h.feature ?? h.id,
          value: String(h.amount),
        }))}
      />
    </section>
  );
}

function DiagnosticCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; value: string }[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.map((row, index) => (
            <li
              key={`${row.label}-${index}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="min-w-0 truncate text-slate-600">{row.label}</span>
              <span className="shrink-0 tabular-nums font-medium text-slate-900">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
