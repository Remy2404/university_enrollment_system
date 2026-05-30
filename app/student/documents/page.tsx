"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderOpen, X, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DocumentStatusCard } from "../../components/ui/DocumentStatusCard";
import { FileUploadDropzone } from "../../components/ui/FileUploadDropzone";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { Application, ApplicationDocument } from "@/src/types";
import { useAuth } from "@/src/providers/auth-provider";

const documentTypes = [
  { type: "national_id" as const, label: "National ID Card" },
  { type: "high_school_certificate" as const, label: "High School Certificate" },
  { type: "birth_certificate" as const, label: "Birth Certificate" },
  { type: "student_photo" as const, label: "Student Photo" },
  { type: "application_form" as const, label: "Application Form" },
];

export default function StudentDocumentsPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [activeUploadType, setActiveUploadType] = useState<typeof documentTypes[number]["type"] | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Preview modal state
  const [activePreviewDoc, setActivePreviewDoc] = useState<ApplicationDocument | null>(null);

  async function loadDocumentsContext(uid: string) {
    try {
      const app = await applicationService.getByStudentId(uid);
      if (!app) {
        toast.error("Please fill in your enrollment details first.");
        router.push("/student/enrollment-form");
        return;
      }
      setAppRecord(app);

      const docs = await documentService.getByApplicationId(app.id);
      setDocuments(docs);
    } catch {
      toast.error("Failed to load documents context.");
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

    const timeoutId = window.setTimeout(() => void loadDocumentsContext(user.id), 0);
    return () => window.clearTimeout(timeoutId);
    // The loader is route-context bound and intentionally invoked only on auth changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, router, user]);

  const handleFileSelect = async (file: File) => {
    if (!activeUploadType || !appRecord || !user) return;

    const targetType = activeUploadType;
    setActiveUploadType(null);
    setUploadProgress((prev) => ({ ...prev, [targetType]: 50 }));

    try {
      await documentService.upload({
        applicationId: appRecord.id,
        studentId: user.id,
        type: targetType,
        file,
      });

      toast.success(`${file.name} uploaded successfully.`);
      const docs = await documentService.getByApplicationId(appRecord.id);
      setDocuments(docs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload document.");
    } finally {
      setUploadProgress(prev => {
        const copy = { ...prev };
        delete copy[targetType];
        return copy;
      });
    }
  };

  const handleDelete = async (docId: string) => {
    if (!appRecord) return;
    
    // Safety check: block deleting if already locked/submitted
    if (appRecord.status !== "draft" && appRecord.status !== "need_correction") {
      toast.error("Cannot delete documents on a submitted application.");
      return;
    }

    try {
      await documentService.delete(docId);
      toast.success("Document deleted.");
      const docs = await documentService.getByApplicationId(appRecord.id);
      setDocuments(docs);
    } catch {
      toast.error("Failed to delete document.");
    }
  };

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  const isLocked = appRecord ? (appRecord.status !== "draft" && appRecord.status !== "need_correction") : true;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary-navy" />
            Verification Documents
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            Upload the required documents below to verify your eligibility
          </p>
        </div>
        {appRecord?.status === "draft" && (
          <Button variant="primary" onClick={() => router.push("/student/enrollment-form")}>
            Continue Enrollment
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>

      {isLocked && (
        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-bento text-sm text-slate-gray leading-relaxed">
          <span className="font-bold text-primary-navy">Locked view:</span> Your application status is currently <span className="font-bold text-primary-navy">&quot;{appRecord?.status.replace("_", " ")}&quot;</span>. Files cannot be modified or replaced unless a correction is requested by admission staff.
        </div>
      )}

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documentTypes.map((item) => {
          const docRecord = documents.find((d) => d.type === item.type);
          return (
            <DocumentStatusCard
              key={item.type}
              documentType={item.type}
              documentLabel={item.label}
              docRecord={docRecord}
              uploadProgress={uploadProgress[item.type]}
              onUploadClick={() => setActiveUploadType(item.type)}
              onDeleteClick={() => docRecord && handleDelete(docRecord.id)}
              onPreviewClick={() => docRecord && setActivePreviewDoc(docRecord)}
              disabled={isLocked}
            />
          );
        })}
      </div>

      {/* Dropzone Upload Modal */}
      {activeUploadType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-bento border border-[#E2E8F0] p-6 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-md font-bold text-academic-blue">
                Upload {documentTypes.find(d => d.type === activeUploadType)?.label}
              </h3>
              <button
                onClick={() => setActiveUploadType(null)}
                className="text-cool-gray hover:text-primary-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FileUploadDropzone onFileSelect={handleFileSelect} />
          </div>
        </div>
      )}

      {/* Preview File Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-bento border border-[#E2E8F0] p-6 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-md font-bold text-academic-blue">
                Preview: {documentTypes.find(d => d.type === activePreviewDoc.type)?.label}
              </h3>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="text-cool-gray hover:text-primary-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-[#E2E8F0] rounded-bento text-center">
              <FileText className="w-16 h-16 text-primary-navy mb-4" />
              <p className="text-sm font-bold text-academic-blue">{activePreviewDoc.name}</p>
              <a
                href={activePreviewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-navy text-white text-xs font-semibold rounded-full mt-4"
              >
                Open secure preview
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
