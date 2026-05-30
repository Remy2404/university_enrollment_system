import { createClient } from "@/src/lib/supabase/client";
import { throwIfError } from "./supabase-helpers";

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  applicationUpdates: boolean;
  documentAlerts: boolean;
  language: "en" | "km";
}

const defaults: UserPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  applicationUpdates: true,
  documentAlerts: true,
  language: "en",
};

export const settingsService = {
  getByUserId: async (userId: string): Promise<UserPreferences> => {
    const { data, error } = await createClient().from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
    throwIfError(error, "Failed to load settings");
    if (!data) return defaults;

    return {
      emailNotifications: data.email_notifications,
      smsNotifications: data.sms_notifications,
      applicationUpdates: data.application_updates,
      documentAlerts: data.document_alerts,
      language: data.language === "km" ? "km" : "en",
    };
  },
  save: async (userId: string, preferences: UserPreferences) => {
    const { error } = await createClient()
      .from("user_preferences")
      .upsert({
        user_id: userId,
        email_notifications: preferences.emailNotifications,
        sms_notifications: preferences.smsNotifications,
        application_updates: preferences.applicationUpdates,
        document_alerts: preferences.documentAlerts,
        language: preferences.language,
        updated_at: new Date().toISOString(),
      });
    throwIfError(error, "Failed to save settings");
  },
};
