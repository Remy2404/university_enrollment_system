const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface ApiQueryOptions {
  filters?: Record<string, any>;
  sort?: string; // e.g. "-submittedAt"
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

// Helper to build JSON Server query strings supporting v1 colon operators
export function buildQueryString(options: ApiQueryOptions): string {
  const params = new URLSearchParams();

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "") return;
      
      // Support object format: { status: { operator: 'eq', value: 'Pending Review' } }
      if (typeof val === "object" && "operator" in val && "value" in val) {
        if (val.value !== undefined && val.value !== null && val.value !== "") {
          params.append(`${key}:${val.operator}`, String(val.value));
        }
      } else {
        // Default to traditional key=val (treated as eq)
        params.append(key, String(val));
      }
    });
  }

  if (options.sort) {
    params.append("_sort", options.sort);
  }

  if (options.page !== undefined && options.limit !== undefined) {
    params.append("_page", String(options.page));
    params.append("_per_page", String(options.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string, queryOptions?: ApiQueryOptions) => {
    const query = queryOptions ? buildQueryString(queryOptions) : "";
    return request<T>(`${path}${query}`);
  },
  post: <T>(path: string, body: any) => {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  put: <T>(path: string, body: any) => {
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  patch: <T>(path: string, body: any) => {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  delete: <T>(path: string) => {
    return request<T>(path, {
      method: "DELETE",
    });
  },
};
