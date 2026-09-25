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
      container: "w-7 h-7 rounded-lg",
      icon: "w-4 h-4",
      text: "text-lg",
      gap: "gap-2",
    },
    md: {
      container: "w-8 h-8 rounded-lg",
      icon: "w-5 h-5",
      text: "text-xl",
      gap: "gap-2",
    },
    lg: {
      container: "w-9 h-9 rounded-lg",
      icon: "w-5 h-5",
      text: "text-2xl",
      gap: "gap-2.5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <>
      <div
        className={`${currentSize.container} bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 flex-shrink-0 ${iconContainerClassName}`}
      >
        <PartyPopper className={`${currentSize.icon} text-white ${iconClassName}`} />
      </div>
      {showText && (
        <span
          className={`font-bold ${currentSize.text} tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent font-questrial ${textClassName}`}
          style={{ fontFamily: "'Questrial', sans-serif" }}
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
