"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiOptions = RequestInit & {
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  let body = options.body as BodyInit | null | undefined;

  if (options.body && !isFormData && typeof options.body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.errors?.[0] || "Request failed",
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}

export function getData<T>(payload: { data?: T }) {
  return payload.data as T;
}

export function apiImageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

export function setSelectedTripId(tripId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("traveloop:selectedTripId", tripId);
  }
}

export function getSelectedTripId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("traveloop:selectedTripId") || "";
}
