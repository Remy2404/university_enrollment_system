"use client";

import React from "react";
import { AlertCircle, Eye, Trash2, Upload, FileText, RefreshCw } from "lucide-react";
import { ApplicationDocument } from "@/src/types";
import { StatusBadge, type EnrollmentStatus } from "./StatusBadge";
import { Button } from "./Button";

interface DocumentStatusCardProps {
  documentType: string;
  documentLabel: string;
  docRecord?: ApplicationDocument;
  uploadProgress?: number;
  onUploadClick: () => void;
  onDeleteClick: () => void;
  onPreviewClick: () => void;
  disabled?: boolean;
}

export function DocumentStatusCard({
  documentLabel,
  docRecord,
  uploadProgress,
  onUploadClick,
  onDeleteClick,
  onPreviewClick,
  disabled = false,
}: DocumentStatusCardProps) {
  const isUploading = uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100;
  const status = docRecord ? docRecord.status : "not_uploaded";

  // Map database status to Badge status
  const badgeStatusMap: Record<string, EnrollmentStatus> = {
    not_uploaded: "draft",
    uploaded: "submitted",
    under_review: "pending_review",
    valid: "approved",
    invalid: "rejected",
  };

  return (
    <div className="flex flex-col p-4 border border-[#E2E8F0] rounded-bento bg-white shadow-xs space-y-3">
      {/* Top Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-soft-blue text-primary-navy">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-academic-blue truncate">{documentLabel}</p>
            {docRecord?.name && (
              <p className="text-xs text-cool-gray truncate max-w-[180px]">{docRecord.name}</p>
            )}
          </div>
        </div>
        <StatusBadge status={badgeStatusMap[status]} />
      </div>

      {/* Progress bar for simulated uploads */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-semibold text-primary-navy">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-navy transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rejection comments */}
      {status === "invalid" && docRecord?.rejectReason && (
        <div className="p-2.5 bg-red-50 border border-red-100 rounded-bento-sm flex items-start gap-2 text-error-red">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed">
            {docRecord.rejectReason}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] justify-end">
        {docRecord && (
          <>
            <Button variant="secondary" onClick={onPreviewClick} className="h-8 text-xs px-3">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
            {!disabled && (
              <>
                <Button variant="secondary" onClick={onUploadClick} className="h-8 text-xs px-3">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Replace
                </Button>
                <Button variant="secondary" onClick={onDeleteClick} className="text-error-red border-red-100 hover:bg-red-50 h-8 text-xs px-3">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </>
        )}

        {!docRecord && !isUploading && !disabled && (
          <Button variant="primary" onClick={onUploadClick} className="h-8 text-xs px-3">
            <Upload className="w-3.5 h-3.5 mr-1" />
            Upload File
          </Button>
        )}
      </div>
    </div>
  );
}
