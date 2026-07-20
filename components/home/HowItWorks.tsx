import { Upload, SlidersHorizontal, Wand2, Handshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepCard } from "@/components/ui/StepCard";

const STEPS = [
  {
    icon: Upload,
    title: "Upload or describe your space",
    description: "Add a photo of your room or exterior — or simply describe it in words.",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose items, style, location & budget",
    description: "Tell us what you need, the look you love, where you are, and your budget.",
  },
  {
    icon: Wand2,
    title: "Get 3–5 AI design concepts",
    description: "Receive tailored proposals with real products matched to your area.",
  },
  {
    icon: Handshake,
    title: "Select a design & finalize with our team",
    description: "Pick your favorite and our designers help you make it real.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="How it works"
        title="From empty space to finished design in four steps"
        description="A guided, transparent process that blends AI speed with human craft."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
    </section>
  );
}
