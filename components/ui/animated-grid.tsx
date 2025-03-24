"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  animation?:
    | "fade"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right"
    | "scale";
  duration?: number;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export function AnimatedGrid({
  children,
  className,
  itemClassName,
  staggerDelay = 0.05,
  animation = "fade",
  duration = 0.3,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "gap-4",
}: AnimatedGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  // Item variants based on animation type
  const getItemVariants = () => {
    switch (animation) {
      case "slide-up":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  const itemVariants = getItemVariants();

  // Generate grid classes based on columns prop
  const gridClasses = cn(
    "grid",
    gap,
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  return (
    <motion.div
      className={gridClasses}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={cn(itemClassName)}
          variants={itemVariants}
          transition={{ duration, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
