import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
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
