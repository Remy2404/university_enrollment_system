import { apiClient, ApiQueryOptions } from "../lib/api-client";
import { ReviewNote, ApplicationTimelineEvent, Application } from "../types";

export const reviewService = {
  // Review Notes CRUD
  getNotes: (options?: ApiQueryOptions) => {
    return apiClient.get<ReviewNote[]>("/reviewNotes", options);
  },
  getNotesByApplicationId: (applicationId: string) => {
    return apiClient.get<ReviewNote[]>("/reviewNotes", {
      filters: { applicationId },
      sort: "-createdAt",
    });
  },
  createNote: (note: Omit<ReviewNote, "id">) => {
    const data = { ...note, id: `note-${Date.now()}` };
    return apiClient.post<ReviewNote>("/reviewNotes", data);
  },
  updateNote: (id: string, updates: Partial<ReviewNote>) => {
    return apiClient.patch<ReviewNote>(`/reviewNotes/${id}`, updates);
  },
  deleteNote: (id: string) => {
    return apiClient.delete<void>(`/reviewNotes/${id}`);
  },

  // Timeline Events CRUD
  getEvents: (options?: ApiQueryOptions) => {
    return apiClient.get<ApplicationTimelineEvent[]>("/timelineEvents", options);
  },
  getEventsByApplicationId: (applicationId: string) => {
    return apiClient.get<ApplicationTimelineEvent[]>("/timelineEvents", {
      filters: { applicationId },
      sort: "createdAt",
    });
  },
  createEvent: (event: Omit<ApplicationTimelineEvent, "id">) => {
    const data = { ...event, id: `evt-${Date.now()}` };
    return apiClient.post<ApplicationTimelineEvent>("/timelineEvents", data);
  },
  updateEvent: (id: string, updates: Partial<ApplicationTimelineEvent>) => {
    return apiClient.patch<ApplicationTimelineEvent>(`/timelineEvents/${id}`, updates);
  },
  deleteEvent: (id: string) => {
    return apiClient.delete<void>(`/timelineEvents/${id}`);
  },

  // Transactional Staff Review Action (Approve, Reject, Request Correction)
  submitReview: async (data: {
    applicationId: string;
    studentId: string;
    reviewerId: string;
    reviewerName: string;
    status: "approved" | "rejected" | "need_correction";
    comment: string;
  }) => {
    const statusMap = {
      approved: "Approved",
      rejected: "Rejected",
      need_correction: "Correction Required",
    };

    const statusTitle = statusMap[data.status];

    // 1. Update Application status and reviewer comment
    const app = await apiClient.patch<Application>(`/applications/${data.applicationId}`, {
      status: data.status,
      reviewerComments: data.comment,
      updatedAt: new Date().toISOString(),
    });

    // 2. Create Review Note
    if (data.comment.trim()) {
      await apiClient.post("/reviewNotes", {
        id: `note-${Date.now()}`,
        applicationId: data.applicationId,
        reviewerId: data.reviewerId,
        reviewerName: data.reviewerName,
        comment: data.comment,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Create Timeline Event
    await apiClient.post("/timelineEvents", {
      id: `evt-${Date.now()}`,
      applicationId: data.applicationId,
      status: data.status,
      title: statusTitle,
      description: data.comment || `Application marked as ${statusTitle}`,
      actorName: data.reviewerName,
      createdAt: new Date().toISOString(),
    });

    // 4. Create Student Notification
    await apiClient.post("/notifications", {
      id: `notif-${Date.now()}`,
      userId: data.studentId,
      title: statusTitle,
      message: data.comment || `Your application status has been updated to ${statusTitle}.`,
      type: data.status === "approved" ? "success" : data.status === "rejected" ? "error" : "warning",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return app;
  },
};
