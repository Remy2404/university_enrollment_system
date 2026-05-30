import { createClient } from "@/src/lib/supabase/client";
import type { ApiQueryOptions, PaginatedResponse, QueryFilter } from "@/src/lib/api-client";
import type { Application, ApplicationDocument } from "@/src/types";
import type { Enums, Json, Tables } from "@/src/types/database";
import { asJsonObject, jsonNumber, jsonString, requireData, throwIfError } from "./supabase-helpers";

type ApplicationRow = Tables<"applications">;
type ApplicationStatus = Enums<"application_status">;
type DocumentRow = Tables<"application_documents">;
type DocumentType = Enums<"document_type">;
type DocumentStatus = Enums<"document_status">;

interface DraftApplicationOwner {
  studentId: string;
  studentName: string;
  email?: string;
  phoneNumber?: string;
}

interface ProgramContext {
  facultyId: string;
  departmentId: string;
  majorId: string;
}

const allowedDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxDocumentSizeBytes = 10 * 1024 * 1024;
const pendingDraftCreates = new Map<string, Promise<Application>>();

function toUiApplicationStatus(status: ApplicationStatus): Application["status"] {
  if (status === "accepted" || status === "enrolled") return "approved";
  if (status === "documents_required") return "need_correction";
  if (status === "under_review") return "pending_review";
  if (status === "withdrawn") return "rejected";
  return status;
}

function toDatabaseDocumentType(type: ApplicationDocument["type"]): DocumentType {
  if (type === "student_photo") return "profile_photo";
  if (type === "application_form") return "other";
  return type;
}

function toUiDocumentType(type: DocumentType): ApplicationDocument["type"] {
  if (type === "profile_photo") return "student_photo";
  if (type === "transcript" || type === "other") return "application_form";
  return type;
}

function toUiDocumentStatus(status: DocumentStatus): ApplicationDocument["status"] {
  if (status === "verified") return "valid";
  if (status === "rejected") return "invalid";
  return "under_review";
}

function toDatabaseDocumentStatus(status: ApplicationDocument["status"]): DocumentStatus {
  if (status === "valid") return "verified";
  if (status === "invalid") return "rejected";
  return "pending_review";
}

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

function mapApplication(
  row: ApplicationRow,
  program: ProgramContext | undefined,
  reviewerComments: string,
): Application {
  const personal = asJsonObject(row.personal_info);
  const contact = asJsonObject(row.contact_info);
  const academic = asJsonObject(row.academic_background);
  const guardian = asJsonObject(row.guardian_info);

  return {
    id: row.id,
    studentId: row.applicant_id,
    status: toUiApplicationStatus(row.status),
    progress: row.progress_percentage ?? 0,
    personalInfo: {
      fullName: jsonString(personal.fullName),
      gender: jsonString(personal.gender),
      dateOfBirth: jsonString(personal.dateOfBirth),
      nationality: jsonString(personal.nationality),
      nationalId: jsonString(personal.nationalId),
      photoUrl: jsonString(personal.photoUrl),
    },
    contactInfo: {
      phone: jsonString(contact.phone),
      email: jsonString(contact.email),
      address: jsonString(contact.address),
      city: jsonString(contact.city),
    },
    academicBackground: {
      highSchoolName: jsonString(academic.highSchoolName),
      graduationYear: jsonNumber(academic.graduationYear),
      grade: jsonString(academic.grade),
      certificateNumber: jsonString(academic.certificateNumber),
    },
    programSelection: {
      facultyId: program?.facultyId ?? "",
      departmentId: program?.departmentId ?? "",
      majorId: program?.majorId ?? "",
      shift: jsonString(academic.studyShift),
      academicYear: jsonString(academic.academicYear),
    },
    guardianInfo: {
      name: jsonString(guardian.name),
      phone: jsonString(guardian.phone),
      relationship: jsonString(guardian.relationship),
      address: jsonString(guardian.address),
    },
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    reviewerComments,
  };
}

