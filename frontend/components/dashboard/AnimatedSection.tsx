"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedSection({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const staggerDelay = Math.min(index * 0.08, 0.48);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22, margin: "0px 0px -8% 0px" }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, delay: staggerDelay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
