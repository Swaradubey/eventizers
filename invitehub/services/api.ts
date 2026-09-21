import axios, { AxiosError } from "axios";

/**
 * Normalize the base URL so it always ends with the `/api` prefix
 * that matches the backend Express mount points (e.g. `/api/events`).
 */
const getBaseURL = (): string => {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  rawUrl = rawUrl.trim();

  // Strip trailing slashes
  while (rawUrl.endsWith("/")) {
    rawUrl = rawUrl.slice(0, -1);
  }

  // Ensure the URL ends with `/api` to match backend route mounts
  if (!rawUrl.endsWith("/api")) {
    rawUrl = `${rawUrl}/api`;
  }

  return rawUrl;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30_000,
});

// Request interceptor — attach JWT and extend timeout for AI endpoints
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // AI / Replicate endpoints can take up to 90 s — extend per-request
    const url = config.url || "";
    if (url.includes("/ai/")) {
      config.timeout = 120_000;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle auth expiry and attach a human-readable message
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status;

    // --- 401: token expired / invalid ---
    if (status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint =
        url.includes("/auth/me") ||
        url.includes("/auth/login") ||
        url.includes("/admin/login") ||
        url.includes("/invitations/public");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        const hadToken = Boolean(
          localStorage.getItem("token") || sessionStorage.getItem("token")
        );
        const isGuestMode =
          window.location.search.includes("guest=1") ||
          Boolean(localStorage.getItem("guestDraft"));

        if (hadToken && !isGuestMode) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          const isAdminRoute = window.location.pathname.startsWith("/admin");
          window.location.href = isAdminRoute ? "/admin/login" : "/login";
        }
      }
    }

    // --- Attach a user-friendly message from the backend response ---
    const serverData = error.response?.data;
    const serverMessage =
      (typeof serverData === "object" && serverData !== null)
        ? serverData.error || serverData.message
        : undefined;

    if (serverMessage && !error.message.includes(serverMessage)) {
      (error as any).displayMessage = serverMessage;
    }

    // --- Timeout ---
    if (error.code === "ECONNABORTED") {
      (error as any).displayMessage =
        "Request timed out. The server took too long to respond — please try again.";
    }

    // --- No response at all (network down, CORS, DNS) ---
    if (!error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
      (error as any).displayMessage =
        "Unable to reach the server. Please check your internet connection or try again later.";
    }

    return Promise.reject(error);
  }
);

/**
 * Extract a user-friendly error message from an Axios error.
 * Falls back gracefully when the server response is missing or malformed.
 */
export function getApiErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";
  const axErr = err as AxiosError & { displayMessage?: string };

  // 1. Our enriched displayMessage from the interceptor
  if (axErr.displayMessage) return axErr.displayMessage;

  // 2. Backend JSON body: { error: "..." } or { message: "..." }
  const data = axErr.response?.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object") {
    if (typeof data.error === "string" && data.error) return data.error;
    if (typeof data.message === "string" && data.message) return data.message;
  }

  // 3. Axios-level message
  if (axErr.message) {
    if (axErr.message === "Network Error") {
      return "Unable to reach the server. Please check your internet connection.";
    }
    if (axErr.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    return axErr.message;
  }

  return "An unexpected error occurred.";
}

export default API;
