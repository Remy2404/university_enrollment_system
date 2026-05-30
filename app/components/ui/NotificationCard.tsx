"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  Circle,
} from "lucide-react";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-success-light",
    iconColor: "text-success-green",
    border: "border-l-success-green",
  },
  info: {
    icon: Info,
    iconBg: "bg-soft-blue",
    iconColor: "text-primary-navy",
    border: "border-l-primary-navy",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning-light",
    iconColor: "text-warning-amber",
    border: "border-l-warning-amber",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-error-light",
    iconColor: "text-error-red",
    border: "border-l-error-red",
  },
};

export function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={twMerge(
        clsx(
          "flex items-start gap-4 p-4 rounded-bento bg-white border border-[#E2E8F0] border-l-4 transition-all duration-200",
          config.border,
          !notification.read && "bg-soft-blue/20 shadow-xs",
          notification.read && "opacity-75"
        )
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          config.iconBg
        )}
      >
        <Icon className={clsx("w-5 h-5", config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={clsx(
              "text-sm font-semibold text-academic-blue truncate",
              !notification.read && "font-bold"
            )}
          >
            {notification.title}
          </h3>
          {!notification.read && (
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary-navy" />
          )}
        </div>
        <p className="text-sm text-slate-gray mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-2">
          <time className="text-xs text-cool-gray">
            {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </time>
          {!notification.read && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs font-medium text-primary-navy hover:underline"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
