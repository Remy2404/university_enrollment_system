import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { StudentProfile } from "../types";

export const profileService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<StudentProfile[]>("/studentProfiles", options);
  },
  getById: (id: string) => {
    return apiClient.get<StudentProfile>(`/studentProfiles/${id}`);
  },
  getByStudentId: async (studentId: string) => {
    const list = await apiClient.get<StudentProfile[]>(`/studentProfiles`, {
      filters: { studentId },
    });
    return list.length > 0 ? list[0] : null;
  },
  create: (profile: Omit<StudentProfile, "id">) => {
    const newProfile = {
      ...profile,
      id: `prof-${Date.now()}`,
    };
    return apiClient.post<StudentProfile>("/studentProfiles", newProfile);
  },
  update: (id: string, updates: Partial<StudentProfile>) => {
    return apiClient.patch<StudentProfile>(`/studentProfiles/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/studentProfiles/${id}`);
  },
};
