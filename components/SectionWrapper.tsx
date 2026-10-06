"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface SectionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function SectionWrapper({
  children,
  className = "",
  id,
  ...props
}: SectionWrapperProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`will-change-transform overflow-x-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
