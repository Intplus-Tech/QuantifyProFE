"use client";

import { useState } from "react";
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, security, and preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/30 pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative ${
                isActive
                  ? "bg-orange-50 text-orange-600 border border-b-0 border-orange-200"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
      </div>
    </div>
  );
}
