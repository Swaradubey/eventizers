'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface TypewriterHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  speed?: number;
  cursorColor?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node) && node.props) {
    return extractText((node.props as any).children);
  }
  return '';
}

export const TypewriterHeading = ({
  children,
  className = '',
  delay = 0.1,
  speed = 36,
  cursorColor = '#1D77F3',
  as,
}: TypewriterHeadingProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-30px' });
  const shouldReduceMotion = useReducedMotion();

  const fullText = extractText(children);
  const [currentCount, setCurrentCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const delayMs = Math.max(0, (delay ?? 0.1) > 10 ? (delay ?? 0.1) : (delay ?? 0.1) * 1000);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCurrentCount(fullText.length);
      setIsComplete(true);
      setShowCursor(false);
      return;
    }

    if (!isInView || !fullText) return;

    let timer: NodeJS.Timeout;
    const startTimeout = setTimeout(() => {
      let index = 0;
      timer = setInterval(() => {
        index += 1;
        setCurrentCount(index);
        if (index >= fullText.length) {
          clearInterval(timer);
          setIsComplete(true);
        }
      }, speed);
    }, delayMs);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [isInView, fullText, speed, delayMs, shouldReduceMotion]);

  useEffect(() => {
    if (isComplete) {
      const hideTimer = setTimeout(() => {
        setShowCursor(false);
      }, 2000);
      return () => clearTimeout(hideTimer);
    }
  }, [isComplete]);

  const renderTypingContent = () => {
    const displayed = fullText.slice(0, currentCount);
    const remaining = fullText.slice(currentCount);

    return (
      <>
        <span>{displayed}</span>
        {showCursor && (
          <span
            className="inline-block ml-0.5 w-[2.5px] rounded-full align-[-0.05em] animate-pulse"
            style={{
              height: '0.82em',
              backgroundColor: cursorColor,
              boxShadow: `0 0 8px ${cursorColor}80`,
              WebkitTextFillColor: cursorColor,
            }}
            aria-hidden="true"
          />
        )}
        {remaining.length > 0 && (
          <span
            className="opacity-0 select-none pointer-events-none inline"
            aria-hidden="true"
          >
            {remaining}
          </span>
        )}
      </>
    );
  };

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ref: containerRef,
      className: `${child.props.className || ''} ${className}`.trim(),
      'aria-label': fullText,
      children: renderTypingContent(),
    });
  }

  const Component = as || 'div';
  return (
    <Component
      // @ts-ignore
      ref={containerRef}
      className={className}
      aria-label={fullText}
    >
      {renderTypingContent()}
    </Component>
  );
};

export default TypewriterHeading;
