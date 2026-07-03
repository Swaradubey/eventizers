"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import adminService from "../services/adminService";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session validity on component mount (refresh)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response && response.success && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        // Safe to ignore unauthorized logs during initial load
        console.log("No active authenticated session.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response && response.success && response.user) {
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        setUser(response.user);
        return response.user;
      }
      throw new Error("Invalid server response");
    } catch (err: any) {
      let message = err.response?.data?.error || "Login failed. Please check your credentials.";
      if (message === "User not found." || message === "Incorrect password.") {
        message = "Invalid email or password.";
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.adminLogin(email, password);
      if (response && response.success && response.user) {
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        setUser(response.user);
        return response.user;
      }
      throw new Error("Invalid server response");
    } catch (err: any) {
      let message = err.response?.data?.error || "Login failed. Please check your credentials.";
      if (message === "User not found." || message === "Incorrect password.") {
        message = "Invalid email or password.";
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password);
      if (response && response.success && response.user) {
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        setUser(response.user);
        return response.user;
      }
      throw new Error("Invalid server response");
    } catch (err: any) {
      const message = err.response?.data?.error || "Registration failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem("token");
      setUser(null);
      if (typeof window !== "undefined") {
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        adminLogin,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
