import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { Notification } from "../types";

export const notificationService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<Notification[]>("/notifications", options);
  },
  getByUserId: (userId: string, options?: ApiQueryOptions) => {
    return apiClient.get<Notification[]>("/notifications", {
      ...options,
      filters: {
        ...options?.filters,
        userId,
      },
      sort: options?.sort || "-createdAt",
    });
  },
  create: (notification: Omit<Notification, "id">) => {
    const data = {
      ...notification,
      id: `notif-${Date.now()}`,
    };
    return apiClient.post<Notification>("/notifications", data);
  },
  update: (id: string, updates: Partial<Notification>) => {
    return apiClient.patch<Notification>(`/notifications/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/notifications/${id}`);
  },
  markAsRead: (id: string) => {
    return apiClient.patch<Notification>(`/notifications/${id}`, { read: true });
  },
};
