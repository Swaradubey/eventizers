"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import CreateSheetModal from "./CreateSheetModal";
import PreviewModal from "./PreviewModal";

export type Mode = "ai" | "photos" | "video" | "upload" | "viral";

export interface CreateSheetOptions {
  photo?: string;
  template?: string;
  audience?: "individual" | "pro";
  plan?: string;
}

interface CreateSheetContextType {
  open: (mode?: Mode, options?: CreateSheetOptions) => void;
  openPreview: (templateId: string) => void;
  close: () => void;
}

const CreateSheetContext = createContext<CreateSheetContextType | null>(null);

export function useCreateSheet() {
  const ctx = useContext(CreateSheetContext);
  if (!ctx) {
    throw new Error("useCreateSheet must be used within a CreateSheetProvider");
  }
  return ctx;
}

export function CreateSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");
  const [initialPhoto, setInitialPhoto] = useState<string | undefined>();
  const [initialTemplate, setInitialTemplate] = useState<string | undefined>();

  const [initialAudience, setInitialAudience] = useState<"individual" | "pro">("individual");
  const [initialPlan, setInitialPlan] = useState<string>("pro");

  // Preview modal state
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const open = useCallback((newMode?: Mode, options?: CreateSheetOptions) => {
    setMode(newMode ?? "ai");
    setInitialPhoto(options?.photo);
    setInitialTemplate(options?.template);
    setInitialAudience(options?.audience ?? "individual");
    setInitialPlan(options?.plan ?? "pro");
    setIsOpen(true);
  }, []);

  const openPreview = useCallback((templateId: string) => {
    setPreviewTemplateId(templateId);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewTemplateId(null);
  }, []);

  return (
    <CreateSheetContext.Provider value={{ open, openPreview, close }}>
      {children}

      {/* Creation Modal */}
      {isOpen && (
        <CreateSheetModal
          key={mode + (initialPhoto ?? "") + (initialTemplate ?? "") + initialAudience + initialPlan}
          initialMode={mode}
          initialPhoto={initialPhoto}
          initialTemplate={initialTemplate}
          initialAudience={initialAudience}
          initialPlan={initialPlan}
          onClose={close}
        />
      )}

      {/* Full-screen Preview Modal */}
      {previewTemplateId && (
        <PreviewModal
          templateId={previewTemplateId}
          onClose={closePreview}
          onSelectForCreation={(id) => {
            closePreview();
            open("video", { template: id });
          }}
        />
      )}
    </CreateSheetContext.Provider>
  );
}
