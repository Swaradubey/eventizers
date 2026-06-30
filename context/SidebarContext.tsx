"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load from localStorage on mount (after hydration)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {
      console.warn("Could not read sidebar collapse state from localStorage", e);
    }
  }, []);

  // Wrap setIsCollapsed to save to localStorage
  const handleSetCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsed((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value;
      try {
        localStorage.setItem("sidebar-collapsed", String(nextValue));
      } catch (e) {
        console.warn("Could not save sidebar collapse state to localStorage", e);
      }
      return nextValue;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      isCollapsed: false,
      setIsCollapsed: () => {},
    };
  }
  return context;
}

