import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { Application, ApplicationDocument } from "../types";

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
