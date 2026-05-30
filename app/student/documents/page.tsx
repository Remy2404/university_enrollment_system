"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderOpen, X, Eye, FileText, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";
import { DocumentStatusCard } from "../../components/ui/DocumentStatusCard";
import { FileUploadDropzone } from "../../components/ui/FileUploadDropzone";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { Application, ApplicationDocument } from "@/src/types";

const documentTypes = [
  { type: "national_id" as const, label: "National ID Card" },
  { type: "high_school_certificate" as const, label: "High School Certificate" },
  { type: "birth_certificate" as const, label: "Birth Certificate" },
  { type: "student_photo" as const, label: "Student Photo" },
  { type: "application_form" as const, label: "Application Form" },
];

export default function StudentDocumentsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [activeUploadType, setActiveUploadType] = useState<typeof documentTypes[number]["type"] | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Preview modal state
  const [activePreviewDoc, setActivePreviewDoc] = useState<ApplicationDocument | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ues_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      setUserId(user.id);
      loadDocumentsContext(user.id);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const loadDocumentsContext = async (uid: string) => {
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
    } catch (e) {
      toast.error("Failed to load documents context.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!activeUploadType || !appRecord || !userId) return;
    const typeLabel = documentTypes.find(d => d.type === activeUploadType)?.label || "File";

    // Close upload dropzone immediately to show status progress card
    const targetType = activeUploadType;
    setActiveUploadType(null);

    // Simulate progress upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [targetType]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        finalizeUpload(file, targetType);
      }
    }, 150);
  };

  const finalizeUpload = async (file: File, type: typeof documentTypes[number]["type"]) => {
    if (!appRecord || !userId) return;

    try {
      await documentService.create({
        applicationId: appRecord.id,
        studentId: userId,
        type,
        name: file.name,
        url: `/uploads/${file.name}`,
        status: "under_review",
        uploadedAt: new Date().toISOString(),
        rejectReason: "",
      });

      toast.success(`${file.name} uploaded successfully.`);
      
      // Refresh documents
      const docs = await documentService.getByApplicationId(appRecord.id);
      setDocuments(docs);
    } catch {
      toast.error("Failed to save document metadata.");
    } finally {
      setUploadProgress(prev => {
        const copy = { ...prev };
        delete copy[type];
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
          🔒 **Locked View**: Your application status is currently <span className="font-bold text-primary-navy">"{appRecord?.status.replace("_", " ")}"</span>. Files cannot be modified or replaced unless a correction is requested by admission staff.
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

            {/* Mock Preview Content */}
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-[#E2E8F0] rounded-bento text-center">
              <FileText className="w-16 h-16 text-primary-navy mb-4" />
              <p className="text-sm font-bold text-academic-blue">{activePreviewDoc.name}</p>
              <p className="text-xs text-cool-gray mt-1">
                Mock File URL: <code className="font-mono text-primary-navy">{activePreviewDoc.url}</code>
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full mt-4">
                Simulated Document Viewer
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
