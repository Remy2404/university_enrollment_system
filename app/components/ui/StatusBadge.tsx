import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertCircle, Clock, FileText, Ban, HelpCircle } from "lucide-react";

export type EnrollmentStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "need_correction"
  | "approved"
  | "rejected";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: EnrollmentStatus;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = {
    draft: {
      bg: "bg-gray-100 text-slate-gray border-gray-200",
      icon: FileText,
      label: "Draft",
    },
    submitted: {
      bg: "bg-blue-50 text-primary-navy border-soft-blue",
      icon: Clock,
      label: "Submitted",
    },
    pending_review: {
      bg: "bg-amber-50 text-warning-amber border-warning-light",
      icon: Clock,
      label: "Pending Review",
    },
    need_correction: {
      bg: "bg-amber-50 text-warning-amber border-warning-light",
      icon: AlertCircle,
      label: "Need Correction",
    },
    approved: {
      bg: "bg-success-light text-success-green border-success-light",
      icon: CheckCircle2,
      label: "Approved",
    },
    rejected: {
      bg: "bg-error-light text-error-red border-error-light",
      icon: Ban,
      label: "Rejected",
    },
  };

  const current = config[status] || {
    bg: "bg-gray-100 text-slate-gray border-gray-200",
    icon: HelpCircle,
    label: "Unknown",
  };

  const IconComponent = current.icon;

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border",
          current.bg,
          className
        )
      )}
      {...props}
    >
      <IconComponent className="w-3.5 h-3.5" aria-hidden="true" />
      {current.label}
    </span>
  );
}
