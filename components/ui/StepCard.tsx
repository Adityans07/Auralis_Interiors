"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StepCardProps {
  step: number;
  /** Pass a rendered icon element, e.g. <Upload className="h-5 w-5" />. */
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function StepCard({ step, icon, title, description, index = 0 }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-3xl border border-sand-200 bg-white/70 p-7"
    >
      <div className="flex items-center justify-between">
        <span className="font-serif text-4xl font-semibold text-sand-300">
          0{step}
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-gold-dark">
          {icon}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
    </motion.div>
  );
}
