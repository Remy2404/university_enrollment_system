"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Inbox } from "lucide-react";
import { NotificationCard } from "../../components/ui/NotificationCard";
import { LoadingState, EmptyState } from "../../components/ui/States";
import { notificationService } from "@/src/services/notification";
import { useAuth } from "@/src/providers/auth-provider";
import type { Notification } from "@/src/types";

type FilterTab = "all" | "unread" | "success" | "info" | "warning";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "success", label: "Application" },
  { key: "info", label: "System" },
  { key: "warning", label: "Documents" },
];

export default function StaffNotificationsPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  async function fetchNotifications(uid: string) {
    try {
      setNotifications(await notificationService.getByUserId(uid));
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => void fetchNotifications(user.id), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthLoading, router, user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read.");
    } catch {
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success(`${unread.length} notifications marked as read.`);
    } catch {
      toast.error("Failed to update notifications.");
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-navy" />
            Notifications
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-primary-navy hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-full border transition-colors ${
              activeFilter === tab.key
                ? "bg-primary-navy text-white border-primary-navy"
                : "bg-white text-slate-gray border-[#E2E8F0] hover:bg-slate-50"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-error-red text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingState rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications found"
          description={
            activeFilter === "all"
              ? "You don't have any notifications yet. Alerts will appear here when student applications are updated or submitted."
              : `No ${activeFilter} notifications to display.`
          }
          icon={Inbox}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
