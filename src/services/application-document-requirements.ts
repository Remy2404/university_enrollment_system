import type { Application, ApplicationDocument } from "@/src/types";

export const requiredApplicationDocuments = [
  { type: "national_id", label: "National ID Card" },
  { type: "high_school_certificate", label: "High School Certificate" },
  { type: "birth_certificate", label: "Birth Certificate" },
  { type: "student_photo", label: "Student Photo" },
  { type: "application_form", label: "Application Form" },
] as const satisfies ReadonlyArray<{
  type: ApplicationDocument["type"];
  label: string;
}>;

export function canStudentModifyApplication(status: Application["status"]) {
  return status === "draft" || status === "submitted" || status === "need_correction";
}

export function getDocumentReadiness(documents: ApplicationDocument[]) {
  const documentsByType = new Map(documents.map((document) => [document.type, document]));
  const missing = requiredApplicationDocuments.filter(({ type }) => !documentsByType.has(type));
  const invalid = requiredApplicationDocuments.filter(({ type }) => documentsByType.get(type)?.status === "invalid");
  const pending = requiredApplicationDocuments.filter(({ type }) => {
    const status = documentsByType.get(type)?.status;
    return status === "uploaded" || status === "under_review";
  });
  const verified = requiredApplicationDocuments.filter(({ type }) => documentsByType.get(type)?.status === "valid");

  return {
    missing,
    invalid,
    pending,
    verified,
    uploadedCount: requiredApplicationDocuments.length - missing.length,
    requiredCount: requiredApplicationDocuments.length,
    allUploaded: missing.length === 0,
    readyForSubmission: missing.length === 0 && invalid.length === 0,
    allVerified: verified.length === requiredApplicationDocuments.length,
  };
}

export function formatDocumentLabels(documents: ReadonlyArray<{ label: string }>) {
  return documents.map(({ label }) => label).join(", ");
}
