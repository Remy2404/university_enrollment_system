import React from "react";
import { AlertTriangle, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./Button";

// Skeleton Loader
export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 animate-pulse" aria-busy="true" aria-label="Loading content">
      <div className="h-8 bg-[#E2E8F0] rounded-md w-1/4"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-12 bg-[#E2E8F0] rounded-bento-sm w-full"></div>
        ))}
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-[#E2E8F0] rounded-bento bg-white">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-cool-gray mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-academic-blue mb-1">{title}</h3>
      <p className="text-sm text-slate-gray max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Error State
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Failed to load content. Please verify your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center border border-error-light bg-red-50/50 rounded-bento">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-error-red mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-academic-blue mb-1">An Error Occurred</h3>
      <p className="text-sm text-error-red max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="border-red-200 text-error-red hover:bg-red-50">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Action
        </Button>
      )}
    </div>
  );
}
