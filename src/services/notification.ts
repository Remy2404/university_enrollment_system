import { createClient } from "@/src/lib/supabase/client";
import type { Notification } from "@/src/types";
import { requireData, throwIfError } from "./supabase-helpers";

const notificationTypes = new Set<Notification["type"]>(["success", "info", "warning", "error"]);

function mapNotification(row: {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: notificationTypes.has(row.type as Notification["type"]) ? (row.type as Notification["type"]) : "info",
    read: row.is_read,
    createdAt: row.created_at,
  };
}

export const notificationService = {
  getAll: async () => {
    const { data, error } = await createClient().from("notifications").select("*").order("created_at", { ascending: false });
    throwIfError(error, "Failed to load notifications");
    return (data ?? []).map(mapNotification);
  },
  getByUserId: async (userId: string) => {
    const { data, error } = await createClient()
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    throwIfError(error, "Failed to load notifications");
    return (data ?? []).map(mapNotification);
  },
  create: async (notification: Omit<Notification, "id">) => {
    const { data, error } = await createClient()
      .from("notifications")
      .insert({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.read,
      })
      .select()
      .single();
    throwIfError(error, "Failed to create notification");
    return mapNotification(requireData(data, "Failed to create notification"));
  },
  update: async (id: string, updates: Partial<Notification>) => {
    const { data, error } = await createClient()
      .from("notifications")
      .update({
        title: updates.title,
        message: updates.message,
        type: updates.type,
        is_read: updates.read,
      })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "Failed to update notification");
    return mapNotification(requireData(data, "Failed to update notification"));
  },
  delete: async (id: string) => {
    const { error } = await createClient().from("notifications").delete().eq("id", id);
    throwIfError(error, "Failed to delete notification");
  },
  markAsRead: async (id: string) => notificationService.update(id, { read: true }),
  markAllAsRead: async (userId: string) => {
    const { error } = await createClient().from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    throwIfError(error, "Failed to mark notifications as read");
  },
};
