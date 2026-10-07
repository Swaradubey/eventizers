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

function applyGradientToNode(children: React.ReactNode, isDark: boolean): React.ReactNode {
  const gradientClass = isDark
    ? 'bg-clip-text text-transparent heading-gradient-flow-dark'
    : 'bg-clip-text text-transparent heading-gradient-flow';

  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childClass = String((child.props as any)?.className || '');
      return React.cloneElement(child as React.ReactElement<any>, {
        className: `${childClass} ${gradientClass}`.trim(),
      });
    }
    if (typeof child === 'string' || typeof child === 'number') {
      return <span className={gradientClass}>{child}</span>;
    }
    return child;
  });
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

  const styledChildren = applyGradientToNode(children, isDark);

  // If reduced motion is preferred, simple fade without continuous movement
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
        className={`inline-block ${className}`.trim()}
      >
        {styledChildren}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: delay,
      }}
      className={`relative inline-block max-w-full ${className}`.trim()}
    >
      {styledChildren}
    </motion.div>
  );
};

export const TypewriterHeading = AnimatedHeading;
export default AnimatedHeading;

