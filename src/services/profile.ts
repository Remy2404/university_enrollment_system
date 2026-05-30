import { createClient } from "@/src/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/src/types/database";
import type { StudentProfile } from "@/src/types";
import { requireData, throwIfError } from "./supabase-helpers";

function mapProfile(row: Tables<"profiles">, email = ""): StudentProfile {
  return {
    id: row.id,
    studentId: row.id,
    gender: row.gender ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    nationality: row.nationality ?? "",
    nationalId: row.national_id_number ?? "",
    address: row.current_address ?? "",
    city: row.province_city ?? "",
    phone: row.phone_number ?? "",
    email,
  };
}

function toProfileUpdate(profile: Partial<StudentProfile>): TablesUpdate<"profiles"> {
  return {
    gender: profile.gender,
    date_of_birth: profile.dateOfBirth || null,
    nationality: profile.nationality,
    national_id_number: profile.nationalId,
    current_address: profile.address,
    province_city: profile.city,
    phone_number: profile.phone,
  };
}

export const profileService = {
  getAll: async () => {
    const { data, error } = await createClient().from("profiles").select("*").order("full_name");
    throwIfError(error, "Failed to load profiles");
    return (data ?? []).map((row) => mapProfile(row));
  },

  getById: async (id: string) => {
    const supabase = createClient();
    const [{ data, error }, { data: authData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.auth.getUser(),
    ]);

    throwIfError(error, "Failed to load profile");
    return mapProfile(requireData(data, "Failed to load profile"), authData.user?.id === id ? authData.user.email ?? "" : "");
  },

  getByStudentId: async (studentId: string) => profileService.getById(studentId),

  create: async (profile: Omit<StudentProfile, "id">) => {
    const payload: TablesInsert<"profiles"> = {
      id: profile.studentId,
      full_name: "",
      ...toProfileUpdate(profile),
    };
    const { data, error } = await createClient().from("profiles").insert(payload).select().single();

    throwIfError(error, "Failed to create profile");
    return mapProfile(requireData(data, "Failed to create profile"), profile.email);
  },

  update: async (id: string, updates: Partial<StudentProfile>) => {
    const { data, error } = await createClient()
      .from("profiles")
      .update(toProfileUpdate(updates))
      .eq("id", id)
      .select()
      .single();

    throwIfError(error, "Failed to update profile");
    return mapProfile(requireData(data, "Failed to update profile"), updates.email ?? "");
  },

  delete: async (id: string) => {
    const { error } = await createClient().from("profiles").delete().eq("id", id);
    throwIfError(error, "Failed to delete profile");
  },
};
