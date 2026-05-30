"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ClipboardList, 
  ArrowLeft, 
  User, 
  GraduationCap, 
  FolderOpen, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ShieldAlert
} from "lucide-react";

import { BentoCard } from "../../../components/ui/BentoCard";
import { Button } from "../../../components/ui/Button";
import { StatusBadge, EnrollmentStatus } from "../../../components/ui/StatusBadge";
import { LoadingState } from "../../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { formatDocumentLabels, getDocumentReadiness } from "@/src/services/application-document-requirements";
import { reviewService } from "@/src/services/review";
import { facultyService, departmentService, majorService } from "@/src/services/program";
import { Application, ApplicationDocument, ReviewNote, Faculty, Department, Major } from "@/src/types";
import { useAuth } from "@/src/providers/auth-provider";

export default function StaffReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const applicationId = params.id as string;

  // Data Loading state
  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  
  // Program Details mapping
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [major, setMajor] = useState<Major | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "personal" | "academic" | "documents" | "notes">("overview");

  // Review Form state
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poka-Yoke confirmation Modal state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    status: "approved" | "rejected" | "need_correction" | null;
  }>({ open: false, status: null });

  const documentReadiness = getDocumentReadiness(documents);
  const approvalBlockers = [
    ...documentReadiness.missing,
    ...documentReadiness.invalid,
    ...documentReadiness.pending,
  ];

  useEffect(() => {
    void loadApplicationData();
    // Route changes are the only reason to reload the application payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function loadApplicationData() {
    setIsLoading(true);
    try {
      // 1. Fetch application details
      const app = await applicationService.getById(applicationId);
      if (!app) {
        toast.error("Application not found.");
        router.push("/staff/applications");
        return;
      }
      setAppRecord(app);

      // 2. Fetch docs and comments in parallel
      const [docs, commentsList] = await Promise.all([
        documentService.getByApplicationId(applicationId),
        reviewService.getNotesByApplicationId(applicationId),
      ]);
      setDocuments(docs);
      setNotes(commentsList);

      // 3. Fetch program entity details
      const { facultyId, departmentId, majorId } = app.programSelection || {};
      if (facultyId && departmentId && majorId) {
        const [fac, dept, maj] = await Promise.all([
          facultyService.getById(facultyId),
          departmentService.getById(departmentId),
          majorService.getById(majorId),
        ]);
        setFaculty(fac);
        setDepartment(dept);
        setMajor(maj);
      }
    } catch {
      toast.error("Failed to load application context.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleReviewTrigger = (status: "approved" | "rejected" | "need_correction") => {
    if (status === "approved" && !documentReadiness.allVerified) {
      setActiveTab("documents");
      toast.error(`Approval blocked. Complete verification for: ${formatDocumentLabels(approvalBlockers)}.`);
      return;
    }

    if (status !== "approved" && !comment.trim()) {
      toast.error("Please provide review notes/comment before completing action.");
      return;
    }
    setConfirmState({ open: true, status });
  };

  const handleReviewConfirm = async () => {
    if (!confirmState.status || !appRecord || !user) return;
    setIsSubmitting(true);
    try {
      await reviewService.submitReview({
        applicationId: appRecord.id,
        status: confirmState.status,
        comment,
      });

      toast.success(`Application marked as ${confirmState.status.replace("_", " ")}.`);
      setConfirmState({ open: false, status: null });
      setComment("");
      
      // Reload updated model
      await loadApplicationData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process review action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState rows={8} />;
  }

  if (!appRecord) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation and Top row */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/staff/applications")}
          className="flex items-center gap-1.5 text-xs text-cool-gray hover:text-primary-navy font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications List
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-cool-gray">Current Status:</span>
          <StatusBadge status={appRecord.status as EnrollmentStatus} />
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Data Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <BentoCard className="p-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-[#E2E8F0] bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: ClipboardList },
                { id: "personal", label: "Personal Profile", icon: User },
                { id: "academic", label: "Academic Info", icon: GraduationCap },
                { id: "documents", label: "Documents", icon: FolderOpen },
                { id: "notes", label: "Review Notes", icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-1.5 px-5 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                      active 
                        ? "border-primary-navy text-primary-navy bg-white" 
                        : "border-transparent text-slate-gray hover:text-primary-navy hover:bg-slate-100/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content frames */}
            <div className="p-6">
              
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cool-gray">Application ID</span>
                      <p className="font-mono text-sm font-bold text-primary-navy">{appRecord.id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cool-gray">Submission Date</span>
                      <p className="text-sm font-semibold">
                        {appRecord.submittedAt ? new Date(appRecord.submittedAt).toLocaleString() : "Not Submitted (Draft)"}
                      </p>
                    </div>
                  </div>

                  <hr className="border-[#E2E8F0]" />

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider">
                      Selected Academic Program Choices
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-bento-sm border border-[#E2E8F0]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cool-gray">Faculty</span>
                        <p className="text-xs font-bold text-academic-blue">{faculty?.name || "Not Chosen"}</p>
                        <span className="text-[10px] text-cool-gray font-mono">{faculty?.code}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cool-gray">Department</span>
                        <p className="text-xs font-semibold text-slate-gray">{department?.name || "Not Chosen"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10px] uppercase font-bold text-cool-gray">Target Major</span>
                        <p className="text-sm font-extrabold text-primary-navy">{major?.name || "Not Chosen"}</p>
                        <p className="text-[11px] text-slate-gray mt-1">{major?.description}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cool-gray">Study Shift</span>
                        <p className="text-xs font-semibold capitalize">{appRecord.programSelection?.shift || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cool-gray">Academic Intake Year</span>
                        <p className="text-xs font-semibold">{appRecord.programSelection?.academicYear || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Personal Profile */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider mb-3">Applicant Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-cool-gray block">Full Legal Name</span>
                        <span className="text-xs font-bold">{appRecord.personalInfo.fullName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Gender</span>
                        <span className="text-xs font-semibold capitalize">{appRecord.personalInfo.gender || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Date of Birth</span>
                        <span className="text-xs font-semibold">{appRecord.personalInfo.dateOfBirth || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Nationality</span>
                        <span className="text-xs font-semibold">{appRecord.personalInfo.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">National Identification Number</span>
                        <span className="text-xs font-bold font-mono">{appRecord.personalInfo.nationalId || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E2E8F0]" />

                  <div>
                    <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider mb-3">Contact and Coordinates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-cool-gray block">Phone Number</span>
                        <span className="text-xs font-semibold">{appRecord.contactInfo.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Email Address</span>
                        <span className="text-xs font-semibold">{appRecord.contactInfo.email || "—"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10px] text-cool-gray block">Permanent Address</span>
                        <span className="text-xs font-semibold">{appRecord.contactInfo.address || "—"}, {appRecord.contactInfo.city}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E2E8F0]" />

                  <div>
                    <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider mb-3">Guardian Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-cool-gray block">Guardian Name</span>
                        <span className="text-xs font-bold">{appRecord.guardianInfo.name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Relationship</span>
                        <span className="text-xs font-semibold">{appRecord.guardianInfo.relationship || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Guardian Phone</span>
                        <span className="text-xs font-semibold">{appRecord.guardianInfo.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cool-gray block">Guardian Location</span>
                        <span className="text-xs font-semibold truncate block">{appRecord.guardianInfo.address || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Academic Info */}
              {activeTab === "academic" && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider">Secondary School Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-bento-sm border border-[#E2E8F0]">
                    <div>
                      <span className="text-[10px] text-cool-gray block">High School Name</span>
                      <span className="text-xs font-bold">{appRecord.academicBackground.highSchoolName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cool-gray block">Graduation Year</span>
                      <span className="text-xs font-semibold">{appRecord.academicBackground.graduationYear || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cool-gray block">Certificate ID Number</span>
                      <span className="text-xs font-mono font-semibold">{appRecord.academicBackground.certificateNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cool-gray block">Calculated Grade / GPA Marks</span>
                      <span className="text-xs font-extrabold text-primary-navy">{appRecord.academicBackground.grade || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Documents Checklist */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider">Submitted Document Attachments</h4>
                    <Button 
                      variant="secondary" 
                      onClick={() => router.push(`/staff/verify/${appRecord.id}`)}
                      className="h-8 text-xs px-3"
                    >
                      Verify Documents Console
                    </Button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {documents.length === 0 ? (
                      <div className="text-xs text-cool-gray italic py-4">No documents uploaded.</div>
                    ) : (
                      documents.map((doc) => {
                        let statusColor = "text-cool-gray bg-slate-100";
                        if (doc.status === "valid") statusColor = "text-success-green bg-success-light";
                        if (doc.status === "invalid") statusColor = "text-error-red bg-error-light";
                        if (doc.status === "under_review") statusColor = "text-primary-navy bg-soft-blue";

                        return (
                          <div key={doc.id} className="py-3 flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="text-xs font-bold capitalize">{doc.type.replace("_", " ")}</span>
                              <p className="text-[10px] text-cool-gray">{doc.name}</p>
                              {doc.rejectReason && (
                                <p className="text-[10px] text-error-red font-semibold">Reason: {doc.rejectReason}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                                {doc.status.replace("_", " ")}
                              </span>
                              <Button 
                                variant="secondary" 
                                className="h-7 px-2 text-[10px]"
                                onClick={() => router.push(`/staff/verify/${appRecord.id}`)}
                              >
                                View File
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Review Notes */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-academic-blue uppercase tracking-wider">Historical Review Log</h4>
                  
                  {notes.length === 0 ? (
                    <p className="text-xs text-cool-gray italic py-4">No review remarks recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 bg-slate-50 border border-slate-100 rounded-bento-sm space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-primary-navy">Reviewer: {note.reviewerName}</span>
                            <span className="text-cool-gray">{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-gray leading-relaxed font-medium">
                            &quot;{note.comment}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </BentoCard>
        </div>

        {/* Right Side: Action Control Center */}
        <div className="space-y-4">
          <BentoCard className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cool-gray border-b border-[#E2E8F0] pb-2">
              Reviewer Actions Panel
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-gray block">
                Staff Feedback for Student Notification
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Explain what the student must correct. This note appears in their portal notification and status view."
                rows={4}
                className="w-full text-xs p-3 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy bg-slate-50/50"
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <Button 
                variant="primary" 
                className="w-full justify-center bg-success-green hover:bg-success-green/90 border-none font-bold"
                onClick={() => handleReviewTrigger("approved")}
                disabled={appRecord.status === "approved" || !documentReadiness.allVerified}
                title={documentReadiness.allVerified ? "Approve and admit applicant" : "Verify all required documents before approval"}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Approve & Admit
              </Button>

              <Button 
                variant="secondary" 
                className="w-full justify-center border-warning-amber text-warning-amber hover:bg-amber-50 font-bold"
                onClick={() => handleReviewTrigger("need_correction")}
                disabled={appRecord.status === "approved" || appRecord.status === "rejected"}
              >
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Request Document Corrections
              </Button>

              <Button 
                variant="secondary" 
                className="w-full justify-center border-error-red text-error-red hover:bg-red-50 font-bold"
                onClick={() => handleReviewTrigger("rejected")}
                disabled={appRecord.status === "approved" || appRecord.status === "rejected"}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject Admission
              </Button>
            </div>
          </BentoCard>

          <BentoCard className="space-y-3 p-4 bg-slate-50 border border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-cool-gray flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-warning-amber" />
              Officer Notes
            </h4>
            <p className="text-[11px] text-slate-gray leading-normal">
              Before approving, verify that all {documentReadiness.requiredCount} checklist files display <strong>Valid</strong> status badges. Currently verified: <strong>{documentReadiness.verified.length}/{documentReadiness.requiredCount}</strong>.
            </p>
            {!documentReadiness.allVerified && (
              <p className="text-[11px] font-semibold leading-normal text-warning-amber">
                Approval blocked: {formatDocumentLabels(approvalBlockers)} still require attention.
              </p>
            )}
          </BentoCard>
        </div>

      </div>

      {/* Double confirmation modal (Poka-Yoke) */}
      {confirmState.open && confirmState.status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-bento border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-3 text-academic-blue">
              <ShieldAlert className="w-5 h-5 text-warning-amber" />
              <h3 className="text-md font-bold">Double-Confirmation Check</h3>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-slate-gray">
              <p>
                You are about to transition Application <strong className="text-primary-navy">{appRecord.id}</strong> to:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md font-semibold text-center text-sm">
                {confirmState.status === "approved" && <span className="text-success-green">APPROVED & ADMITTED</span>}
                {confirmState.status === "rejected" && <span className="text-error-red">REJECTED</span>}
                {confirmState.status === "need_correction" && <span className="text-warning-amber">CORRECTIONS REQUIRED</span>}
              </div>
              <p className="text-[11px] italic">
                Note: This change executes a database transaction sending automated notifications to the student immediately.
              </p>

              {comment && (
                <div className="space-y-1">
                  <strong className="block text-academic-blue mt-2">Accompanying Feedback:</strong>
                  <blockquote className="p-2.5 bg-yellow-50/50 border-l-2 border-warning-amber text-slate-gray">
                    &quot;{comment}&quot;
                  </blockquote>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-4">
              <Button 
                variant="primary" 
                className={`flex-1 justify-center border-none ${
                  confirmState.status === "approved" ? "bg-success-green hover:bg-success-green/90" :
                  confirmState.status === "rejected" ? "bg-error-red hover:bg-error-red/90" :
                  "bg-warning-amber hover:bg-warning-amber/90"
                }`}
                onClick={handleReviewConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm & Execute"}
              </Button>
              <Button 
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => setConfirmState({ open: false, status: null })}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
