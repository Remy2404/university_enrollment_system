"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Globe,
  Save,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    applicationUpdates: true,
    documentAlerts: true,
  });

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedUser = localStorage.getItem("ues_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      
      // Load saved preferences
      const savedSettings = localStorage.getItem(`ues_settings_${user.id}`);
      if (savedSettings) {
        const { preferences: savedPrefs, language: savedLang } = JSON.parse(savedSettings);
        if (savedPrefs) setPreferences(savedPrefs);
        if (savedLang) setLanguage(savedLang);
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    // Simulate a brief delay for realistic action feedback
    await new Promise((r) => setTimeout(r, 400));

    try {
      localStorage.setItem(
        `ues_settings_${userId}`,
        JSON.stringify({ preferences, language })
      );
      toast.success("Settings saved successfully.");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-navy" />
          Settings
        </h1>
        <p className="text-sm text-slate-gray mt-1">
          Manage your notification preferences and account configurations
        </p>
      </div>

      {/* Notification Preferences */}
      <BentoCard>
        <h3 className="text-lg font-bold text-academic-blue mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-navy" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "emailNotifications" as const,
              icon: Mail,
              title: "Email Notifications",
              desc: "Receive enrollment updates and reminders via email",
            },
            {
              key: "smsNotifications" as const,
              icon: MessageSquare,
              title: "SMS Notifications",
              desc: "Get urgent alerts and status changes via text message",
            },
            {
              key: "applicationUpdates" as const,
              icon: Shield,
              title: "Application Status Updates",
              desc: "Notifications when your application status changes",
            },
            {
              key: "documentAlerts" as const,
              icon: Shield,
              title: "Document Verification Alerts",
              desc: "Alerts when uploaded documents are reviewed or rejected",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-bento-sm border border-[#E2E8F0] bg-[#F8FAFC]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-soft-blue text-primary-navy mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-academic-blue">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-gray mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[item.key]}
                  onClick={() => togglePref(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:ring-offset-2 ${
                    preferences[item.key]
                      ? "bg-primary-navy"
                      : "bg-[#E2E8F0]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                      preferences[item.key]
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </BentoCard>

      {/* Language Preference */}
      <BentoCard>
        <h3 className="text-lg font-bold text-academic-blue mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-navy" />
          Language Preference
        </h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full max-w-xs h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
        >
          <option value="en">English</option>
          <option value="km">ភាសាខ្មែរ (Khmer)</option>
        </select>
        <p className="text-xs text-cool-gray mt-2">
          This setting changes the display language of the enrollment portal.
        </p>
      </BentoCard>

      {/* Save Action */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          <Save className="w-4 h-4 mr-1.5" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
