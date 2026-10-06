'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import TypewriterHeading from './TypewriterHeading';

export interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  speed?: number;
  cursorColor?: string;
  variant?: 'typewriter' | 'fade';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';
}

export const AnimatedHeading = ({
  children,
  className = '',
  delay = 0.1,
  speed = 36,
  cursorColor = '#1D77F3',
  variant = 'typewriter',
  as,
}: AnimatedHeadingProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (variant === 'typewriter' && !shouldReduceMotion) {
    return (
      <TypewriterHeading
        className={className}
        delay={delay}
        speed={speed}
        cursorColor={cursorColor}
        as={as}
      >
        {children}
      </TypewriterHeading>
    );
  }

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 24, filter: 'blur(6px)' }
      }
      whileInView={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: 'blur(0px)' }
      }
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.65,
        ease: [0.16, 1, 0.3, 1], // Custom smooth cubic-bezier
        delay: shouldReduceMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export { TypewriterHeading };
export default AnimatedHeading;
