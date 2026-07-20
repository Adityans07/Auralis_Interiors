"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-sand-50">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-24 h-[28rem] w-[28rem] rounded-full bg-violet-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        />
      </div>

      <div className="container-wide grid gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:py-32">
        {/* Copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-light backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Design Studio
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] text-sand-50 sm:text-5xl lg:text-6xl"
          >
            Design your dream space with{" "}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              AI-powered interior intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-sand-100/75"
          >
            Upload a photo of your room, set your budget and items, choose your
            style, and receive 3–5 personalized design concepts — matched to
            products available near you, then finalized by our design team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <AnimatedCTAButton />
            <Button href="/booking" variant="outline" size="lg" className="border-white/25 text-sand-50 hover:bg-white/10 hover:border-white/50">
              Book Consultation <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-9 flex items-center gap-4 text-sm text-sand-100/70"
          >
            <div className="flex -space-x-2">
              {["a", "b", "c", "d"].map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s}
                  src={`https://picsum.photos/seed/hero-${s}/60/60`}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-ink-950 object-cover"
                />
              ))}
            </div>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <strong className="text-sand-50">4.9</strong> from 1,200+ happy spaces
            </span>
          </motion.div>
        </div>

        {/* Floating visual cards */}
        <div className="relative hidden h-[30rem] lg:block">
          <FloatingCard
            className="left-0 top-6 w-64"
            delay={0}
            image="https://picsum.photos/seed/hero-room1/500/360"
            label="Living Room · Modern"
          />
          <FloatingCard
            className="right-0 top-32 w-56"
            delay={1.2}
            image="https://picsum.photos/seed/hero-room2/500/360"
            label="Bedroom · Japandi"
          />
          <FloatingCard
            className="bottom-2 left-16 w-60"
            delay={0.6}
            image="https://picsum.photos/seed/hero-room3/500/360"
            label="Patio · Exterior"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-dark absolute bottom-24 right-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink-900">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-sand-50">3 concepts ready</p>
              <p className="text-xs text-sand-100/60">Generated in seconds</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  image,
  label,
  delay,
}: {
  className: string;
  image: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + delay * 0.2 }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
        className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={label} className="h-40 w-full object-cover" />
        <p className="px-4 py-3 text-xs font-medium text-sand-100/80">{label}</p>
      </motion.div>
    </motion.div>
  );
}
