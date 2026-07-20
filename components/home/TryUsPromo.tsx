import { Gift } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";

export function TryUsPromo() {
  return (
    <section className="container-wide py-10 md:py-16">
      <Reveal className="relative overflow-hidden rounded-4xl bg-ink-950 px-6 py-16 text-center text-sand-50 md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
            <Gift className="h-3.5 w-3.5" /> First design generation is free
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-sand-50 sm:text-4xl md:text-5xl">
            Ready to see your space reimagined?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-sand-100/75">
            Try our AI design studio today. Your first set of personalized
            concepts is completely free — no card required.
          </p>
          <div className="mt-9 flex justify-center">
            <AnimatedCTAButton label="Try Us — It's Free" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
