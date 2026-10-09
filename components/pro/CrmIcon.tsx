import React from "react";
import { Database, FileSpreadsheet, Cloud, Layers } from "lucide-react";

interface CrmIconProps {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CrmIcon({ id, size = "md", className = "" }: CrmIconProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  }[size];

  switch (id.toLowerCase()) {
    case "hubspot":
      return (
        <span className={`grid place-items-center rounded-full bg-[#ff7a59]/20 text-[#ff7a59] p-1 ${className}`}>
          <Layers className={sizeClasses} aria-hidden="true" />
        </span>
      );
    case "salesforce":
      return (
        <span className={`grid place-items-center rounded-full bg-[#00a1e0]/20 text-[#00a1e0] p-1 ${className}`}>
          <Cloud className={sizeClasses} aria-hidden="true" />
        </span>
      );
    case "pipedrive":
      return (
        <span className={`grid place-items-center rounded-full bg-[#28a745]/20 text-[#28a745] p-1 ${className}`}>
          <Database className={sizeClasses} aria-hidden="true" />
        </span>
      );
    case "sheets":
      return (
        <span className={`grid place-items-center rounded-full bg-[#0f9d58]/20 text-[#0f9d58] p-1 ${className}`}>
          <FileSpreadsheet className={sizeClasses} aria-hidden="true" />
        </span>
      );
    default:
      return <Database className={`${sizeClasses} ${className}`} aria-hidden="true" />;
  }
}
