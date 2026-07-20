import { Suspense } from "react";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { TryUsExperience } from "@/components/try-us/TryUsExperience";

export const metadata: Metadata = {
  title: "Try AI Interior Design",
  description:
    "Upload your space, set your budget, select your items, and receive personalized AI design concepts. Your first generation is free.",
};

export default function TryUsPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-ink-950 text-sand-50">
        <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="container-wide relative py-16 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5" /> AI Design Studio
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-sand-50 sm:text-5xl">
            Try AI Interior Design
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sand-100/75">
            Upload your space, set your budget, select your items, and receive
            personalized design concepts — matched to products available near you.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className="container-wide py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Suspense
            fallback={
              <div className="py-24 text-center text-ink-400">Loading the studio…</div>
            }
          >
            <TryUsExperience />
          </Suspense>
        </div>
      </section>
    </>
  );
}
