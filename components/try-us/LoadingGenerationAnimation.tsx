"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { GENERATION_STEPS } from "@/lib/constants";

/**
 * Full-flow loading state shown while generateDesigns() resolves.
 * Cycles through the GENERATION_STEPS messages with a progress indicator.
 */
export function LoadingGenerationAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, GENERATION_STEPS.length - 1));
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-gold-dark via-gold to-gold-light shadow-glow"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-50">
          <Sparkles className="h-8 w-8 text-gold-dark" />
        </span>
      </motion.div>

      <h2 className="mt-8 text-2xl font-semibold text-ink-900">
        Designing your space
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        Our AI is composing personalized concepts — this only takes a moment.
      </p>

      <ul className="mt-8 w-full space-y-3 text-left">
        {GENERATION_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: done || active ? 1 : 0.4 }}
              className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/70 px-4 py-3"
            >
              <span
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full " +
                  (done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-ink-900 text-gold-light"
                    : "bg-sand-200 text-ink-400")
                }
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </span>
              <span className="text-sm font-medium text-ink-700">{label}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
