import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { TESTIMONIALS } from "@/lib/mock-data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="bg-luxury-radial">
      <div className="container-wide py-20 md:py-28">
        <SectionHeading
          eyebrow="Loved by clients"
          title="Spaces transformed, people delighted"
          description="Real stories from homeowners and businesses who designed with Auralis."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
