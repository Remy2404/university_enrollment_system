export interface QueryFilter {
  operator: "eq" | "contains";
  value: unknown;
}

export interface ApiQueryOptions {
  filters?: Record<string, unknown | QueryFilter>;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T[];
}
