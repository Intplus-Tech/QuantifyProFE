"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Briefcase,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecurityLogin from "@/components/settings/SecurityLogin";
import ProfessionalDetails from "@/components/settings/ProfessionalDetails";
import BillingPlan from "@/components/settings/BillingPlan";
import HelpSupport from "@/components/settings/HelpSupport";

const tabs = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "security", label: "Security & Login", icon: Shield },
  { id: "professional", label: "Professional Details", icon: Briefcase },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

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
            Manage your account, security, and preferences
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
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "security" && <SecurityLogin />}
        {activeTab === "professional" && <ProfessionalDetails />}
        {activeTab === "billing" && <BillingPlan />}
        {activeTab === "help" && <HelpSupport />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
