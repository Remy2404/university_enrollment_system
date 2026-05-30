"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Activity, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileClock,
  UserCheck
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";
import { StatusBadge, EnrollmentStatus } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { notificationService } from "@/src/services/notification";
import { facultyService, departmentService, majorService } from "@/src/services/program";
import { Application, ApplicationDocument, Notification } from "@/src/types";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Student");
  const [userId, setUserId] = useState<string | null>(null);
  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Program names
  const [programInfo, setProgramInfo] = useState<{
    faculty: string;
    department: string;
    major: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ues_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      setUserName(user.name || "Student");
      setUserId(user.id);
      loadDashboardData(user.id);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const loadDashboardData = async (uid: string) => {
    try {
      // 1. Get application
      const app = await applicationService.getByStudentId(uid);
      setAppRecord(app);

      // 2. Fetch notifications
      const notifs = await notificationService.getByUserId(uid);
      setNotifications(notifs.slice(0, 3)); // show top 3 recent notifications

      if (app) {
        // 3. Get documents
        const docs = await documentService.getByApplicationId(app.id);
        setDocuments(docs);

        // 4. Fetch program names if selected
        const { facultyId, departmentId, majorId } = app.programSelection || {};
        if (facultyId && departmentId && majorId) {
          try {
            const [fac, dept, maj] = await Promise.all([
              facultyService.getById(facultyId),
              departmentService.getById(departmentId),
              majorService.getById(majorId),
            ]);
            setProgramInfo({
              faculty: fac.name,
              department: dept.name,
              major: maj.name,
            });
          } catch (err) {
            console.error("Failed to load program names", err);
          }
        }
      }
    } catch (e) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  // Calculate missing documents
  const requiredTypes = [
    { type: "national_id", label: "National ID Card" },
    { type: "high_school_certificate", label: "High School Certificate" },
    { type: "birth_certificate", label: "Birth Certificate" },
    { type: "student_photo", label: "Student Photo" },
    { type: "application_form", label: "Application Form" }
  ];

  const uploadedTypes = documents.map(d => d.type);
  const missingDocs = requiredTypes.filter(r => !uploadedTypes.includes(r.type as any));
  const invalidDocs = documents.filter(d => d.status === "invalid");
  const underReviewDocs = documents.filter(d => d.status === "under_review" || d.status === "uploaded");
  const validDocs = documents.filter(d => d.status === "valid");

  // Stepper calculations
  const progressPercent = appRecord ? appRecord.progress : 0;
  const activeStatus = appRecord ? appRecord.status : "draft";

  // Action tasks calculation
  const tasks: { text: string; action: () => void; done: boolean; type: "info" | "warning" | "success" }[] = [];
  
  if (!appRecord) {
    tasks.push({
      text: "Fill in your personal and academic information",
      action: () => router.push("/student/enrollment-form"),
      done: false,
      type: "warning"
    });
  } else {
    // Has application
    const academicSelected = !!(appRecord.programSelection?.facultyId && appRecord.programSelection?.majorId);
    tasks.push({
      text: "Select your desired faculty and major",
      action: () => router.push("/student/enrollment-form"),
      done: academicSelected,
      type: academicSelected ? "success" : "warning"
    });

    tasks.push({
      text: `Upload required verification documents (${documents.length}/5 uploaded)`,
      action: () => router.push("/student/documents"),
      done: documents.length >= 5,
      type: documents.length >= 5 ? "success" : "warning"
    });

    if (activeStatus === "draft") {
      tasks.push({
        text: "Submit your final enrollment application",
        action: () => router.push("/student/enrollment-form"), // the final step of form is submission
        done: false,
        type: "info"
      });
    } else if (activeStatus === "need_correction") {
      tasks.push({
        text: "Resolve invalid documents identified by admission staff",
        action: () => router.push("/student/documents"),
        done: false,
        type: "warning"
      });
    } else if (activeStatus === "submitted" || activeStatus === "pending_review") {
      tasks.push({
        text: "Your application is under review. No actions required.",
        action: () => router.push("/student/status"),
        done: true,
        type: "success"
      });
    } else if (activeStatus === "approved") {
      tasks.push({
        text: "Proceed to matriculation & campus registration",
        action: () => router.push("/student/status"),
        done: true,
        type: "success"
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-navy/95 to-academic-blue text-white p-6 md:p-8 rounded-bento shadow-md">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-soft-blue">Student Portal</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-sm text-soft-blue/90 max-w-xl leading-relaxed">
            {activeStatus === "draft" && "You're just a few steps away from completing your university application. Make sure to choose your program and upload all documents."}
            {activeStatus === "submitted" && "Your application has been received. Our team will verify your documents shortly."}
            {activeStatus === "pending_review" && "Your application is currently in active review. Check the timeline for details."}
            {activeStatus === "need_correction" && "⚠️ Action required: Admissions staff requested document corrections."}
            {activeStatus === "approved" && "🎉 Congratulations! You have been admitted to our university."}
            {activeStatus === "rejected" && "Your admission application review has been completed."}
          </p>
        </div>
        {activeStatus === "draft" && (
          <Button 
            variant="primary" 
            onClick={() => router.push("/student/enrollment-form")}
            className="bg-white text-primary-navy hover:bg-soft-blue border-none font-semibold shrink-0"
          >
            Complete Application
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Application Status */}
        <BentoCard className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cool-gray tracking-wider uppercase">Application Status</span>
              <Activity className="w-5 h-5 text-primary-navy" />
            </div>
            {appRecord ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeStatus as EnrollmentStatus} />
                </div>
                <p className="text-sm font-semibold text-academic-blue mt-1">
                  {activeStatus === "draft" && "In Draft Mode"}
                  {activeStatus === "submitted" && "Submitted & Awaiting Review"}
                  {activeStatus === "pending_review" && "Under Review"}
                  {activeStatus === "need_correction" && "Corrections Needed"}
                  {activeStatus === "approved" && "Admitted & Approved"}
                  {activeStatus === "rejected" && "Not Admitted"}
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-primary-navy h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-cool-gray">
                  <span>Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-gray">
                No active application. Start your enrollment to log progress.
              </div>
            )}
          </div>
          {appRecord && (
            <button 
              onClick={() => router.push("/student/status")}
              className="text-xs text-primary-navy font-bold flex items-center gap-1 hover:underline self-start pt-2"
            >
              View Full Timeline
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </BentoCard>

        {/* Card 2: Selected Program Choice */}
        <BentoCard className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cool-gray tracking-wider uppercase">Program Selection</span>
              <BookOpen className="w-5 h-5 text-primary-navy" />
            </div>
            {appRecord && programInfo ? (
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cool-gray">Faculty</span>
                  <p className="text-sm font-semibold text-academic-blue leading-tight truncate">{programInfo.faculty}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-cool-gray">Major / Discipline</span>
                  <p className="text-sm font-semibold text-primary-navy leading-tight truncate">{programInfo.major}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-cool-gray">Shift & Year</span>
                  <p className="text-xs text-slate-gray">
                    {appRecord.programSelection.shift} Shift | Year {appRecord.programSelection.academicYear}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-gray leading-relaxed">
                  No program chosen yet. Fill in the enrollment choices.
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => router.push("/student/enrollment-form")}
                  className="mt-2 h-8 text-xs px-3"
                >
                  Choose Major
                </Button>
              </div>
            )}
          </div>
          {appRecord && (
            <button 
              onClick={() => router.push("/student/enrollment-form")}
              className="text-xs text-primary-navy font-bold flex items-center gap-1 hover:underline self-start pt-2"
            >
              Change Selection
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </BentoCard>

        {/* Card 3: Document Verification Checklist */}
        <BentoCard className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cool-gray tracking-wider uppercase">Verification Checklist</span>
              <FolderOpen className="w-5 h-5 text-primary-navy" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-gray">Uploaded Documents</span>
                <span className="font-bold text-academic-blue">{documents.length}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {requiredTypes.map((t, idx) => {
                  const doc = documents.find(d => d.type === t.type);
                  let colorClass = "bg-slate-100 border-slate-200 text-cool-gray";
                  if (doc) {
                    if (doc.status === "valid") colorClass = "bg-success-light text-success-green border-success-light";
                    else if (doc.status === "invalid") colorClass = "bg-error-light text-error-red border-error-light animate-pulse";
                    else colorClass = "bg-soft-blue text-primary-navy border-soft-blue";
                  }
                  return (
                    <div 
                      key={idx} 
                      title={`${t.label}: ${doc ? doc.status.replace("_", " ") : "Not Uploaded"}`}
                      className={`h-2.5 rounded-full border ${colorClass}`}
                    ></div>
                  );
                })}
              </div>
              <div className="text-[11px] text-cool-gray space-y-1 pt-1.5">
                {invalidDocs.length > 0 && (
                  <div className="text-error-red font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {invalidDocs.length} document rejected by reviewer.
                  </div>
                )}
                {missingDocs.length > 0 && (
                  <div>{missingDocs.length} required file(s) missing.</div>
                )}
                {underReviewDocs.length > 0 && (
                  <div className="text-primary-navy">{underReviewDocs.length} file(s) awaiting verification check.</div>
                )}
                {validDocs.length === 5 && (
                  <div className="text-success-green font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    All 5 documents verified.
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.push("/student/documents")}
            className="text-xs text-primary-navy font-bold flex items-center gap-1 hover:underline self-start pt-2"
          >
            Manage Documents
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </BentoCard>

      </div>

      {/* Checklist & Notifications Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Action Checklist */}
        <BentoCard className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-md font-bold text-academic-blue flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-navy" />
              Enrollment Actions Checklist
            </h3>
            <span className="text-xs text-cool-gray">Follow in order</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div 
                key={idx}
                onClick={task.action}
                className="flex items-center justify-between p-3.5 rounded-bento-sm border border-[#E2E8F0] hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                    task.done 
                      ? "bg-success-light text-success-green border-success-light" 
                      : "bg-slate-50 border-slate-300 text-cool-gray"
                  }`}>
                    {task.done && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs ${
                    task.done ? "text-cool-gray line-through" : "font-semibold text-academic-blue"
                  }`}>
                    {task.text}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-cool-gray group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Right Col: Notification Box */}
        <BentoCard className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-md font-bold text-academic-blue flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-navy" />
                Recent Alerts
              </h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-2 py-0.5 bg-error-red text-white text-[10px] font-extrabold rounded-full animate-pulse">
                  {notifications.filter(n => !n.read).length} New
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-xs text-cool-gray text-center py-6">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-bento-sm border text-xs relative ${
                      n.read 
                        ? "bg-slate-50/50 border-slate-100 text-slate-gray" 
                        : "bg-soft-blue/20 border-soft-blue/50 text-academic-blue font-medium"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{n.title}</span>
                      {!n.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(n.id);
                          }}
                          className="text-[10px] text-primary-navy hover:underline font-bold shrink-0 pl-2"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-cool-gray mt-1 leading-normal">{n.message}</p>
                    <span className="text-[9px] text-cool-gray block mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => router.push("/student/notifications")}
            className="text-xs text-primary-navy font-bold flex items-center gap-1 hover:underline self-start pt-2 border-t border-slate-100 w-full mt-2"
          >
            All Notifications
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </BentoCard>

      </div>
    </div>
  );
}
