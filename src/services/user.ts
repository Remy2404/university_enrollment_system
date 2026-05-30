import type { User as AuthUser } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/types/database";
import type { User } from "@/src/types";
import { requireData, throwIfError } from "./supabase-helpers";

type ProfileRow = Tables<"profiles">;
type AppRole = Tables<"user_roles">["role"];

function mapRole(role: AppRole | undefined): User["role"] {
  if (role === "admin") return "admin";
  if (role === "admission_officer" || role === "registrar") return "staff";
  return "student";
}

function mapUser(profile: ProfileRow, email: string, role?: AppRole): User {
  return {
    id: profile.id,
    name: profile.full_name,
    email,
    role: mapRole(role),
    phoneNumber: profile.phone_number ?? "",
    avatarUrl: profile.avatar_url ?? "",
  };
}

async function getRole(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  throwIfError(error, "Failed to load account role");
  return data?.role;
}

export const userService = {
  getByAuthUser: async (authUser: AuthUser) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    throwIfError(error, "Failed to load account profile");
    return mapUser(
      requireData(data, "Failed to load account profile"),
      authUser.email ?? "",
      await getRole(authUser.id),
    );
  },

  getCurrent: async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    throwIfError(error, "Failed to load authenticated user");
    return user ? userService.getByAuthUser(user) : null;
  },

  getById: async (id: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

    throwIfError(error, "Failed to load user");
    return mapUser(requireData(data, "Failed to load user"), user?.id === id ? user.email ?? "" : "", await getRole(id));
  },

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    throwIfError(error, "Unable to sign in");
    return userService.getByAuthUser(requireData(data.user, "Unable to sign in"));
  },

  registerStudent: async (input: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          phone_number: input.phoneNumber,
        },
      },
    });

    throwIfError(error, "Unable to create account");
  },

  update: async (id: string, updates: Partial<User>) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.name,
        phone_number: updates.phoneNumber,
        avatar_url: updates.avatarUrl,
      })
      .eq("id", id)
      .select()
      .single();

    throwIfError(error, "Failed to update profile");
    return mapUser(requireData(data, "Failed to update profile"), updates.email ?? "", await getRole(id));
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    throwIfError(userError, "Failed to verify current account");
    if (!user?.email) throw new Error("Failed to verify current account.");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    throwIfError(signInError, "Current password is incorrect");

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError(updateError, "Failed to update password");
  },

  signOut: async () => {
    const { error } = await createClient().auth.signOut();
    throwIfError(error, "Failed to sign out");
  },
};
