import { createClient } from "@/src/lib/supabase/client";
import type { Enums, Tables } from "@/src/types/database";
import type { ApplicationTimelineEvent, ReviewNote } from "@/src/types";
import { applicationService } from "./application";
import { throwIfError } from "./supabase-helpers";

type ApplicationStatus = Enums<"application_status">;

function toReviewStatus(status: "approved" | "rejected" | "need_correction"): ApplicationStatus {
  if (status === "approved") return "accepted";
  if (status === "need_correction") return "documents_required";
  return status;
}

function statusTitle(status: ApplicationStatus) {
  const titles: Record<ApplicationStatus, string> = {
    draft: "Application Created",
    submitted: "Application Submitted",
    under_review: "Application Under Review",
    documents_required: "Document Corrections Required",
    accepted: "Application Accepted",
    rejected: "Application Rejected",
    enrolled: "Enrollment Completed",
    withdrawn: "Application Withdrawn",
  };
  return titles[status];
}

function statusDescription(status: ApplicationStatus, reason: string | null) {
  return reason || statusTitle(status);
}

interface ReviewWithProfile extends Tables<"application_reviews"> {
  profiles: { full_name: string } | null;
}

interface HistoryWithProfile extends Tables<"application_status_history"> {
  profiles: { full_name: string } | null;
}

export const reviewService = {
  getNotesByApplicationId: async (applicationId: string): Promise<ReviewNote[]> => {
    const { data, error } = await createClient()
      .from("application_reviews")
      .select("*, profiles!application_reviews_reviewer_id_fkey(full_name)")
      .eq("application_id", applicationId)
      .order("reviewed_at", { ascending: false });
    throwIfError(error, "Failed to load review notes");

    return (data ?? []).map((row) => {
      const review = row as ReviewWithProfile;
      return {
        id: review.id,
        applicationId: review.application_id,
        reviewerId: review.reviewer_id,
        reviewerName: review.profiles?.full_name ?? "Admission Staff",
        comment: review.notes ?? "",
        createdAt: review.reviewed_at,
      };
    });
  },

  getEventsByApplicationId: async (applicationId: string): Promise<ApplicationTimelineEvent[]> => {
    const { data, error } = await createClient()
      .from("application_status_history")
      .select("*, profiles!application_status_history_changed_by_fkey(full_name)")
      .eq("application_id", applicationId)
      .order("changed_at", { ascending: true });
    throwIfError(error, "Failed to load application timeline");

    return (data ?? []).map((row) => {
      const history = row as HistoryWithProfile;
      return {
        id: history.id,
        applicationId: history.application_id,
        status: history.to_status,
        title: statusTitle(history.to_status),
        description: statusDescription(history.to_status, history.change_reason),
        actorName: history.profiles?.full_name ?? "System",
        createdAt: history.changed_at,
      };
    });
  },

  submitReview: async (data: {
    applicationId: string;
    status: "approved" | "rejected" | "need_correction";
    comment: string;
  }) => {
    const { error } = await createClient().rpc("submit_application_review", {
      p_application_id: data.applicationId,
      p_status: toReviewStatus(data.status),
      p_notes: data.comment,
    });
    throwIfError(error, "Failed to submit application review");
    return applicationService.getById(data.applicationId);
  },
};
