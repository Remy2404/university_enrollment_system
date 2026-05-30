"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  ClipboardList, 
  CheckSquare, 
  XSquare, 
  AlertTriangle, 
  Users, 
  ArrowRight,
} from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { StatusBadge, EnrollmentStatus } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { facultyService } from "@/src/services/program";
import { Application, Faculty, ApplicationDocument } from "@/src/types";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboardStats() {
    try {
      const [apps, docs, facs] = await Promise.all([
        applicationService.getAll(),
        documentService.getAll(),
        facultyService.getAll()
      ]);
      setApplications(apps);
      setDocuments(docs);
      setFaculties(facs);
    } catch {
      toast.error("Failed to load staff stats.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadDashboardStats(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  // Aggregate Stats Calculations
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === "submitted" || a.status === "pending_review").length;
  const approvedApps = applications.filter(a => a.status === "approved").length;
  const rejectedApps = applications.filter(a => a.status === "rejected").length;
  
  // Calculate applications with missing or invalid docs
  // Group documents by applicationId
  const docsByApp = documents.reduce((acc, doc) => {
    if (!acc[doc.applicationId]) {
      acc[doc.applicationId] = [];
    }
    acc[doc.applicationId].push(doc);
    return acc;
  }, {} as Record<string, ApplicationDocument[]>);

  const missingOrInvalidDocsCount = applications.filter(app => {
    // If draft, it is missing docs by default
    if (app.status === "draft") return true;
    const appDocs = docsByApp[app.id] || [];
    const hasInvalid = appDocs.some(d => d.status === "invalid");
    const hasMissing = appDocs.length < 5;
    return hasInvalid || hasMissing || app.status === "need_correction";
  }).length;

  // Chart data: Applications count by Faculty
  const facultyCounts = faculties.map(fac => {
    const count = applications.filter(app => app.programSelection?.facultyId === fac.id).length;
    return {
      name: fac.name,
      code: fac.code,
      count
    };
  });

  const maxCount = Math.max(...facultyCounts.map(f => f.count), 1);

  // Recent applications that need review (submitted status)
  const pendingReviewList = applications
    .filter(a => a.status === "submitted" || a.status === "pending_review")
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary-navy" />
          Admissions Officer Dashboard
        </h1>
        <p className="text-sm text-slate-gray mt-1">
          Review metrics, verify student credentials, and update applications.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <BentoCard className="p-5 flex flex-col justify-between" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-cool-gray">Total Applications</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-academic-blue">{totalApps}</span>
            <Users className="w-4 h-4 text-cool-gray" />
          </div>
          <p className="text-[11px] text-cool-gray mt-2 border-t border-slate-100 pt-2">All time registrations</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-soft-blue bg-blue-50/20" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-primary-navy">Pending Review</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-primary-navy">{pendingApps}</span>
            <ClipboardList className="w-4 h-4 text-primary-navy/70" />
          </div>
          <p className="text-[11px] text-primary-navy mt-2 border-t border-blue-100 pt-2">Requires evaluation</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-success-light bg-emerald-50/10" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-success-green">Approved / Admitted</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-success-green">{approvedApps}</span>
            <CheckSquare className="w-4 h-4 text-success-green/70" />
          </div>
          <p className="text-[11px] text-success-green mt-2 border-t border-emerald-100 pt-2">Acceptance issued</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-error-light bg-red-50/20" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-error-red">Rejected</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-error-red">{rejectedApps}</span>
            <XSquare className="w-4 h-4 text-error-red/70" />
          </div>
          <p className="text-[11px] text-error-red mt-2 border-t border-red-100 pt-2">Not meeting criteria</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-warning-light bg-amber-50/20" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-warning-amber">Action Needed / Missing</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-warning-amber">{missingOrInvalidDocsCount}</span>
            <AlertTriangle className="w-4 h-4 text-warning-amber/70" />
          </div>
          <p className="text-[11px] text-warning-amber mt-2 border-t border-amber-100 pt-2">Drafts or faulty uploads</p>
        </BentoCard>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column */}
        <BentoCard className="lg:col-span-2 space-y-6">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="text-md font-bold text-academic-blue">Applications by Faculty</h3>
            <p className="text-xs text-cool-gray">Aggregate breakdown of chosen fields</p>
          </div>

          <div className="space-y-4 py-2">
            {facultyCounts.map((fac, idx) => {
              const percentage = (fac.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-academic-blue">{fac.name} ({fac.code})</span>
                    <span className="text-primary-navy font-bold">{fac.count} apps</span>
                  </div>
                  <div className="w-full bg-slate-100 h-6 rounded-bento-sm overflow-hidden flex items-center">
                    <div 
                      className="bg-primary-navy h-full rounded-bento-sm transition-all duration-500 ease-out" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Task Queue Column */}
        <BentoCard className="flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-academic-blue">Immediate Reviews</h3>
                <p className="text-xs text-cool-gray">Queued submitted applications</p>
              </div>
              {pendingApps > 0 && (
                <span className="px-2 py-0.5 bg-primary-navy text-white text-[10px] font-extrabold rounded-full animate-pulse">
                  {pendingApps} active
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {pendingReviewList.length === 0 ? (
                <div className="text-xs text-cool-gray italic text-center py-10">
                  🎉 Good job! All applications reviewed.
                </div>
              ) : (
                pendingReviewList.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-3 border border-[#E2E8F0] rounded-bento-sm bg-slate-50/50 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                    onClick={() => router.push(`/staff/review/${app.id}`)}
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-bold text-xs text-academic-blue block truncate">
                        {app.personalInfo.fullName || "Unnamed Applicant"}
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-cool-gray">{app.id}</code>
                        <StatusBadge status={app.status as EnrollmentStatus} className="px-1.5 py-0 text-[9px]" />
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-cool-gray" />
                  </div>
                ))
              )}
            </div>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => router.push("/staff/applications")}
            className="w-full justify-between mt-4"
          >
            <span>All Applications Table</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </BentoCard>

      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
