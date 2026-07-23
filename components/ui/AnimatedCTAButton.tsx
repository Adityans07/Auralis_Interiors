"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCTAButtonProps {
  href?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * The signature "Try Us" call-to-action.
 * Combines a pulsing glow ring, a subtle scale hover, and a shimmer sweep
 * to make it the most eye-catching element on the page.
 */
export function AnimatedCTAButton({
  href = "/try-us",
  label = "Try Us",
  className,
  onClick,
}: AnimatedCTAButtonProps) {
  const content = (
    <motion.span
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-9 text-base font-semibold text-foreground shadow-glow focus-ring",
        className
      )}
    >
      {/* pulsing halo */}
      <span className="pointer-events-none absolute inset-0 -z-10 animate-glow-pulse rounded-full" />
      {/* shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <Sparkles className="h-5 w-5" aria-hidden />
      {label}
    </motion.span>
  );

  if (onClick) {
    return (
      <button onClick={onClick} aria-label={label} className="inline-flex">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={label} className="inline-flex">
      {content}
    </Link>
  );
}
