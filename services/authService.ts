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
export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
};

/**
 * Log in a user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
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

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