async function loadApplicationModels(rows: ApplicationRow[]) {
  if (rows.length === 0) return [];

  const supabase = createClient();
  const applicationIds = rows.map((row) => row.id);
  const [{ data: choices, error: choicesError }, { data: reviews, error: reviewsError }] = await Promise.all([
    supabase.from("application_program_choices").select("application_id, program_id, priority").in("application_id", applicationIds).eq("priority", 1),
    supabase.from("application_reviews").select("application_id, notes, reviewed_at").in("application_id", applicationIds).order("reviewed_at", { ascending: false }),
  ]);

  throwIfError(choicesError, "Failed to load application program choices");
  throwIfError(reviewsError, "Failed to load application review notes");

  const programIds = [...new Set((choices ?? []).map((choice) => choice.program_id))];
  const { data: programs, error: programsError } = programIds.length
    ? await supabase.from("programs").select("id, department_id").in("id", programIds)
    : { data: [], error: null };
  throwIfError(programsError, "Failed to load application programs");

  const departmentIds = [...new Set((programs ?? []).map((program) => program.department_id))];
  const { data: departments, error: departmentsError } = departmentIds.length
    ? await supabase.from("departments").select("id, faculty_id").in("id", departmentIds)
    : { data: [], error: null };
  throwIfError(departmentsError, "Failed to load program departments");

  const departmentsById = new Map((departments ?? []).map((department) => [department.id, department]));
  const programsById = new Map((programs ?? []).map((program) => [program.id, program]));
  const choicesByApplicationId = new Map((choices ?? []).map((choice) => [choice.application_id, choice]));
  const notesByApplicationId = new Map<string, string>();

  for (const review of reviews ?? []) {
    if (!notesByApplicationId.has(review.application_id) && review.notes) {
      notesByApplicationId.set(review.application_id, review.notes);
    }
  }

  return rows.map((row) => {
    const choice = choicesByApplicationId.get(row.id);
    const program = choice ? programsById.get(choice.program_id) : undefined;
    const department = program ? departmentsById.get(program.department_id) : undefined;
    const programContext =
      choice && program && department
        ? {
            facultyId: department.faculty_id,
            departmentId: program.department_id,
            majorId: choice.program_id,
          }
        : undefined;

    return mapApplication(row, programContext, notesByApplicationId.get(row.id) ?? "");
  });
}

function mergeApplication(current: Application, updates: Partial<Application>): Application {
  return {
    ...current,
    ...updates,
    personalInfo: { ...current.personalInfo, ...updates.personalInfo },
    contactInfo: { ...current.contactInfo, ...updates.contactInfo },
    academicBackground: { ...current.academicBackground, ...updates.academicBackground },
    programSelection: { ...current.programSelection, ...updates.programSelection },
    guardianInfo: { ...current.guardianInfo, ...updates.guardianInfo },
  };
}

function containsFilter(value: unknown): value is QueryFilter {
  return Boolean(value && typeof value === "object" && "operator" in value && "value" in value);
}

function filterApplications(applications: Application[], options?: ApiQueryOptions) {
  const filters = options?.filters;
  if (!filters) return applications;

  return applications.filter((application) => {
    if (filters.status && application.status !== filters.status) return false;
    if (filters["programSelection.facultyId"] && application.programSelection.facultyId !== filters["programSelection.facultyId"]) return false;

    const nameFilter = filters["personalInfo.fullName"];
    if (containsFilter(nameFilter) && nameFilter.operator === "contains") {
      return application.personalInfo.fullName.toLowerCase().includes(String(nameFilter.value).toLowerCase());
    }

    return true;
  });
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const pages = Math.max(1, Math.ceil(items.length / limit));
  const currentPage = Math.min(Math.max(page, 1), pages);
  const first = (currentPage - 1) * limit;

  return {
    first,
    prev: currentPage > 1 ? currentPage - 1 : null,
    next: currentPage < pages ? currentPage + 1 : null,
    last: pages,
    pages,
    items: items.length,
    data: items.slice(first, first + limit),
  };
}

async function getOpenAdmissionPeriodId() {
  const { data, error } = await createClient()
    .from("admission_periods")
    .select("id")
    .eq("status", "open")
    .order("application_deadline", { ascending: true })
    .limit(1)
    .maybeSingle();

  throwIfError(error, "Failed to load active admission period");
  if (!data) throw new Error("No admission period is currently open.");
  return data.id;
}

