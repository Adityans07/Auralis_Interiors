import type { ApiResponse } from "../types";

interface BackendErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

interface BackendEnvelope<T> {
  success: boolean;
  data: T;
  error?: BackendErrorPayload;
}

interface BackendRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export class ApiRequestError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// const DEFAULT_BACKEND_BASE_URL = "http://localhost:8000";
const DEFAULT_BACKEND_BASE_URL = "https://auralis-interiors.onrender.com";
const CSRF_COOKIE_NAME = "auralis_csrf";

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    return ""; // Leverage Next.js rewrites in the browser to fix cross-site cookies
  }

  const envValue = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!envValue || !envValue.trim()) {
    return DEFAULT_BACKEND_BASE_URL;
  }
  return sanitizeBaseUrl(envValue.trim());
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split(";");
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function buildHeaders(method: string, incoming?: HeadersInit, isFormDataBody = false): Headers {
  const headers = new Headers(incoming ?? {});
  if (!isFormDataBody && !headers.has("Content-Type") && method !== "GET" && method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = readCookie(CSRF_COOKIE_NAME);
    if (csrfToken && !headers.has("x-csrf-token")) {
      headers.set("x-csrf-token", csrfToken);
    }
  }

  return headers;
}

function normalizeErrorMessage(
  statusCode: number,
  responseText: string | null,
  apiError?: BackendErrorPayload
): string {
  if (apiError?.message) return apiError.message;
  if (responseText) return responseText;
  if (statusCode >= 500) return "Server error. Please try again.";
  if (statusCode === 404) return "Endpoint not found.";
  if (statusCode === 401) return "You need to log in first.";
  if (statusCode === 403) return "You are not allowed to perform this action.";
  return "Request failed. Please try again.";
}

export async function backendRequest<T>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, ...rest } = options;
  const method = (options.method ?? "GET").toUpperCase();
  const url = `${getBackendBaseUrl()}${path}`;
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = buildHeaders(method, rest.headers, isFormDataBody);

  const init: RequestInit = {
    ...rest,
    method,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    if (typeof body === "string" || body instanceof FormData) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiRequestError(
      "Cannot reach backend API. Confirm the backend is running and NEXT_PUBLIC_BACKEND_URL is correct.",
      0,
      "NETWORK_ERROR"
    );
  }

  let parsedJson: BackendEnvelope<T> | null = null;
  let rawText: string | null = null;

  try {
    parsedJson = (await response.json()) as BackendEnvelope<T>;
  } catch {
    try {
      rawText = await response.text();
    } catch {
      rawText = null;
    }
  }

  if (!response.ok) {
    const apiError = parsedJson && typeof parsedJson === "object" ? parsedJson.error : undefined;
    throw new ApiRequestError(
      normalizeErrorMessage(response.status, rawText, apiError),
      response.status,
      apiError?.code,
      apiError?.details
    );
  }

  if (parsedJson && typeof parsedJson === "object" && "success" in parsedJson) {
    if (!parsedJson.success) {
      throw new ApiRequestError(
        normalizeErrorMessage(response.status, rawText, parsedJson.error),
        response.status,
        parsedJson.error?.code,
        parsedJson.error?.details
      );
    }
    return {
      success: true,
      data: parsedJson.data,
    };
  }

  return {
    success: true,
    data: undefined as T,
  };
}
