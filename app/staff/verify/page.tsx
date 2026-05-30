"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckSquare, FolderOpen, ArrowRight, ShieldCheck } from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import { Application, ApplicationDocument } from "@/src/types";

export default function StaffVerificationQueuePage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const [apps, docs] = await Promise.all([
        applicationService.getAll(),
        documentService.getAll()
      ]);
      // Filter out draft applications (they haven't submitted documents yet)
      const activeApps = apps.filter(a => a.status !== "draft");
      setApplications(activeApps);
      setDocuments(docs);
    } catch (e) {
      toast.error("Failed to load verification queue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState rows={4} />;
  }

  // Group documents by application ID to count stats
  const docsByApp = documents.reduce((acc, doc) => {
    if (!acc[doc.applicationId]) {
      acc[doc.applicationId] = [];
    }
    acc[doc.applicationId].push(doc);
    return acc;
  }, {} as Record<string, ApplicationDocument[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary-navy" />
          Document Verification Console
        </h1>
        <p className="text-sm text-slate-gray mt-1">
          Select a student application to verify national credentials, photos, and academic certificates.
        </p>
      </div>

      {/* Verification Queue List */}
      <div className="grid grid-cols-1 gap-4">
        {applications.length === 0 ? (
          <BentoCard className="p-8 text-center text-slate-gray">
            <ShieldCheck className="w-12 h-12 text-success-green mx-auto mb-2" />
            <h4 className="font-bold text-academic-blue">All Clear!</h4>
            <p className="text-xs">No active applications currently need document verification.</p>
          </BentoCard>
        ) : (
          applications.map((app) => {
            const appDocs = docsByApp[app.id] || [];
            const underReviewCount = appDocs.filter(d => d.status === "under_review" || d.status === "uploaded").length;
            const validCount = appDocs.filter(d => d.status === "valid").length;
            const invalidCount = appDocs.filter(d => d.status === "invalid").length;

            return (
              <BentoCard 
                key={app.id} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-academic-blue">
                      {app.personalInfo.fullName || "Draft Student"}
                    </span>
                    <code className="text-[10px] font-mono text-cool-gray px-1.5 py-0.5 bg-slate-100 rounded-md">
                      {app.id}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-gray">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-cool-gray" />
                      {appDocs.length} files uploaded
                    </span>
                    <span className="text-success-green font-semibold">
                      ✓ {validCount} Valid
                    </span>
                    {invalidCount > 0 && (
                      <span className="text-error-red font-semibold">
                        ✗ {invalidCount} Invalid
                      </span>
                    )}
                    {underReviewCount > 0 && (
                      <span className="text-primary-navy font-bold animate-pulse">
                        ● {underReviewCount} Under Review
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Button 
                    variant="primary" 
                    onClick={() => router.push(`/staff/verify/${app.id}`)}
                    className="text-xs py-2 bg-primary-navy hover:bg-primary-navy/90"
                  >
                    Verify Files
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </BentoCard>
            );
          })
        )}
      </div>
    </div>
  );
}
