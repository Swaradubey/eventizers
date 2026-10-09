"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export interface ProUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProAuthContextType {
  proUser: ProUser | null;
  loading: boolean;
  error: string | null;
  proLogin: (email: string, password: string) => Promise<ProUser>;
  proLogout: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  refreshProUser: () => Promise<void>;
}

const ProAuthContext = createContext<ProAuthContextType | null>(null);

export const ProAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [proUser, setProUser] = useState<ProUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProUser = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const proToken = localStorage.getItem("pro_token");
    if (!proToken || proToken === "undefined" || proToken === "null" || proToken.trim() === "") {
      setProUser(null);
      setLoading(false);
      return;
    }

    // Try loading cached pro user immediately to prevent flash
    const cached = localStorage.getItem("pro_user");
    if (cached) {
      try {
        setProUser(JSON.parse(cached));
      } catch {
        // ignore
      }
    }

    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${proToken}` },
      });
      if (res.data && res.data.success && res.data.user) {
        setProUser(res.data.user);
        localStorage.setItem("pro_user", JSON.stringify(res.data.user));
      } else {
        localStorage.removeItem("pro_token");
        localStorage.removeItem("pro_user");
        localStorage.removeItem("proAuthenticated");
        setProUser(null);
      }
    } catch (err) {
      console.log("No active Pro authenticated session.");
      localStorage.removeItem("pro_token");
      localStorage.removeItem("pro_user");
      localStorage.removeItem("proAuthenticated");
      setProUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProUser();
  }, [refreshProUser]);

  const proLogin = async (email: string, password: string): Promise<ProUser> => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data && response.data.success && response.data.user) {
        if (response.data.token) {
          localStorage.setItem("pro_token", response.data.token);
        }
        localStorage.setItem("pro_user", JSON.stringify(response.data.user));
        localStorage.setItem("proAuthenticated", "true");
        setProUser(response.data.user);
        return response.data.user;
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

  const proLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      const proToken = typeof window !== "undefined" ? localStorage.getItem("pro_token") : null;
      if (proToken) {
        try {
          await API.post("/auth/logout", {}, {
            headers: { Authorization: `Bearer ${proToken}` },
          });
        } catch {
          // ignore error during logout
        }
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("pro_token");
        localStorage.removeItem("pro_user");
        localStorage.removeItem("proAuthenticated");
        localStorage.removeItem("proOAuthPending");
      }
      setProUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/pro/login";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProAuthContext.Provider
      value={{
        proUser,
        loading,
        error,
        proLogin,
        proLogout,
        setError,
        refreshProUser,
      }}
    >
      {children}
    </ProAuthContext.Provider>
  );
};

export const useProAuth = () => {
  const context = useContext(ProAuthContext);
  if (!context) {
    throw new Error("useProAuth must be used within a ProAuthProvider");
  }
  return context;
};
