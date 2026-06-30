import axios from "axios";

// Normalize base URL dynamically
const getBaseURL = (): string => {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  rawUrl = rawUrl.trim();
  
  if (rawUrl.endsWith("/")) {
    rawUrl = rawUrl.slice(0, -1);
  }
  
  if (!rawUrl.endsWith("/api")) {
    rawUrl = `${rawUrl}/api`;
  }
  
  return rawUrl;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Request interceptor to attach JWT token to Authorization header if present
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url?.includes("/auth/me") || error.config.url?.includes("/auth/login");
      if (!isAuthEndpoint) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          // Redirect to login page
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
