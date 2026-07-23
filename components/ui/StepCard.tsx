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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-dark relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-8 transition-colors hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <span className="font-serif text-5xl font-light text-white/20">
          0{step}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          {icon}
        </span>
      </div>
      <div className="mt-12">
        <h3 className="text-xl font-light text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
