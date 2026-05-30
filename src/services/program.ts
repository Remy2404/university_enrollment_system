import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { Faculty, Department, Major, EnrollmentPeriod } from "../types";

export const facultyService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<Faculty[]>("/faculties", options);
  },
  getById: (id: string) => {
    return apiClient.get<Faculty>(`/faculties/${id}`);
  },
  create: (faculty: Omit<Faculty, "id">) => {
    const data = { ...faculty, id: `fac-${Date.now()}` };
    return apiClient.post<Faculty>("/faculties", data);
  },
  update: (id: string, updates: Partial<Faculty>) => {
    return apiClient.patch<Faculty>(`/faculties/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/faculties/${id}`);
  },
};

export const departmentService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<Department[]>("/departments", options);
  },
  getById: (id: string) => {
    return apiClient.get<Department>(`/departments/${id}`);
  },
  getByFacultyId: (facultyId: string) => {
    return apiClient.get<Department[]>("/departments", { filters: { facultyId } });
  },
  create: (dept: Omit<Department, "id">) => {
    const data = { ...dept, id: `dept-${Date.now()}` };
    return apiClient.post<Department>("/departments", data);
  },
  update: (id: string, updates: Partial<Department>) => {
    return apiClient.patch<Department>(`/departments/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/departments/${id}`);
  },
};

export const majorService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<Major[]>("/majors", options);
  },
  getById: (id: string) => {
    return apiClient.get<Major>(`/majors/${id}`);
  },
  getByDepartmentId: (departmentId: string) => {
    return apiClient.get<Major[]>("/majors", { filters: { departmentId } });
  },
  create: (major: Omit<Major, "id">) => {
    const data = { ...major, id: `maj-${Date.now()}` };
    return apiClient.post<Major>("/majors", data);
  },
  update: (id: string, updates: Partial<Major>) => {
    return apiClient.patch<Major>(`/majors/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/majors/${id}`);
  },
};

export const periodService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<EnrollmentPeriod[]>("/enrollmentPeriods", options);
  },
  getById: (id: string) => {
    return apiClient.get<EnrollmentPeriod>(`/enrollmentPeriods/${id}`);
  },
  create: (period: Omit<EnrollmentPeriod, "id">) => {
    const data = { ...period, id: `period-${Date.now()}` };
    return apiClient.post<EnrollmentPeriod>("/enrollmentPeriods", data);
  },
  update: (id: string, updates: Partial<EnrollmentPeriod>) => {
    return apiClient.patch<EnrollmentPeriod>(`/enrollmentPeriods/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/enrollmentPeriods/${id}`);
  },
};
