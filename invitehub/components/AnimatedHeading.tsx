'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  speed?: number;
  cursorColor?: string;
  variant?: 'slide' | 'fade' | 'typewriter';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';
}

function isDarkContext(node: React.ReactNode, className: string): boolean {
  if (className.includes('text-white') || className.includes('dark')) return true;
  if (React.isValidElement(node)) {
    const childClass = String((node.props as any)?.className || '');
    if (
      childClass.includes('text-white') ||
      childClass.includes('text-slate-100') ||
      childClass.includes('text-gray-100')
    ) {
      return true;
    }
  }
  return false;
}

function isSmallHeading(node: React.ReactNode, as?: string): boolean {
  if (as === 'h3' || as === 'h4' || as === 'span' || as === 'p') return true;
  if (React.isValidElement(node)) {
    const type = typeof node.type === 'string' ? node.type.toLowerCase() : '';
    if (type === 'h3' || type === 'h4' || type === 'p' || type === 'span') return true;
    const childClass = String((node.props as any)?.className || '');
    if (childClass.includes('text-xs') || childClass.includes('text-sm')) return true;
  }
  return false;
}

export const AnimatedHeading = ({
  children,
  className = '',
  delay = 0.1,
  variant = 'slide',
  as,
}: AnimatedHeadingProps) => {
  const shouldReduceMotion = useReducedMotion();
  const isDark = isDarkContext(children, className);
  const isSmall = isSmallHeading(children, as);

  // If reduced motion is preferred, simple fade
  if (shouldReduceMotion || variant === 'fade') {
    return (
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: shouldReduceMotion ? 0 : delay,
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`relative inline-block max-w-full ${className}`.trim()}
      style={{ isolation: 'isolate' }}
    >
      {/* Sliding Background Color Layer (Behind text) - Soft Light Pastel Tone */}
      <div
        className="absolute -inset-x-3 sm:-inset-x-4 -inset-y-1 sm:-inset-y-1.5 pointer-events-none -z-10 flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: isSmall ? '14px' : '20px',
        }}
      >
        {/* Animated Sliding Background Pill */}
        <motion.div
          className={`w-full h-full relative overflow-hidden ${
            isSmall ? 'rounded-xl' : 'rounded-2xl'
          }`}
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(199, 210, 254, 0.15) 25%, rgba(221, 214, 254, 0.14) 50%, rgba(186, 230, 253, 0.15) 75%, rgba(255, 255, 255, 0.08) 100%)'
              : 'linear-gradient(90deg, rgba(255, 255, 255, 0.82) 0%, rgba(238, 245, 255, 0.90) 25%, rgba(246, 242, 255, 0.88) 50%, rgba(235, 248, 255, 0.90) 75%, rgba(255, 255, 255, 0.82) 100%)',
            backgroundSize: '240% 100%',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.18)'
              : '1px solid rgba(219, 234, 254, 0.85)',
            boxShadow: isDark
              ? '0 8px 30px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
              : '0 6px 24px -2px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.03), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          // Smooth horizontal slide oscillation + light gradient color flow
          animate={{
            x: [-8, 8, -8],
            backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
          }}
          transition={{
            x: {
              duration: 4.8,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            backgroundPosition: {
              duration: 7.5,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {/* Active Sliding Light Sweep / Soft White Shimmer */}
          <motion.div
            className="absolute inset-y-0 w-2/5 pointer-events-none"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.20) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.70) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-160%', '280%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              repeatDelay: 1.5,
            }}
          />

          {/* Delicate Light Bottom Accent Line */}
          <motion.div
            className="absolute bottom-0 inset-x-3 h-[1.5px] rounded-full blur-[0.5px] pointer-events-none"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 0%, rgba(199, 210, 254, 0.35) 30%, rgba(186, 230, 253, 0.35) 70%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(147, 197, 253, 0.6) 30%, rgba(196, 181, 253, 0.5) 70%, transparent 100%)',
            }}
            animate={{
              x: [-12, 12, -12],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      {/* Heading Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: delay,
        }}
        className={`relative z-10 ${
          isSmall
            ? 'px-2 py-0.5'
            : 'px-3 sm:px-4 py-1 sm:py-1.5'
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const TypewriterHeading = AnimatedHeading;
export default AnimatedHeading;
