import Link from "next/link";
import { PartyPopper } from "lucide-react";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  isLink?: boolean;
}

export default function Logo({
  href = "/",
  size = "md",
  className = "",
  showText = true,
  textClassName = "",
  iconContainerClassName = "",
  iconClassName = "",
  isLink = true,
}: LogoProps) {
  const sizeStyles = {
    sm: {
      container: "w-8 h-8 rounded-xl",
      icon: "w-4 h-4",
      text: "text-lg",
      gap: "gap-2",
    },
    md: {
      container: "w-10 h-10 rounded-2xl",
      icon: "w-5 h-5",
      text: "text-xl",
      gap: "gap-2.5",
    },
    lg: {
      container: "w-11 h-11 rounded-2xl",
      icon: "w-5 h-5",
      text: "text-2xl",
      gap: "gap-2.5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <>
      <div
        className={`${currentSize.container} bg-gradient-to-br from-[#6366f1] via-[#3b82f6] to-[#06b6d4] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0 ${iconContainerClassName}`}
      >
        <PartyPopper className={`${currentSize.icon} text-white ${iconClassName}`} />
      </div>
      {showText && (
        <span
          className={`font-bold ${currentSize.text} tracking-tight bg-gradient-to-r from-[#4f46e5] via-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent font-sans ${textClassName}`}
        >
          Eventizers
        </span>
      )}
    </>
  );

  if (!isLink) {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} group ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${currentSize.gap} group ${className}`}
    >
      {content}
    </Link>
  );
}
