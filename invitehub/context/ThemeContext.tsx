"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import userSettingsService from "../services/userSettingsService";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  // Helper to apply classes/data attributes to HTML root
  const applyTheme = (selectedTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    
    // Clear existing theme markers
    root.removeAttribute("data-theme");
    root.classList.remove("dark");

    let activeTheme = selectedTheme;
    if (selectedTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      activeTheme = systemPrefersDark ? "dark" : "light";
    }

    if (activeTheme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  };

  // 1. Initial effect: check localStorage cache to prevent visual flashing before auth/backend loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedTheme = localStorage.getItem("invitehub-theme") as Theme | null;
      if (cachedTheme) {
        setThemeState(cachedTheme);
        applyTheme(cachedTheme);
      }
    }
  }, []);

  // 2. Fetch backend preferences when user authentication status updates
  const fetchAndApplyTheme = async () => {
    if (!user) {
      // If user logs out, clean up and default to light theme (or system)
      applyTheme("light");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await userSettingsService.getPreferences();
      if (res && res.success && res.data && res.data.theme) {
        const userTheme = res.data.theme as Theme;
        setThemeState(userTheme);
        applyTheme(userTheme);
        
        // Cache to local storage
        if (typeof window !== "undefined") {
          localStorage.setItem("invitehub-theme", userTheme);
        }
      }
    } catch (err) {
      console.error("Failed to load user theme preference from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndApplyTheme();
  }, [user]);

  // Public theme modifier
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("invitehub-theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading, refreshTheme: fetchAndApplyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContext: ThemeContextType = {
  theme: "light",
  setTheme: () => {},
  loading: false,
  refreshTheme: async () => {},
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContext;
  }
  return context;
};

