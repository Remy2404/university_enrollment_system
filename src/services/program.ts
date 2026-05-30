import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/types/database";
import type { Department, EnrollmentPeriod, Faculty, Major } from "@/src/types";
import type { ApiQueryOptions } from "@/src/lib/api-client";
import { buildCode, requireData, throwIfError } from "./supabase-helpers";

function onlyActive(options?: ApiQueryOptions) {
  return options?.filters?.status === "active";
}

function mapFaculty(row: Tables<"faculties">): Faculty {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description ?? "",
    status: row.is_active ? "active" : "inactive",
  };
}

function mapDepartment(row: Tables<"departments">): Department {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    name: row.name,
    description: row.description ?? "",
    status: row.is_active ? "active" : "inactive",
  };
}

function mapMajor(row: Tables<"programs">): Major {
  return {
    id: row.id,
    departmentId: row.department_id,
    name: row.name,
    description: row.description ?? "",
    status: row.is_active ? "active" : "inactive",
  };
}

interface PeriodWithYear extends Tables<"admission_periods"> {
  academic_years: { name: string } | null;
}

function mapPeriod(row: PeriodWithYear): EnrollmentPeriod {
  return {
    id: row.id,
    academicYear: row.academic_years?.name ?? "",
    startDate: row.application_open_date,
    endDate: row.application_deadline,
    status: row.status === "open" ? "active" : "inactive",
  };
}

async function ensureAcademicYear(name: string, startDate: string, endDate: string) {
  const supabase = createClient();
  const { data: existing, error: selectError } = await supabase
    .from("academic_years")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  throwIfError(selectError, "Failed to find academic year");
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("academic_years")
    .insert({ name, start_date: startDate, end_date: endDate })
    .select("id")
    .single();

  throwIfError(error, "Failed to create academic year");
  return requireData(data, "Failed to create academic year").id;
}

export const facultyService = {
  getAll: async (options?: ApiQueryOptions) => {
    let query = createClient().from("faculties").select("*").order("name");
    if (onlyActive(options)) query = query.eq("is_active", true);
    const { data, error } = await query;
    throwIfError(error, "Failed to load faculties");
    return (data ?? []).map(mapFaculty);
  },
  getById: async (id: string) => {
    const { data, error } = await createClient().from("faculties").select("*").eq("id", id).single();
    throwIfError(error, "Failed to load faculty");
    return mapFaculty(requireData(data, "Failed to load faculty"));
  },
  create: async (faculty: Omit<Faculty, "id">) => {
    const { data, error } = await createClient()
      .from("faculties")
      .insert({ name: faculty.name, code: faculty.code, description: faculty.description, is_active: faculty.status === "active" })
      .select()
      .single();
    throwIfError(error, "Failed to create faculty");
    return mapFaculty(requireData(data, "Failed to create faculty"));
  },
  update: async (id: string, updates: Partial<Faculty>) => {
    const { data, error } = await createClient()
      .from("faculties")
      .update({ name: updates.name, code: updates.code, description: updates.description, is_active: updates.status ? updates.status === "active" : undefined })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "Failed to update faculty");
    return mapFaculty(requireData(data, "Failed to update faculty"));
  },
  delete: async (id: string) => {
    const { error } = await createClient().from("faculties").delete().eq("id", id);
    throwIfError(error, "Failed to delete faculty");
  },
};

export const departmentService = {
  getAll: async (options?: ApiQueryOptions) => {
    let query = createClient().from("departments").select("*").order("name");
    if (onlyActive(options)) query = query.eq("is_active", true);
    const { data, error } = await query;
    throwIfError(error, "Failed to load departments");
    return (data ?? []).map(mapDepartment);
  },
  getById: async (id: string) => {
    const { data, error } = await createClient().from("departments").select("*").eq("id", id).single();
    throwIfError(error, "Failed to load department");
    return mapDepartment(requireData(data, "Failed to load department"));
  },
  getByFacultyId: async (facultyId: string) => {
    const { data, error } = await createClient().from("departments").select("*").eq("faculty_id", facultyId).order("name");
    throwIfError(error, "Failed to load departments");
    return (data ?? []).map(mapDepartment);
  },
  create: async (department: Omit<Department, "id">) => {
    const { data, error } = await createClient()
      .from("departments")
      .insert({
        faculty_id: department.facultyId,
        name: department.name,
        code: buildCode(department.name, "DEPT"),
        description: department.description,
        is_active: department.status === "active",
      })
      .select()
      .single();
    throwIfError(error, "Failed to create department");
    return mapDepartment(requireData(data, "Failed to create department"));
  },
  update: async (id: string, updates: Partial<Department>) => {
    const { data, error } = await createClient()
      .from("departments")
      .update({
        faculty_id: updates.facultyId,
        name: updates.name,
        description: updates.description,
        is_active: updates.status ? updates.status === "active" : undefined,
      })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "Failed to update department");
    return mapDepartment(requireData(data, "Failed to update department"));
  },
  delete: async (id: string) => {
    const { error } = await createClient().from("departments").delete().eq("id", id);
    throwIfError(error, "Failed to delete department");
  },
};

