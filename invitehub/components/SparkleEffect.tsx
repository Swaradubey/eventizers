"use client";

import React, { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  tx: number;
  ty: number;
}

export default function SparkleEffect() {
  const [active, setActive] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only show if the login/registration flag is present in sessionStorage
      if (sessionStorage.getItem("showSparkle") === "true") {
        setActive(true);
        sessionStorage.removeItem("showSparkle");

        const colors = [
          "#C9A84C", // soft-gold
          "#2D1B3D", // deep-plum
          "#E8D08A", // bright gold
          "#FAF0D6", // cream gold
          "#E8C4B8", // rose-blush
        ];

        // Generate a series of sparkles
        const list: Sparkle[] = Array.from({ length: 48 }).map((_, i) => {
          // Some spawn in the center cluster, some scatter around the viewport
          const isCenter = Math.random() > 0.4;
          const x = isCenter 
            ? 40 + Math.random() * 20 
            : Math.random() * 100;
          const y = isCenter 
            ? 35 + Math.random() * 30 
            : Math.random() * 100;

          // Particle parameters
          const size = Math.random() * 16 + 8; // 8px to 24px
          const color = colors[Math.floor(Math.random() * colors.length)];
          const delay = Math.random() * 0.4; // staggered start
          const duration = Math.random() * 1.6 + 1.2; // 1.2s to 2.8s
          
          // Float translation offsets
          const tx = (Math.random() - 0.5) * 80; // horizontal drift -40px to 40px
          const ty = -(Math.random() * 120 + 60); // vertical drift -60px to -180px

          return { id: i, x, y, size, color, delay, duration, tx, ty };
        });

        setSparkles(list);

        // Turn off effect after 3.2 seconds
        const timer = setTimeout(() => {
          setActive(false);
        }, 3200);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* Self-contained keyframe animations for vignette and sparkles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sparkle-drift-fade {
          0% {
            transform: scale(0) translate3d(0, 0, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: scale(1) translate3d(calc(var(--tx) * 0.2), calc(var(--ty) * 0.2), 0) rotate(45deg);
          }
          50% {
            opacity: 1;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: scale(0) translate3d(var(--tx), var(--ty), 0) rotate(270deg);
            opacity: 0;
          }
        }
        @keyframes vignette-pulse {
          0% {
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-vignette {
          animation: vignette-pulse 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .sparkle-particle {
          position: absolute;
          animation: sparkle-drift-fade cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}} />

      {/* Elegant overlay vignette pulse to frame the animation */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_40%,rgba(45,27,61,0.06)_80%,rgba(201,168,76,0.05)_100%)] animate-vignette"
      />

      {/* Sparkles list */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle-particle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            color: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            filter: `drop-shadow(0 0 ${s.size / 4}px ${s.color}cc)`,
            ["--tx" as any]: `${s.tx}px`,
            ["--ty" as any]: `${s.ty}px`,
          }}
        >
          {/* Elegant sparkle star shape (four point star) */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 0L15.2 8.8L24 12L15.2 15.2L12 24L8.8 15.2L0 12L8.8 8.8L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
