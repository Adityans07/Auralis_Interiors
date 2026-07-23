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
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-gold-dark via-gold to-gold-light shadow-glow"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-base">
          <Sparkles className="h-8 w-8 text-gold-dark" />
        </span>
      </motion.div>

      <h2 className="mt-10 font-serif text-3xl font-light text-foreground">
        Designing your space
      </h2>
      <p className="mt-3 text-sm font-light text-muted-foreground">
        Our AI is composing cinematic concepts — this only takes a moment.
      </p>

      <ul className="mt-12 w-full space-y-4 text-left">
        {GENERATION_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: done || active ? 1 : 0.4 }}
              className="glass-dark flex items-center gap-4 rounded-2xl p-4"
            >
              <span
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full " +
                  (done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : active
                    ? "bg-gold/20 text-gold"
                    : "bg-base/5 text-muted-foreground/50")
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
              <span className="text-sm font-light text-foreground">{label}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
