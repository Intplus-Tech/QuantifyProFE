"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  Building2,
  Users,
  Shield,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import EnterpriseOrganizationSettings from "@/components/settings/EnterpriseOrganizationSettings";
import EnterpriseTeamManagement from "@/components/settings/EnterpriseTeamManagement";
import EnterpriseRolesPermissions from "@/components/settings/EnterpriseRolesPermissions";
import EnterpriseBillingPlan from "@/components/settings/EnterpriseBillingPlan";
import EnterpriseHelpSupport from "@/components/settings/EnterpriseHelpSupport";

const tabs = [
  { id: "company", label: "Company Settings", icon: Building2 },
  { id: "profile", label: "My Profile", icon: Users },
  { id: "security", label: "Security & Access", icon: Shield },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "support", label: "Support", icon: HelpCircle },
];

export default function EnterpriseSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "company";

  function setActiveTab(id: string) {
    router.replace(`?tab=${id}`, { scroll: false });
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your enterprise account and team members.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "company" && <EnterpriseOrganizationSettings />}
        {activeTab === "profile" && <EnterpriseTeamManagement />}
        {activeTab === "security" && <EnterpriseRolesPermissions />}
        {activeTab === "billing" && <EnterpriseBillingPlan />}
        {activeTab === "support" && <EnterpriseHelpSupport />}
      </div>
    </div>
  );
}
