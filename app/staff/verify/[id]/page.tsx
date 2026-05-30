"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Eye, 
  FileText, 
  Check, 
  X, 
  HelpCircle, 
  Download,
  AlertTriangle,
} from "lucide-react";

import { BentoCard } from "../../../components/ui/BentoCard";
import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { Application, ApplicationDocument } from "@/src/types";

const documentTypeLabels: Record<string, string> = {
  national_id: "National ID Card",
  high_school_certificate: "High School Certificate",
  birth_certificate: "Birth Certificate",
  student_photo: "Student Photo",
  application_form: "Application Form",
};

export default function StaffDocumentVerifyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<ApplicationDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verification form state
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadContext() {
    setIsLoading(true);
    try {
      const app = await applicationService.getById(applicationId);
      if (!app) {
        toast.error("Application not found.");
        router.push("/staff/verify");
        return;
      }
      setAppRecord(app);

      const docs = await documentService.getByApplicationId(applicationId);
      setDocuments(docs);
      if (docs.length > 0) {
        setActiveDoc(docs[0]);
        setRejectReason(docs[0].rejectReason || "");
      }
    } catch {
      toast.error("Failed to load verification documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadContext(), 0);
    return () => window.clearTimeout(timeoutId);
    // Route changes are the only reason to reload the application payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleSelectDoc = (doc: ApplicationDocument) => {
    setActiveDoc(doc);
    setRejectReason(doc.rejectReason || "");
  };

  const handleUpdateStatus = async (status: "valid" | "invalid") => {
    if (!activeDoc) return;
    if (status === "invalid" && !rejectReason.trim()) {
      toast.error("Please enter a reason for marking the document as invalid.");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await documentService.update(activeDoc.id, {
        status,
        rejectReason: status === "invalid" ? rejectReason : "",
      });

      toast.success(`${documentTypeLabels[activeDoc.type]} updated to ${status}.`);
      
      // Update local list
      setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
      setActiveDoc(updated);
    } catch {
      toast.error("Failed to update document verification status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (!appRecord) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/staff/verify")}
          className="flex items-center gap-1.5 text-xs text-cool-gray hover:text-primary-navy font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification Queue
        </button>

        <span className="text-xs text-cool-gray">
          Student Name: <strong className="text-academic-blue">{appRecord.personalInfo.fullName || "Draft Applicant"}</strong>
        </span>
      </div>

      {/* Split Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: File List */}
        <BentoCard className="p-4 space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cool-gray border-b border-[#E2E8F0] pb-2">
            Uploaded Files
          </h3>
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-xs text-cool-gray italic py-4">No documents uploaded.</p>
            ) : (
              documents.map((doc) => {
                const isActive = activeDoc?.id === doc.id;
                let badgeColor = "bg-slate-100 text-cool-gray";
                if (doc.status === "valid") badgeColor = "bg-success-light text-success-green";
                if (doc.status === "invalid") badgeColor = "bg-error-light text-error-red";
                if (doc.status === "under_review") badgeColor = "bg-soft-blue text-primary-navy";

                return (
                  <div 
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3 rounded-bento-sm border text-xs cursor-pointer transition-all ${
                      isActive 
                        ? "border-primary-navy bg-soft-blue/10 shadow-xs" 
                        : "border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-academic-blue truncate">
                      {documentTypeLabels[doc.type] || doc.type}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-cool-gray truncate max-w-[80px]">{doc.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                        {doc.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </BentoCard>

        {/* Center Column: Secure document preview */}
        <BentoCard className="lg:col-span-2 flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-academic-blue">
                {activeDoc ? documentTypeLabels[activeDoc.type] : "Document Preview"}
              </h3>
              {activeDoc && (
                <span className="text-[10px] text-cool-gray font-mono">
                  {activeDoc.id}
                </span>
              )}
            </div>

            {activeDoc ? (
              <div className="bg-slate-50 border border-dashed border-[#E2E8F0] rounded-bento p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                <FileText className="w-16 h-16 text-primary-navy" />
                <div className="space-y-1">
                  <h4 className="font-bold text-academic-blue text-sm">{activeDoc.name}</h4>
                  <p className="text-xs text-cool-gray">
                    Private storage preview link generated for this review session.
                  </p>
                  <p className="text-[10px] text-cool-gray">
                    Uploaded on: {activeDoc.uploadedAt ? new Date(activeDoc.uploadedAt).toLocaleString() : "Unknown"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <a 
                    href={activeDoc.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-academic-blue rounded-bento-sm transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open In New Tab
                  </a>
                  <a
                    href={activeDoc.url}
                    download={activeDoc.name}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-academic-blue rounded-bento-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-cool-gray space-y-2">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">Select a document from the left list to preview details.</p>
              </div>
            )}
          </div>

          {activeDoc && activeDoc.status === "invalid" && activeDoc.rejectReason && (
            <div className="mt-4 p-3 bg-red-50/50 border border-error-light rounded-bento-sm text-xs text-error-red flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-error-red mt-0.5" />
              <div>
                <strong>Rejection remark:</strong> &quot;{activeDoc.rejectReason}&quot;
              </div>
            </div>
          )}
        </BentoCard>

        {/* Right Column: Actions Control */}
        <BentoCard className="p-4 space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cool-gray border-b border-[#E2E8F0] pb-2">
              Verification Desk
            </h3>

            {activeDoc ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-academic-blue">Current Document Status:</span>
                  <div className="mt-1 capitalize font-bold text-primary-navy">
                    {activeDoc.status.replace("_", " ")}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-gray block">
                    Rejection Reason (If invalid)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide detailed feedback e.g., 'National ID expiration date illegible'..."
                    rows={4}
                    className="w-full text-xs p-2 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy bg-slate-50/50"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-success-green hover:bg-success-green/90 border-none font-bold"
                    onClick={() => handleUpdateStatus("valid")}
                    disabled={isUpdating}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Mark Valid
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-center border-error-red text-error-red hover:bg-red-50 font-bold"
                    onClick={() => handleUpdateStatus("invalid")}
                    disabled={isUpdating}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Mark Invalid
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-cool-gray italic">Select a document to review action guides.</p>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => router.push(`/staff/review/${appRecord.id}`)}
            className="w-full justify-center border-dashed border-[#E2E8F0] text-primary-navy font-bold text-[11px] h-9"
          >
            Go to Full Review Sheet
          </Button>
        </BentoCard>

      </div>
    </div>
  );
}
