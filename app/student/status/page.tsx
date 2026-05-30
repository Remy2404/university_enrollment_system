"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, Clock, CheckCircle2, AlertTriangle, AlertCircle, FileText, ArrowRight, CornerDownRight, MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";
import { StatusBadge, EnrollmentStatus } from "../../components/ui/StatusBadge";
import { LoadingState, EmptyState } from "../../components/ui/States";

import { applicationService } from "@/src/services/application";
import { reviewService } from "@/src/services/review";
import { Application, ApplicationTimelineEvent } from "@/src/types";
import { useAuth } from "@/src/providers/auth-provider";

export default function StudentStatusPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    void loadStatusDetails(user.id);
  }, [isAuthLoading, router, user]);

  async function loadStatusDetails(uid: string) {
    try {
      const app = await applicationService.getByStudentId(uid);
      if (app) {
        setAppRecord(app);
        const evts = await reviewService.getEventsByApplicationId(app.id);
        setEvents(evts);
      }
    } catch {
      toast.error("Failed to load application status.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (!appRecord) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <EmptyState
          title="No Application Found"
          description="You haven't started your enrollment application yet. Click below to begin the application form."
          actionLabel="Start Enrollment Application"
          onAction={() => router.push("/student/enrollment-form")}
          icon={FileText}
        />
      </div>
    );
  }

  // Map progress to steps
  const steps = [
    { label: "Draft", status: "draft", desc: "Application started and details being filled" },
    { label: "Submitted", status: "submitted", desc: "Application queued; updates remain available until active review starts" },
    { label: "In Review", status: "pending_review", desc: "Admission team is verifying academic details and files" },
    { label: "Final Decision", status: "decision", desc: "Official admission result approved or rejected" },
  ];

  const getStepState = (stepIndex: number) => {
    const status = appRecord.status;
    
    // Draft step
    if (stepIndex === 0) return "completed";

    // Submitted step
    if (stepIndex === 1) {
      if (status === "draft") return "upcoming";
      return "completed";
    }

    // In Review step
    if (stepIndex === 2) {
      if (status === "draft" || status === "submitted") return "upcoming";
      if (status === "need_correction") return "warning";
      if (status === "pending_review") return "current";
      return "completed";
    }

    // Decision step
    if (stepIndex === 3) {
      if (status === "approved") return "completed";
      if (status === "rejected") return "error";
      return "upcoming";
    }

    return "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary-navy" />
          Application Status
        </h1>
        <p className="text-sm text-slate-gray mt-1">
          Track the progress of your university admission application in real-time
        </p>
      </div>

      {/* Main Status Bento Card */}
      <BentoCard className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-cool-gray">APPLICATION ID:</span>
            <code className="font-mono text-xs font-bold text-primary-navy px-2 py-0.5 bg-slate-100 rounded-md">
              {appRecord.id}
            </code>
            <StatusBadge status={appRecord.status as EnrollmentStatus} />
          </div>
          <h2 className="text-xl font-bold text-academic-blue">
            {appRecord.status === "draft" && "Finish filling out your enrollment details"}
            {appRecord.status === "submitted" && "Application successfully submitted"}
            {appRecord.status === "pending_review" && "Application is currently in admission review"}
            {appRecord.status === "need_correction" && "Action required: Documents need correction"}
            {appRecord.status === "approved" && "Congratulations! You are admitted"}
            {appRecord.status === "rejected" && "Admission application review completed"}
          </h2>
          <p className="text-sm text-slate-gray max-w-xl">
            {appRecord.status === "draft" && "Your application is currently in draft mode. You can edit your choices, upload details, and submit whenever you are ready."}
            {appRecord.status === "submitted" && "We have received your application. While it is queued, you can still update your form and finish any missing verification documents before active review starts."}
            {appRecord.status === "pending_review" && "Our staff is reviewing your academic transcripts, national ID, and selected program. This step typically takes 2-3 business days."}
            {appRecord.status === "need_correction" && "Some files you uploaded did not meet the guidelines or were illegible. Please check the review notes below and update them."}
            {appRecord.status === "approved" && "Your enrollment application meets all entry requirements. Welcome to the university! Please check your email for official enrollment next steps."}
            {appRecord.status === "rejected" && "Unfortunately, your enrollment application did not meet the entry criteria or was rejected by the admission committee."}
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          {(appRecord.status === "draft" || appRecord.status === "submitted") && (
            <Button variant="primary" onClick={() => router.push("/student/enrollment-form")} className="w-full justify-center">
              {appRecord.status === "draft" ? "Continue Form" : "Update Form & Documents"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
          {appRecord.status === "need_correction" && (
            <Button variant="primary" onClick={() => router.push("/student/enrollment-form")} className="w-full justify-center bg-warning-amber hover:bg-warning-amber/90 border-none">
              Correct Form & Documents
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
          <Button variant="secondary" onClick={() => loadStatusDetails(appRecord.studentId)} className="w-full justify-center">
            Refresh Status
          </Button>
        </div>
      </BentoCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline / Progress Track */}
        <BentoCard className="md:col-span-2 space-y-6">
          <h3 className="text-md font-bold text-academic-blue border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-navy" />
            Application Milestones
          </h3>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 py-2 ml-3">
            {steps.map((step, idx) => {
              const state = getStepState(idx);
              return (
                <div key={idx} className="relative">
                  {/* Timeline Dot Indicator */}
                  <span className="absolute -left-[33px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border-2">
                    {state === "completed" && (
                      <span className="w-4 h-4 rounded-full bg-success-green flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                    {state === "current" && (
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-navy opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-navy"></span>
                      </span>
                    )}
                    {state === "warning" && (
                      <span className="w-4 h-4 rounded-full bg-warning-amber flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </span>
                    )}
                    {state === "error" && (
                      <span className="w-4 h-4 rounded-full bg-error-red flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                    {state === "upcoming" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                    )}
                  </span>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${
                      state === "completed" ? "text-success-green" :
                      state === "current" ? "text-primary-navy font-extrabold" :
                      state === "warning" ? "text-warning-amber" :
                      state === "error" ? "text-error-red" :
                      "text-slate-gray"
                    }`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-cool-gray">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Reviewer Comments Card */}
          {appRecord.reviewerComments && (
            <BentoCard className="border-warning-amber/40 bg-warning-light/10 space-y-3">
              <h4 className="text-sm font-bold text-warning-amber flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Admission Note
              </h4>
              <p className="text-xs text-slate-gray leading-relaxed bg-white/70 p-3 rounded-bento-sm border border-[#E2E8F0]">
                &quot;{appRecord.reviewerComments}&quot;
              </p>
              {appRecord.status === "need_correction" && (
                <p className="text-[11px] text-cool-gray">
                  Open the enrollment form to correct any inaccurate details and replace files that need attention.
                </p>
              )}
            </BentoCard>
          )}

          {/* Program selection overview */}
          {appRecord.programSelection && (
            <BentoCard className="space-y-3">
              <h4 className="text-xs font-bold text-cool-gray uppercase tracking-wider">
                Target Program Selection
              </h4>
              <div className="space-y-2 text-xs text-slate-gray">
                <div>
                  <span className="font-semibold text-academic-blue block">Academic Year:</span>
                  {appRecord.programSelection.academicYear}
                </div>
                <div>
                  <span className="font-semibold text-academic-blue block">Selection Details:</span>
                  <span className="flex items-center gap-1 mt-0.5 text-[11px]">
                    <CornerDownRight className="w-3.5 h-3.5 text-cool-gray" />
                    Shift: {appRecord.programSelection.shift}
                  </span>
                </div>
              </div>
            </BentoCard>
          )}
        </div>
      </div>

      {/* Activity Timeline History */}
      <BentoCard className="space-y-4">
        <h3 className="text-md font-bold text-academic-blue border-b border-[#E2E8F0] pb-3">
          Timeline History
        </h3>

        {events.length === 0 ? (
          <p className="text-sm text-cool-gray italic py-4">No events logged yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-academic-blue">{event.title}</span>
                    <span className="text-[10px] text-cool-gray">by {event.actorName}</span>
                  </div>
                  <p className="text-slate-gray max-w-xl">{event.description}</p>
                </div>
                <span className="text-[10px] text-cool-gray shrink-0 pl-4">
                  {new Date(event.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </BentoCard>
    </div>
  );
}
