"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  BarChart3, 
  Download, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRightLeft,
  PieChart
} from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/States";

import { applicationService } from "@/src/services/application";
import { facultyService, majorService } from "@/src/services/program";
import { Application, Faculty, Major } from "@/src/types";

export default function AdminAnalyticsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadAnalyticsContext() {
    setIsLoading(true);
    try {
      const [apps, facs, majs] = await Promise.all([
        applicationService.getAll(),
        facultyService.getAll(),
        majorService.getAll()
      ]);
      setApplications(apps);
      setFaculties(facs);
      setMajors(majs);
    } catch {
      toast.error("Failed to load analytics context.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadAnalyticsContext(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  // Dynamic KPI Calculations
  const totalApps = applications.length;
  const approvedApps = applications.filter(a => a.status === "approved").length;
  const rejectedApps = applications.filter(a => a.status === "rejected").length;
  const pendingApps = applications.filter(a => a.status === "submitted" || a.status === "pending_review").length;
  const needCorrectionApps = applications.filter(a => a.status === "need_correction").length;

  const successRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
  const rejectionRate = totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0;

  // Shift distribution counts
  const shiftCounts = {
    morning: applications.filter(a => a.programSelection?.shift?.toLowerCase() === "morning").length,
    afternoon: applications.filter(a => a.programSelection?.shift?.toLowerCase() === "afternoon").length,
    evening: applications.filter(a => a.programSelection?.shift?.toLowerCase() === "evening").length,
  };

  const totalShifts = (shiftCounts.morning + shiftCounts.afternoon + shiftCounts.evening) || 1;

  // Custom client-side CSV download export
  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.error("No application data available to export.");
      return;
    }

    const headers = ["Application ID", "Student Name", "Gender", "Faculty", "Major", "Shift", "Status", "Date Submitted"];
    const rows = applications.map(app => [
      app.id,
      app.personalInfo.fullName || "Draft Applicant",
      app.personalInfo.gender || "—",
      faculties.find(f => f.id === app.programSelection?.facultyId)?.name || "Not Chosen",
      majors.find(m => m.id === app.programSelection?.majorId)?.name || "Not Chosen",
      app.programSelection?.shift || "—",
      app.status,
      app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"
    ]);

    // Format content as CSV compliant string
    const csvRows = [headers.join(","), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))];
    const csvString = csvRows.join("\n");
    
    // Create download trigger anchor
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `academic_enrollment_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV report file exported successfully.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-navy" />
            Enrollment Analytics & Reports
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            Real-time aggregate computations, success rates, shift allocations, and data exports.
          </p>
        </div>
        <Button variant="primary" onClick={handleExportCSV} className="h-10 text-xs">
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV Report
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <BentoCard className="p-5 flex flex-col justify-between" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-cool-gray">Total Submissions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-academic-blue">{totalApps}</span>
            <Users className="w-4 h-4 text-cool-gray" />
          </div>
          <p className="text-[11px] text-cool-gray mt-2">Total candidate profiles</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-success-light bg-emerald-50/10" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-success-green">Admissions Success Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-success-green">{successRate}%</span>
            <CheckCircle className="w-4 h-4 text-success-green/70" />
          </div>
          <p className="text-[11px] text-success-green mt-2">{approvedApps} student acceptances</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-error-light bg-red-50/20" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-error-red">Rejection Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-error-red">{rejectionRate}%</span>
            <XCircle className="w-4 h-4 text-error-red/70" />
          </div>
          <p className="text-[11px] text-error-red mt-2">{rejectedApps} student refusals</p>
        </BentoCard>

        <BentoCard className="p-5 flex flex-col justify-between border-soft-blue bg-blue-50/10" hoverEffect={false}>
          <span className="text-[10px] uppercase font-bold text-primary-navy">Pending Decisions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-primary-navy">{pendingApps}</span>
            <Clock className="w-4 h-4 text-primary-navy/70" />
          </div>
          <p className="text-[11px] text-primary-navy mt-2">Awaiting admission evaluation</p>
        </BentoCard>
      </div>

      {/* Analytics Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shift Allocations Chart */}
        <BentoCard className="space-y-6">
          <h3 className="text-sm font-bold text-academic-blue border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-primary-navy" />
            Class Shift Distributions
          </h3>
          <div className="space-y-4 py-2">
            {[
              { label: "Morning Shift", count: shiftCounts.morning, color: "bg-primary-navy" },
              { label: "Afternoon Shift", count: shiftCounts.afternoon, color: "bg-warning-amber" },
              { label: "Evening Shift", count: shiftCounts.evening, color: "bg-success-green" },
            ].map((shift, idx) => {
              const percentage = Math.round((shift.count / totalShifts) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-academic-blue">{shift.label}</span>
                    <span className="text-cool-gray">{shift.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${shift.color}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Applications Status Breakdown Card */}
        <BentoCard className="space-y-6">
          <h3 className="text-sm font-bold text-academic-blue border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-primary-navy" />
            Pipeline Metrics Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 text-academic-blue">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-bento-sm">
              <span className="text-[10px] text-cool-gray uppercase block mb-1">Approved</span>
              <span className="text-lg font-bold text-success-green">{approvedApps}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-bento-sm">
              <span className="text-[10px] text-cool-gray uppercase block mb-1">Rejected</span>
              <span className="text-lg font-bold text-error-red">{rejectedApps}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-bento-sm">
              <span className="text-[10px] text-cool-gray uppercase block mb-1">Pending Review</span>
              <span className="text-lg font-bold text-primary-navy">{pendingApps}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-bento-sm">
              <span className="text-[10px] text-cool-gray uppercase block mb-1">Correction Required</span>
              <span className="text-lg font-bold text-warning-amber">{needCorrectionApps}</span>
            </div>
          </div>
        </BentoCard>

      </div>

      {/* Reports Table Grid */}
      <BentoCard className="overflow-hidden p-0">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-academic-blue">All Registers Report</h3>
            <p className="text-xs text-cool-gray">Complete list of registered student entries</p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs text-academic-blue">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-cool-gray font-bold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Chosen Faculty</th>
                <th className="py-4 px-6">Shift</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {applications.map((app) => {
                const facName = faculties.find(f => f.id === app.programSelection?.facultyId)?.name || "Not Chosen";
                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-primary-navy">{app.id}</td>
                    <td className="py-4 px-6 font-semibold">{app.personalInfo.fullName || "Draft Candidate"}</td>
                    <td className="py-4 px-6 truncate max-w-[200px]">{facName}</td>
                    <td className="py-4 px-6 capitalize">{app.programSelection?.shift || "—"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border capitalize ${
                        app.status === "approved" ? "bg-success-light text-success-green border-success-light" :
                        app.status === "rejected" ? "bg-error-light text-error-red border-error-light" :
                        app.status === "need_correction" ? "bg-amber-50 text-warning-amber border-warning-light" :
                        "bg-gray-100 text-cool-gray border-gray-200"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-cool-gray">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}
