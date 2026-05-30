import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { applicationService } from "./application";
import { User } from "../types";

export const userService = {
  getAll: (options?: ApiQueryOptions) => {
    return apiClient.get<User[]>("/users", options);
  },
  getById: (id: string) => {
    return apiClient.get<User>(`/users/${id}`);
  },
  getByEmail: (email: string) => {
    return apiClient.get<User[]>(`/users`, { filters: { email } });
  },
  create: (user: Omit<User, "id">) => {
    const newUser = {
      ...user,
      id: `usr-${Date.now()}`,
    };
    return apiClient.post<User>("/users", newUser);
  },
  update: (id: string, updates: Partial<User>) => {
    return apiClient.patch<User>(`/users/${id}`, updates);
  },
  delete: (id: string) => {
    return apiClient.delete<void>(`/users/${id}`);
  },

  // Student registration orchestration
  registerStudent: async (data: { fullName: string; email: string; phoneNumber: string }) => {
    // 1. Create User
    const user = await userService.create({
      name: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: "student",
      avatarUrl: "",
    });

    // 2. Create blank Student Profile
    await apiClient.post("/studentProfiles", {
      id: `prof-${Date.now()}`,
      studentId: user.id,
      gender: "",
      dateOfBirth: "",
      nationality: "Cambodian",
      nationalId: "",
      address: "",
      city: "",
      phone: data.phoneNumber,
      email: data.email,
    });

    // 3. Create Draft Application
    const application = await applicationService.createDraft({
      studentId: user.id,
      studentName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });

    // 4. Create timeline event for Application Created
    await apiClient.post("/timelineEvents", {
      id: `evt-${Date.now()}`,
      applicationId: application.id,
      status: "draft",
      title: "Application Created",
      description: "Application initialized as draft",
      actorName: data.fullName,
      createdAt: new Date().toISOString(),
    });

    return user;
  },
};
