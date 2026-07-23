import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { TESTIMONIALS } from "@/lib/mock-data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-void py-32 md:py-48">
      <div className="absolute top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-wide relative z-10">
        <SectionHeading
          eyebrow="Loved by clients"
          title="Spaces transformed, people delighted."
          description="Real stories from homeowners and businesses who designed with Auralis."
        />
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} index={i}>
              <TestimonialCard t={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
