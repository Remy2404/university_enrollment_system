"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  AlertTriangle,
  User,
  BookOpen,
  Users,
  CheckCircle2,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";
import { DocumentStatusCard } from "../../components/ui/DocumentStatusCard";
import { FileUploadDropzone } from "../../components/ui/FileUploadDropzone";
import { ProgressStepper } from "../../components/ui/ProgressStepper";
import { LoadingState } from "../../components/ui/States";

import { applicationService, documentService } from "@/src/services/application";
import {
  canStudentModifyApplication,
  formatDocumentLabels,
  getDocumentReadiness,
  requiredApplicationDocuments,
} from "@/src/services/application-document-requirements";
import { facultyService, departmentService, majorService } from "@/src/services/program";
import { Application, Faculty, Department, Major, User as UserRecord, ApplicationDocument } from "@/src/types";
import { useAuth } from "@/src/providers/auth-provider";

const steps = [
  "Personal Info",
  "Contact Info",
  "Academic Info",
  "Program Select",
  "Guardian Info",
  "Documents",
  "Review & Submit",
];

export default function EnrollmentFormPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Entities state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([]);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<Application["status"]>("draft");
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [activeUploadType, setActiveUploadType] = useState<ApplicationDocument["type"] | null>(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState<ApplicationDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const isSubmitInFlight = useRef(false);

  // Form states
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationality: "Cambodian",
    nationalId: "",
    photoUrl: "",
    // Contact Info
    phone: "",
    email: "",
    address: "",
    city: "",
    // Academic Info
    highSchoolName: "",
    graduationYear: "" as string | number,
    grade: "",
    certificateNumber: "",
    // Program Select
    facultyId: "",
    departmentId: "",
    majorId: "",
    shift: "Morning",
    academicYear: "2026-2027",
    // Guardian Info
    guardianName: "",
    guardianPhone: "",
    relationship: "Father",
    guardianAddress: "",
  });

  const documentReadiness = getDocumentReadiness(documents);
  const documentsBlockingSubmission = [...documentReadiness.missing, ...documentReadiness.invalid];

  const refreshDocuments = useCallback(async (applicationId: string) => {
    const docs = await documentService.getByApplicationId(applicationId);
    setDocuments(docs);
  }, []);

  const handleDocumentUpload = async (file: File) => {
    if (!activeUploadType || !appId || !studentId) {
      toast.error("Application is not ready.");
      return;
    }

    const documentType = activeUploadType;
    setActiveUploadType(null);
    setUploadProgress((prev) => ({ ...prev, [documentType]: 50 }));
    try {
      await documentService.upload({
        applicationId: appId,
        studentId,
        type: documentType,
        file,
      });
      await refreshDocuments(appId);
      toast.success(`${file.name} uploaded successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload document.");
    } finally {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[documentType];
        return next;
      });
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!appId) return;

    try {
      await documentService.delete(documentId);
      await refreshDocuments(appId);
      toast.success("Document deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete document.");
    }
  };

  const loadFormContext = useCallback(async (user: UserRecord) => {
    try {
      // 1. Load active application
      const app = await applicationService.getOrCreateDraft({
        studentId: user.id,
        studentName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
      setStudentId(user.id);
      if (app) {
        setAppId(app.id);
        setApplicationStatus(app.status);
        
        if (!canStudentModifyApplication(app.status)) {
          toast.info("Admission review has started, so your enrollment form is now locked.");
          router.push("/student/status");
          return;
        }

        setFormData({
          fullName: app.personalInfo?.fullName || "",
          gender: app.personalInfo?.gender || "Male",
          dateOfBirth: app.personalInfo?.dateOfBirth || "",
          nationality: app.personalInfo?.nationality || "Cambodian",
          nationalId: app.personalInfo?.nationalId || "",
          photoUrl: app.personalInfo?.photoUrl || "",

          phone: app.contactInfo?.phone || "",
          email: app.contactInfo?.email || "",
          address: app.contactInfo?.address || "",
          city: app.contactInfo?.city || "",

          highSchoolName: app.academicBackground?.highSchoolName || "",
          graduationYear: app.academicBackground?.graduationYear || "",
          grade: app.academicBackground?.grade || "",
          certificateNumber: app.academicBackground?.certificateNumber || "",

          facultyId: app.programSelection?.facultyId || "",
          departmentId: app.programSelection?.departmentId || "",
          majorId: app.programSelection?.majorId || "",
          shift: app.programSelection?.shift || "Morning",
          academicYear: app.programSelection?.academicYear || "2026-2027",

          guardianName: app.guardianInfo?.name || "",
          guardianPhone: app.guardianInfo?.phone || "",
          relationship: app.guardianInfo?.relationship || "Father",
          guardianAddress: app.guardianInfo?.address || "",
        });

        try {
          await refreshDocuments(app.id);
        } catch (err) {
          console.error("Failed to load verification documents", err);
          toast.error("Failed to load verification documents.");
        }
      }

      // 2. Load program structures
      const facs = await facultyService.getAll({ filters: { status: "active" } });
      const depts = await departmentService.getAll({ filters: { status: "active" } });
      const mjs = await majorService.getAll({ filters: { status: "active" } });

      setFaculties(facs);
      setDepartments(depts);
      setMajors(mjs);

      // Pre-filter depts and majors if values exist
      if (app?.programSelection?.facultyId) {
        setFilteredDepts(depts.filter((d) => d.facultyId === app.programSelection.facultyId));
      }
      if (app?.programSelection?.departmentId) {
        setFilteredMajors(mjs.filter((m) => m.departmentId === app.programSelection.departmentId));
      }

    } catch {
      toast.error("Failed to load application form context.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshDocuments, router]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => void loadFormContext(user), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthLoading, loadFormContext, router, user]);

  // Handle cascading dropdowns
  const handleFacultyChange = (fId: string) => {
    setFormData((prev) => ({ ...prev, facultyId: fId, departmentId: "", majorId: "" }));
    setFilteredDepts(departments.filter((d) => d.facultyId === fId));
    setFilteredMajors([]);
  };

  const handleDeptChange = (dId: string) => {
    setFormData((prev) => ({ ...prev, departmentId: dId, majorId: "" }));
    setFilteredMajors(majors.filter((m) => m.departmentId === dId));
  };

  // Form input validation for active step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return false;
        if (!formData.dateOfBirth) return false;
        if (!formData.nationalId.trim()) return false;
        return true;
      case 2:
        if (!formData.phone.trim()) return false;
        if (!formData.email.trim()) return false;
        if (!formData.address.trim()) return false;
        return true;
      case 3:
        if (!formData.highSchoolName.trim()) return false;
        if (!formData.graduationYear) return false;
        if (!formData.grade.trim()) return false;
        if (!formData.certificateNumber.trim()) return false;
        return true;
      case 4:
        if (!formData.facultyId) return false;
        if (!formData.departmentId) return false;
        if (!formData.majorId) return false;
        return true;
      case 5:
        if (!formData.guardianName.trim()) return false;
        if (!formData.guardianPhone.trim()) return false;
        return true;
      case 6:
        return documentReadiness.readyForSubmission;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      if (currentStep === 6) {
        toast.error(`Upload or replace the required files: ${formatDocumentLabels(documentsBlockingSubmission)}.`);
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async () => {
    if (!appId) {
      toast.error("Application draft is not ready. Please refresh and try again.");
      return;
    }

    setIsSaving(true);
    try {
      await applicationService.update(appId, {
        progress: Math.min(95, (completedSteps.length + 1) * 14),
        personalInfo: {
          fullName: formData.fullName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          nationalId: formData.nationalId,
          photoUrl: formData.photoUrl,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
        },
        academicBackground: {
          highSchoolName: formData.highSchoolName,
          graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
          grade: formData.grade,
          certificateNumber: formData.certificateNumber,
        },
        programSelection: {
          facultyId: formData.facultyId,
          departmentId: formData.departmentId,
          majorId: formData.majorId,
          shift: formData.shift,
          academicYear: formData.academicYear,
        },
        guardianInfo: {
          name: formData.guardianName,
          phone: formData.guardianPhone,
          relationship: formData.relationship,
          address: formData.guardianAddress,
        },
      });

      toast.success("Application draft saved successfully.");
    } catch {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!appId || !studentId) {
      toast.error("Application draft is not ready. Please refresh and try again.");
      setShowSubmitModal(false);
      return;
    }

    if (isSubmitInFlight.current) return;

    // Run full validation across steps
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        const message = s === 6
          ? `Upload or replace the required files: ${formatDocumentLabels(documentsBlockingSubmission)}.`
          : `Please complete all fields in Step ${s} before submitting.`;
        toast.error(message);
        setCurrentStep(s);
        setShowSubmitModal(false);
        return;
      }
    }

    isSubmitInFlight.current = true;
    setIsSaving(true);
    try {
      // 1. Update draft content first
      await applicationService.update(appId, {
        personalInfo: {
          fullName: formData.fullName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          nationalId: formData.nationalId,
          photoUrl: formData.photoUrl,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
        },
        academicBackground: {
          highSchoolName: formData.highSchoolName,
          graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
          grade: formData.grade,
          certificateNumber: formData.certificateNumber,
        },
        programSelection: {
          facultyId: formData.facultyId,
          departmentId: formData.departmentId,
          majorId: formData.majorId,
          shift: formData.shift,
          academicYear: formData.academicYear,
        },
        guardianInfo: {
          name: formData.guardianName,
          phone: formData.guardianPhone,
          relationship: formData.relationship,
          address: formData.guardianAddress,
        },
      });

      // 2. Submit transaction
      await applicationService.submit(appId);
      
      toast.success("Application submitted successfully!");
      router.push("/student/status");
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      isSubmitInFlight.current = false;
      setIsSaving(false);
      setShowSubmitModal(false);
    }
  };

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary-navy" />
            Enrollment Form Stepper
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            Complete the form steps to submit your official application
          </p>
        </div>
        <Button variant="secondary" onClick={handleSaveDraft} isLoading={isSaving} disabled={currentStep === 7}>
          <Save className="w-4 h-4 mr-1.5" />
          {applicationStatus === "draft" ? "Save Draft" : "Save Changes"}
        </Button>
      </div>

      {applicationStatus === "submitted" && (
        <div className="p-4 bg-soft-blue/20 border border-soft-blue rounded-bento text-sm text-slate-gray leading-relaxed">
          <span className="font-bold text-primary-navy">Updates available:</span> Your application is queued for review. You can still update your details and verification documents until admission staff begin reviewing it.
        </div>
      )}

      {applicationStatus === "need_correction" && (
        <div className="p-4 bg-warning-light/20 border border-warning-amber/40 rounded-bento text-sm text-slate-gray leading-relaxed">
          <span className="font-bold text-warning-amber">Corrections requested:</span> Review your details and replace any invalid documents before submitting the corrected application.
        </div>
      )}

      {/* Stepper progress indicator */}
      <BentoCard>
        <ProgressStepper
          currentStep={currentStep}
          steps={steps}
          completedSteps={completedSteps}
        />
      </BentoCard>

      {/* Step Panels */}
      <BentoCard className="min-h-[350px] flex flex-col justify-between">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-academic-blue pb-3 border-b border-[#E2E8F0] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary-navy">
              {currentStep}
            </span>
            {steps[currentStep - 1]}
          </h2>

          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Full Name <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sok Dara"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Date of Birth <span className="text-error-red">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  National ID Number <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456789"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Contact Information */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Phone Number <span className="text-error-red">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+855 12 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Email Address <span className="text-error-red">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="dara@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Current Address <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="St. 271, Sangkat Boeung Keng Kang"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Province / City
                </label>
                <input
                  type="text"
                  placeholder="Phnom Penh"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Academic Background */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  High School Name <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bak Touk High School"
                  value={formData.highSchoolName}
                  onChange={(e) => setFormData({ ...formData, highSchoolName: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Graduation Year <span className="text-error-red">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="2025"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Grade / Score <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="A"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Certificate Number <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="HS-2025-99881"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Program Selection (Cascading Dropdowns) */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Select Faculty <span className="text-error-red">*</span>
                </label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="">-- Select Faculty --</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Select Department <span className="text-error-red">*</span>
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  disabled={!formData.facultyId}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="">-- Select Department --</option>
                  {filteredDepts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Select Major <span className="text-error-red">*</span>
                </label>
                <select
                  value={formData.majorId}
                  onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                  disabled={!formData.departmentId}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="">-- Select Major --</option>
                  {filteredMajors.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Study Shift
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Parent / Guardian Info */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Guardian Full Name <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sok Meas"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Relationship
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Guardian / Relative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Guardian Phone Number <span className="text-error-red">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+855 12 111 222"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-academic-blue mb-1.5">
                  Guardian Address
                </label>
                <input
                  type="text"
                  placeholder="St. 271, Sangkat Boeung Keng Kang, Phnom Penh"
                  value={formData.guardianAddress}
                  onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                  className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Verification Documents */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-bento border border-soft-blue bg-soft-blue/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-academic-blue">Complete your verification checklist</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-gray">
                    Upload all five required files before submission. You can replace a file later while the application is waiting for staff review.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-navy">
                  {documentReadiness.uploadedCount}/{documentReadiness.requiredCount} uploaded
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {requiredApplicationDocuments.map((item) => {
                  const document = documents.find((entry) => entry.type === item.type);
                  return (
                    <DocumentStatusCard
                      key={item.type}
                      documentType={item.type}
                      documentLabel={item.label}
                      docRecord={document}
                      uploadProgress={uploadProgress[item.type]}
                      onUploadClick={() => setActiveUploadType(item.type)}
                      onDeleteClick={() => document && void handleDocumentDelete(document.id)}
                      onPreviewClick={() => document && setActivePreviewDoc(document)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Review & Submit Summary */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-bento flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-academic-blue">
                    Final Submission Check
                  </p>
                  <p className="text-[11px] text-slate-gray mt-1 leading-relaxed">
                    Please review all categories below. You can still correct details while the application is queued. Editing locks when admission staff begin active review.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info Summary */}
                <div className="p-4 border border-[#E2E8F0] rounded-bento space-y-2">
                  <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <User className="w-4 h-4 text-primary-navy" />
                    Personal & Contact Info
                  </h3>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Name:</span> {formData.fullName}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Gender:</span> {formData.gender}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Date of Birth:</span> {formData.dateOfBirth}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Nationality:</span> {formData.nationality}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">National ID:</span> {formData.nationalId}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Phone:</span> {formData.phone}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Email:</span> {formData.email}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Address:</span> {formData.address}, {formData.city}</p>
                </div>

                {/* Program & Academic Selection Summary */}
                <div className="p-4 border border-[#E2E8F0] rounded-bento space-y-2">
                  <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-4 h-4 text-primary-navy" />
                    Academic & Program Selection
                  </h3>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">High School:</span> {formData.highSchoolName}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Graduation Year:</span> {formData.graduationYear}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Grade:</span> {formData.grade}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Faculty:</span> {faculties.find(f => f.id === formData.facultyId)?.name || "-"}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Department:</span> {departments.find(d => d.id === formData.departmentId)?.name || "-"}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Major:</span> {majors.find(m => m.id === formData.majorId)?.name || "-"}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Shift:</span> {formData.shift}</p>
                </div>

                {/* Guardian Summary */}
                <div className="p-4 border border-[#E2E8F0] rounded-bento space-y-2 md:col-span-2">
                  <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Users className="w-4 h-4 text-primary-navy" />
                    Parent / Guardian Information
                  </h3>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Guardian Name:</span> {formData.guardianName} ({formData.relationship})</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Phone:</span> {formData.guardianPhone}</p>
                  <p className="text-xs text-slate-gray"><span className="font-semibold text-academic-blue">Address:</span> {formData.guardianAddress || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-[#E2E8F0] mt-8">
          <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>

          {currentStep < 7 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowSubmitModal(true)} className="bg-success-green hover:bg-emerald-700 border-success-green">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Submit Application
            </Button>
          )}
        </div>
      </BentoCard>

      {activeUploadType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg space-y-4 rounded-bento border border-[#E2E8F0] bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-md font-bold text-academic-blue">
                Upload {requiredApplicationDocuments.find(({ type }) => type === activeUploadType)?.label}
              </h3>
              <button
                type="button"
                aria-label="Close upload dialog"
                onClick={() => setActiveUploadType(null)}
                className="text-cool-gray hover:text-primary-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FileUploadDropzone onFileSelect={handleDocumentUpload} />
          </div>
        </div>
      )}

      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl space-y-4 rounded-bento border border-[#E2E8F0] bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-md font-bold text-academic-blue">Preview: {activePreviewDoc.name}</h3>
              <button
                type="button"
                aria-label="Close preview dialog"
                onClick={() => setActivePreviewDoc(null)}
                className="text-cool-gray hover:text-primary-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-bento border border-dashed border-[#E2E8F0] bg-slate-50 py-20 text-center">
              <FileText className="mb-4 h-16 w-16 text-primary-navy" />
              <p className="text-sm font-bold text-academic-blue">{activePreviewDoc.name}</p>
              <a
                href={activePreviewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-navy px-3 py-2 text-xs font-semibold text-white"
              >
                Open secure preview
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Poka-Yoke Double Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-bento border border-[#E2E8F0] p-6 shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success-green">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-academic-blue">Confirm Application Submission</h3>
              <p className="text-xs text-slate-gray mt-1.5 leading-relaxed">
                Are you sure you want to submit your application? This routes your completed document checklist to the admission staff queue. You can still correct details until active review begins.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <Button variant="secondary" onClick={() => setShowSubmitModal(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitApplication} isLoading={isSaving} className="bg-success-green hover:bg-emerald-700 border-success-green">
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
