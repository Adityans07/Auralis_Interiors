import { Upload, SlidersHorizontal, Wand2, Handshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepCard } from "@/components/ui/StepCard";

const STEPS = [
  {
    icon: Upload,
    title: "Upload or describe",
    description: "Share a photo of your space or use words to describe your vision.",
  },
  {
    icon: SlidersHorizontal,
    title: "Set preferences",
    description: "Tell us your style, location, and budget parameters.",
  },
  {
    icon: Wand2,
    title: "AI Generation",
    description: "Receive 3–5 tailored design proposals with localized products.",
  },
  {
    icon: Handshake,
    title: "Finalize design",
    description: "Select your favorite concept and refine it with our human team.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-void py-32 md:py-48">
      <div className="absolute top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container-wide relative z-10">
        <SectionHeading
          eyebrow="The Process"
          title="From empty space to masterpiece."
          description="A seamless, transparent workflow blending the speed of AI with the refinement of human craft."
        />
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <StepCard
              key={s.title}
              step={i + 1}
              index={i}
              icon={<s.icon className="h-5 w-5" aria-hidden />}
              title={s.title}
              description={s.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