async function saveApplication(application: Application) {
  const academicBackground: Json = {
    ...application.academicBackground,
    studyShift: application.programSelection.shift,
    academicYear: application.programSelection.academicYear,
  };
  const { error } = await createClient().rpc("save_application_draft", {
    p_application_id: application.id,
    p_progress_percentage: application.progress,
    p_personal_info: application.personalInfo,
    p_contact_info: application.contactInfo,
    p_academic_background: academicBackground,
    p_guardian_info: application.guardianInfo,
    p_program_id: application.programSelection.majorId || undefined,
  });
  throwIfError(error, "Failed to save application draft");
}

async function getApplications(): Promise<Application[]>;
async function getApplications(options: ApiQueryOptions & { page: number; limit: number }): Promise<PaginatedResponse<Application>>;
async function getApplications(options: ApiQueryOptions): Promise<Application[]>;
async function getApplications(options?: ApiQueryOptions): Promise<Application[] | PaginatedResponse<Application>> {
  const { data, error } = await createClient().from("applications").select("*").order("updated_at", { ascending: false });
  throwIfError(error, "Failed to load applications");
  const filtered = filterApplications(await loadApplicationModels(data ?? []), options);
  return options?.page && options.limit ? paginate(filtered, options.page, options.limit) : filtered;
}

