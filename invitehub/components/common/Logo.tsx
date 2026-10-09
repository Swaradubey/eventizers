import Link from "next/link";
import { Sparkles } from "lucide-react";

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
      container: "w-7 h-7 rounded-[8px]",
      icon: "w-3.5 h-3.5",
      text: "text-lg",
      gap: "gap-2",
    },
    md: {
      container: "w-8 h-8 rounded-[10px]",
      icon: "w-4 h-4",
      text: "text-xl",
      gap: "gap-2",
    },
    lg: {
      container: "w-9 h-9 rounded-[10px]",
      icon: "w-4.5 h-4.5",
      text: "text-2xl",
      gap: "gap-2.5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <>
      <div
        className={`${currentSize.container} bg-[#feba08] text-[#080d11] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 flex-shrink-0 ${iconContainerClassName}`}
      >
        <Sparkles className={`${currentSize.icon} text-[#080d11] ${iconClassName}`} aria-hidden="true" />
      </div>
      {showText && (
        <span
          className={`font-display font-extrabold ${currentSize.text} tracking-tight text-slate-900 dark:text-white ${textClassName}`}
          style={{ fontFamily: "'Red Rose', Georgia, serif" }}
        >
          eventizers
        </span>
      )}
    </>
  );

  if (!isLink) {
    return (
      <div className={`flex items-center ${currentSize.gap} ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center ${currentSize.gap} group transition-opacity hover:opacity-90 ${className}`}
    >
      {content}
    </Link>
  );
}
