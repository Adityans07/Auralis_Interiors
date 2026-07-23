"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Star, ArrowRight, Mouse } from "lucide-react";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import { Button } from "@/components/ui/Button";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-void"
    >
      {/* Cinematic Parallax Background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <div className="absolute inset-0 bg-dark-gradient opacity-90 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2800" 
          alt="Luxury Interior Design" 
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 z-10 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />

      <div className="container-wide relative z-20 flex flex-col items-center pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow mb-8 rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-gold" /> 
          <span className="tracking-[0.3em] text-foreground">AI-Powered Luxury</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl text-display-medium font-serif leading-[0.95] tracking-tight text-foreground"
        >
          Redefining the <br />
          <span className="italic text-muted-foreground">art of living</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground"
        >
          Experience interior design evolved. Upload your space and let our proprietary AI craft cinematic, award-winning concepts tailored to your aesthetic in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col items-center gap-6 sm:flex-row"
        >
          <AnimatedCTAButton className="h-14 px-8 text-sm uppercase tracking-widest rounded-full shadow-glow" />
          <Button 
            href="/booking" 
            variant="outline" 
            className="h-14 rounded-full border-white/10 px-8 text-sm uppercase tracking-widest text-foreground hover:bg-white/10 hover:border-white/20"
          >
            Explore Gallery <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll to discover</span>
          <Mouse className="h-5 w-5 animate-bounce opacity-50" />
        </motion.div>
      </div>

      {/* Side floating elements - very subtle glassmorphism */}
      <FloatingStats />
    </section>
  );
}

function FloatingStats() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-dark absolute bottom-24 left-8 hidden items-center gap-4 rounded-2xl p-4 pr-6 lg:flex"
      >
        <div className="flex -space-x-3">
          {[1, 2, 3].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`https://i.pravatar.cc/100?img=${i + 10}`}
              alt=""
              className="h-10 w-10 rounded-full border-2 border-void object-cover grayscale"
            />
          ))}
        </div>
        <div>
          <p className="flex items-center gap-1 text-sm font-light text-foreground">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> 4.9/5
          </p>
          <p className="text-xs font-light text-muted-foreground">From 2,000+ clients</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-dark absolute bottom-32 right-8 hidden flex-col gap-1 rounded-2xl p-5 lg:flex"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-2xl font-light text-foreground">1.2M+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Designs Generated</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
