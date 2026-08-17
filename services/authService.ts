import { User } from "../context/AuthContext";
import API from "./api";

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

/**
 * Register a new user
 */
export const register = async (name: string, email: string, phoneNumber: string, password: string): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/register", { name, email, phoneNumber, password });
  return response.data;
};


/**
 * Log in a user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const baseURL = API.defaults.baseURL || "";
  const endpoint = "/auth/login";
  const finalURL = baseURL.endsWith("/") ? `${baseURL}auth/login` : `${baseURL}/auth/login`;

  console.log("[Temporary Log] API Base URL:", baseURL);
  console.log("[Temporary Log] Final Login Endpoint:", finalURL);

  try {
    const response = await API.post<AuthResponse>("/auth/login", { email, password });
    console.log("[Temporary Log] Login response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.log("[Temporary Log] Login response status (error):", error.response?.status || "No response");
    throw error;
  }
};


/**
 * Log out the current user
 */
export const logout = async (): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/logout");
  return response.data;
};

/**
 * Get current authenticated user details
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await API.get<AuthResponse>("/auth/me");
  return response.data;
};

/**
 * Direct password reset for local development
 */
export const resetPasswordDirect = async (
  email: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/reset-password-direct", {
    email,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  resetPasswordDirect,
};

export default authService;

