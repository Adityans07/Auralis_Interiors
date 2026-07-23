import { Gift } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";

export function TryUsPromo() {
  return (
    <section className="container-wide py-16 md:py-32">
      <Reveal className="glass-dark relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center text-foreground md:px-16 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-dark-gradient opacity-80" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-[100px]" />
        <div className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-gold/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
            <Gift className="h-3.5 w-3.5" /> First design generation is free
          </span>
          <h2 className="mt-8 font-serif text-4xl font-light leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
            Ready to see your <br />
            <span className="italic text-muted-foreground">space reimagined?</span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
            Experience our proprietary AI design studio today. Your first set of cinematic, personalized concepts is completely free — no card required.
          </p>
          <div className="mt-12 flex justify-center">
            <AnimatedCTAButton label="Try Us — It's Free" className="h-14 px-8 text-sm uppercase tracking-widest rounded-full shadow-glow" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
