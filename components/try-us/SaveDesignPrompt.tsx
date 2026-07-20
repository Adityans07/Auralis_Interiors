"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, BookmarkPlus, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { setRedirectIntent } from "@/lib/services/redirect";

/**
 * Shown to GUEST users on the results screen, encouraging account creation to
 * save their generated designs. Preserves /try-us as the post-auth destination.
 */
export function SaveDesignPrompt() {
  const remember = () => setRedirectIntent("/try-us");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-sand-50 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5" /> Don&apos;t lose your concepts
          </span>
          <h3 className="mt-4 font-serif text-2xl font-semibold text-sand-50">
            Create an account to save your designs
          </h3>
          <p className="mt-2 text-sm text-sand-100/75">
            Save your designs, track prices over time, and continue with our
            team — all in one place.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-100/80">
            <li className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4 text-gold-light" /> Save results
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold-light" /> Track budgets
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-light" /> Team follow-up
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
          <Button href="/signup" variant="secondary" className="justify-center" onClick={remember}>
            Create Account
          </Button>
          <Button
            href="/login"
            variant="outline"
            className="justify-center border-white/25 text-sand-50 hover:bg-white/10 hover:border-white/50"
            onClick={remember}
          >
            Log In
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
