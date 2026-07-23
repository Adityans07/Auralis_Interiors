"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FeatureCardProps {
  /** Pass a rendered icon element, e.g. <Sofa className="h-6 w-6" />. */
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group glass-dark relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:bg-white/10"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500 group-hover:bg-gold group-hover:text-void group-hover:shadow-glow">
        {icon}
      </div>
      <h3 className="text-xl font-light text-foreground">{title}</h3>
      <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{description}</p>
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-3xl transition-opacity duration-700 opacity-0 group-hover:opacity-100" />
    </motion.div>
  );
}
