import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { Application, ApplicationDocument } from "../types";

interface DraftApplicationOwner {
  studentId: string;
  studentName: string;
  email?: string;
  phoneNumber?: string;
}

const pendingDraftCreates = new Map<string, Promise<Application>>();

function buildDraftApplication({
  studentId,
  studentName,
  email = "",
  phoneNumber = "",
}: DraftApplicationOwner): Omit<Application, "id"> {
  return {
    studentId,
    status: "draft",
    progress: 10,
    personalInfo: {
      fullName: studentName,
      gender: "",
      dateOfBirth: "",
      nationality: "Cambodian",
      nationalId: "",
      photoUrl: "",
    },
    contactInfo: {
      phone: phoneNumber,
      email,
      address: "",
      city: "",
    },
    academicBackground: {
      highSchoolName: "",
      graduationYear: null,
      grade: "",
      certificateNumber: "",
    },
    programSelection: {
      facultyId: "",
      departmentId: "",
      majorId: "",
      shift: "",
      academicYear: "",
    },
    guardianInfo: {
      name: "",
      phone: "",
      relationship: "",
      address: "",
    },
    submittedAt: null,
    updatedAt: new Date().toISOString(),
    reviewerComments: "",
  };
}

export const applicationService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<Application[]>("/applications", options);
  },
  getById: (id: string) => {
    return apiClient.get<Application>(`/applications/${id}`);
  },
  getByStudentId: async (studentId: string) => {
    const list = await apiClient.get<Application[]>(`/applications`, {
      filters: { studentId },
    });
    return list.length > 0 ? list[0] : null;
  },
  create: (app: Omit<Application, "id">) => {
    const data = {
      ...app,
      id: `APP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    };
    return apiClient.post<Application>("/applications", data);
  },
  createDraft: (owner: DraftApplicationOwner) => {
    return applicationService.create(buildDraftApplication(owner));
  },
  getOrCreateDraft: async (owner: DraftApplicationOwner) => {
    const existing = await applicationService.getByStudentId(owner.studentId);
    if (existing) return existing;

    const pendingCreate = pendingDraftCreates.get(owner.studentId);
    if (pendingCreate) return pendingCreate;

    const createRequest = applicationService
      .createDraft(owner)
      .finally(() => pendingDraftCreates.delete(owner.studentId));
    pendingDraftCreates.set(owner.studentId, createRequest);
    return createRequest;
  },
  update: (id: string, updates: Partial<Application>) => {
    return apiClient.patch<Application>(`/applications/${id}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/applications/${id}`);
  },
  submit: async (appId: string, studentName: string, studentId: string) => {
    // 1. Update application status
    const app = await apiClient.patch<Application>(`/applications/${appId}`, {
      status: "submitted",
      progress: 100,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Create timeline event
    await apiClient.post("/timelineEvents", {
      id: `evt-${Date.now()}`,
      applicationId: appId,
      status: "submitted",
      title: "Application Submitted",
      description: "Application locked and submitted for admission review",
      actorName: studentName,
      createdAt: new Date().toISOString(),
    });

    // 3. Create notification
    await apiClient.post("/notifications", {
      id: `notif-${Date.now()}`,
      userId: studentId,
      title: "Application Submitted",
      message: `Your application ${appId} has been submitted successfully.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return app;
  },
};

export const documentService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<ApplicationDocument[]>("/documents", options);
  },
  getById: (id: string) => {
    return apiClient.get<ApplicationDocument>(`/documents/${id}`);
  },
  getByApplicationId: (applicationId: string) => {
    return apiClient.get<ApplicationDocument[]>("/documents", {
      filters: { applicationId },
    });
  },
  create: (doc: Omit<ApplicationDocument, "id">) => {
    const data = { ...doc, id: `doc-${Date.now()}` };
    return apiClient.post<ApplicationDocument>("/documents", data);
  },
  update: (id: string, updates: Partial<ApplicationDocument>) => {
    return apiClient.patch<ApplicationDocument>(`/documents/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/documents/${id}`);
  },
};
