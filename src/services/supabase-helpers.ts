import type { Json } from "@/src/types/database";

interface SupabaseError {
  message: string;
}

export function throwIfError(error: SupabaseError | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export function requireData<T>(data: T | null, context: string): T {
  if (data === null) {
    throw new Error(`${context}: no data returned`);
  }

  return data;
}

export function asJsonObject(value: Json | null): Record<string, Json | undefined> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return value;
}

export function jsonString(value: Json | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function jsonNumber(value: Json | undefined): number | null {
  return typeof value === "number" ? value : null;
}

export function buildCode(name: string, prefix: string) {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);

  return normalized || `${prefix}-${Date.now()}`;
}
