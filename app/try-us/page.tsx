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
    <div className="bg-void min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-void text-foreground pt-20">
        <div className="pointer-events-none absolute inset-0 bg-dark-gradient opacity-80 mix-blend-multiply" />
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold/10 blur-[100px]" />
        <div className="container-wide relative py-16 md:py-24 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> AI Design Studio
          </span>
          <h1 className="mt-8 font-serif text-display-medium font-light leading-[1.1] text-foreground">
            Reimagine your <br />
            <span className="italic text-muted-foreground">space</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
            Upload your space, set your budget, select your items, and receive
            cinematic, personalized design concepts in seconds.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className="container-wide pb-24">
        <div className="mx-auto max-w-5xl">
          <Suspense
            fallback={
              <div className="py-32 text-center text-muted-foreground font-light tracking-widest uppercase text-sm">
                Initializing Studio...
              </div>
            }
          >
            <TryUsExperience />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
