"use client";

import React, { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { clsx } from "clsx";

interface FileUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMb?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUploadDropzone({
  onFileSelect,
  acceptedFormats = ["application/pdf", "image/jpeg", "image/png"],
  maxSizeMb = 10,
  className,
  disabled = false,
}: FileUploadDropzoneProps) {
  const maxSize = maxSizeMb * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          alert(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          alert(`Invalid file type. Please upload PDF, JPG, or PNG.`);
        } else {
          alert(rejection.errors[0]?.message || "Failed to accept file.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSizeMb]
  );

  const acceptMap: Record<string, string[]> = {};
  acceptedFormats.forEach((fmt) => {
    acceptMap[fmt] = [];
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    maxSize,
    multiple: false,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-bento text-center cursor-pointer transition-all duration-200",
        isDragActive ? "border-primary-navy bg-soft-blue/20" : "border-[#E2E8F0] hover:border-primary-navy/50 bg-[#F8FAFC]",
        disabled && "opacity-50 cursor-not-allowed hover:border-[#E2E8F0] bg-slate-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-10 h-10 text-cool-gray mb-3" />
      <p className="text-sm font-semibold text-academic-blue mb-1">
        {isDragActive ? "Drop the file here" : "Drag & drop file here, or click to browse"}
      </p>
      <p className="text-xs text-cool-gray">
        Supports PDF, JPG, PNG up to {maxSizeMb}MB
      </p>
    </div>
  );
}