export const applicationService = {
  getAll: getApplications,

  getById: async (id: string) => {
    const { data, error } = await createClient().from("applications").select("*").eq("id", id).single();
    throwIfError(error, "Failed to load application");
    return (await loadApplicationModels([requireData(data, "Failed to load application")]))[0];
  },

  getByStudentId: async (studentId: string) => {
    const { data, error } = await createClient()
      .from("applications")
      .select("*")
      .eq("applicant_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    throwIfError(error, "Failed to load student application");
    return data ? (await loadApplicationModels([data]))[0] : null;
  },

  create: async (application: Omit<Application, "id">) => {
    const { data, error } = await createClient().rpc("create_application_draft", {
      p_admission_period_id: await getOpenAdmissionPeriodId(),
    });
    throwIfError(error, "Failed to create application draft");
    const draft = mapApplication(requireData(data, "Failed to create application draft"), undefined, "");
    const merged = mergeApplication(draft, application);
    await saveApplication(merged);
    return applicationService.getById(draft.id);
  },

  createDraft: (owner: DraftApplicationOwner) => applicationService.create(buildDraftApplication(owner)),

  getOrCreateDraft: async (owner: DraftApplicationOwner) => {
    const existing = await applicationService.getByStudentId(owner.studentId);
    if (existing) return existing;

    const pendingCreate = pendingDraftCreates.get(owner.studentId);
    if (pendingCreate) return pendingCreate;

    const createRequest = applicationService.createDraft(owner).finally(() => pendingDraftCreates.delete(owner.studentId));
    pendingDraftCreates.set(owner.studentId, createRequest);
    return createRequest;
  },

  update: async (id: string, updates: Partial<Application>) => {
    const current = await applicationService.getById(id);
    const merged = mergeApplication(current, updates);
    await saveApplication(merged);
    return applicationService.getById(id);
  },

  delete: async (id: string) => {
    const { error } = await createClient().from("applications").delete().eq("id", id);
    throwIfError(error, "Failed to delete application");
  },

  submit: async (applicationId: string) => {
    const { error } = await createClient().rpc("submit_application", { p_application_id: applicationId });
    throwIfError(error, "Failed to submit application");
    return applicationService.getById(applicationId);
  },
};

async function createSignedDocument(row: DocumentRow): Promise<ApplicationDocument> {
  const { data } = await createClient().storage.from("application-documents").createSignedUrl(row.storage_path, 60 * 60);
  return {
    id: row.id,
    applicationId: row.application_id,
    studentId: row.applicant_id,
    type: toUiDocumentType(row.document_type),
    name: row.file_name,
    url: data?.signedUrl ?? "",
    status: toUiDocumentStatus(row.status),
    uploadedAt: row.uploaded_at,
    rejectReason: row.reject_reason ?? "",
  };
}

async function loadDocuments(rows: DocumentRow[]) {
  return Promise.all(rows.map(createSignedDocument));
}

export const documentService = {
  getAll: async () => {
    const { data, error } = await createClient().from("application_documents").select("*").order("uploaded_at", { ascending: false });
    throwIfError(error, "Failed to load documents");
    return loadDocuments(data ?? []);
  },

  getById: async (id: string) => {
    const { data, error } = await createClient().from("application_documents").select("*").eq("id", id).single();
    throwIfError(error, "Failed to load document");
    return createSignedDocument(requireData(data, "Failed to load document"));
  },

  getByApplicationId: async (applicationId: string) => {
    const { data, error } = await createClient()
      .from("application_documents")
      .select("*")
      .eq("application_id", applicationId)
      .order("uploaded_at", { ascending: false });
    throwIfError(error, "Failed to load documents");
    return loadDocuments(data ?? []);
  },

  upload: async ({
    applicationId,
    studentId,
    type,
    file,
  }: {
    applicationId: string;
    studentId: string;
    type: ApplicationDocument["type"];
    file: File;
  }) => {
    if (!allowedDocumentTypes.has(file.type)) throw new Error("Only PDF, JPEG, and PNG files are supported.");
    if (file.size <= 0 || file.size > maxDocumentSizeBytes) throw new Error("Document size must be between 1 byte and 10MB.");

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    throwIfError(userError, "Failed to verify document owner");
    if (!user || user.id !== studentId) throw new Error("You can only upload documents for your own application.");

    const documentType = toDatabaseDocumentType(type);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const storagePath = `${studentId}/${applicationId}/${documentType}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from("application-documents").upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });
    throwIfError(uploadError, "Failed to upload document");

    const { data: existingRows, error: existingError } = await supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", applicationId)
      .eq("applicant_id", studentId)
      .eq("document_type", documentType);

    if (existingError) {
      await supabase.storage.from("application-documents").remove([storagePath]);
      throwIfError(existingError, "Failed to find existing document");
    }

    const metadata = {
      application_id: applicationId,
      applicant_id: studentId,
      document_type: documentType,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      status: "pending_review" as const,
      reject_reason: null,
    };
    const existing = existingRows?.[0];

    if (existing) {
      const { data, error } = await supabase
        .from("application_documents")
        .update(metadata)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        await supabase.storage.from("application-documents").remove([storagePath]);
        throwIfError(error, "Failed to replace document metadata");
      }

      const duplicateIds = (existingRows ?? []).slice(1).map((row) => row.id);
      if (duplicateIds.length > 0) {
        const { error: deleteError } = await supabase.from("application_documents").delete().in("id", duplicateIds);
        throwIfError(deleteError, "Failed to remove duplicate document metadata");
      }

      await supabase.storage.from("application-documents").remove((existingRows ?? []).map((row) => row.storage_path));
      return createSignedDocument(requireData(data, "Failed to replace document metadata"));
    }

    const { data, error } = await supabase.from("application_documents").insert(metadata).select().single();
    if (error) {
      await supabase.storage.from("application-documents").remove([storagePath]);
      throwIfError(error, "Failed to save document metadata");
    }

    return createSignedDocument(requireData(data, "Failed to save document metadata"));
  },

  update: async (id: string, updates: Partial<ApplicationDocument>) => {
    if (!updates.status) throw new Error("Document review status is required.");

    const { data, error } = await createClient().rpc("review_application_document", {
      p_document_id: id,
      p_status: toDatabaseDocumentStatus(updates.status),
      p_reject_reason: updates.rejectReason || undefined,
    });
    throwIfError(error, "Failed to update document");
    return createSignedDocument(requireData(data, "Failed to update document"));
  },

  delete: async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("application_documents").delete().eq("id", id).select("storage_path").single();
    throwIfError(error, "Failed to delete document");
    const row = requireData(data, "Failed to delete document");
    const { error: storageError } = await supabase.storage.from("application-documents").remove([row.storage_path]);
    throwIfError(storageError, "Failed to remove document file");
  },
};