export const majorService = {
  getAll: async (options?: ApiQueryOptions) => {
    let query = createClient().from("programs").select("*").order("name");
    if (onlyActive(options)) query = query.eq("is_active", true);
    const { data, error } = await query;
    throwIfError(error, "Failed to load programs");
    return (data ?? []).map(mapMajor);
  },
  getById: async (id: string) => {
    const { data, error } = await createClient().from("programs").select("*").eq("id", id).single();
    throwIfError(error, "Failed to load program");
    return mapMajor(requireData(data, "Failed to load program"));
  },
  getByDepartmentId: async (departmentId: string) => {
    const { data, error } = await createClient().from("programs").select("*").eq("department_id", departmentId).order("name");
    throwIfError(error, "Failed to load programs");
    return (data ?? []).map(mapMajor);
  },
  create: async (major: Omit<Major, "id">) => {
    const { data, error } = await createClient()
      .from("programs")
      .insert({
        department_id: major.departmentId,
        name: major.name,
        code: buildCode(major.name, "PROGRAM"),
        description: major.description,
        is_active: major.status === "active",
        degree_level: "bachelor",
        duration_years: 4,
      })
      .select()
      .single();
    throwIfError(error, "Failed to create program");
    return mapMajor(requireData(data, "Failed to create program"));
  },
  update: async (id: string, updates: Partial<Major>) => {
    const { data, error } = await createClient()
      .from("programs")
      .update({
        department_id: updates.departmentId,
        name: updates.name,
        description: updates.description,
        is_active: updates.status ? updates.status === "active" : undefined,
      })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error, "Failed to update program");
    return mapMajor(requireData(data, "Failed to update program"));
  },
  delete: async (id: string) => {
    const { error } = await createClient().from("programs").delete().eq("id", id);
    throwIfError(error, "Failed to delete program");
  },
};

export const periodService = {
  getAll: async () => {
    const { data, error } = await createClient()
      .from("admission_periods")
      .select("*, academic_years(name)")
      .order("application_open_date", { ascending: false });
    throwIfError(error, "Failed to load admission periods");
    return (data ?? []).map((row) => mapPeriod(row as PeriodWithYear));
  },
  getById: async (id: string) => {
    const { data, error } = await createClient().from("admission_periods").select("*, academic_years(name)").eq("id", id).single();
    throwIfError(error, "Failed to load admission period");
    return mapPeriod(requireData(data, "Failed to load admission period") as PeriodWithYear);
  },
  create: async (period: Omit<EnrollmentPeriod, "id">) => {
    const academicYearId = await ensureAcademicYear(period.academicYear, period.startDate, period.endDate);
    const { data, error } = await createClient()
      .from("admission_periods")
      .insert({
        academic_year_id: academicYearId,
        name: `Admission ${period.academicYear}`,
        application_open_date: period.startDate,
        application_deadline: period.endDate,
        status: period.status === "active" ? "open" : "closed",
      })
      .select("*, academic_years(name)")
      .single();
    throwIfError(error, "Failed to create admission period");
    return mapPeriod(requireData(data, "Failed to create admission period") as PeriodWithYear);
  },
  update: async (id: string, updates: Partial<EnrollmentPeriod>) => {
    const { data, error } = await createClient()
      .from("admission_periods")
      .update({
        application_open_date: updates.startDate,
        application_deadline: updates.endDate,
        status: updates.status ? (updates.status === "active" ? "open" : "closed") : undefined,
      })
      .eq("id", id)
      .select("*, academic_years(name)")
      .single();
    throwIfError(error, "Failed to update admission period");
    return mapPeriod(requireData(data, "Failed to update admission period") as PeriodWithYear);
  },
  delete: async (id: string) => {
    const { error } = await createClient().from("admission_periods").delete().eq("id", id);
    throwIfError(error, "Failed to delete admission period");
  },
};
