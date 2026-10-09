"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label?: string;
  variant?: "sheet" | "full";
  children: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  label,
  variant = "sheet",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed m-0 max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm",
        variant === "sheet" &&
          "inset-x-0 bottom-0 top-auto mx-auto w-full overflow-hidden rounded-t-[2rem] bg-[oklch(0.19_0.014_250)] open:animate-in open:slide-in-from-bottom-full open:duration-300 sm:bottom-auto sm:top-1/2 sm:max-w-lg sm:-translate-y-1/2 sm:rounded-[2rem]",
        variant === "full" &&
          "inset-0 h-svh w-screen overflow-hidden bg-background open:animate-in open:fade-in open:duration-200"
      )}
    >
      {open ? children : null}
    </dialog>
  );
}
