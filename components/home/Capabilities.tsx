import { Sofa, Trees, PackageSearch, Wallet, MapPin, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/ui/FeatureCard";

const CAPABILITIES = [
  {
    icon: Sofa,
    title: "Interior Design",
    description: "Living rooms, bedrooms, kitchens, offices and more — reimagined for how you live.",
  },
  {
    icon: Trees,
    title: "Exterior Design",
    description: "Facades, gardens, patios and outdoor areas with weather-ready selections.",
  },
  {
    icon: PackageSearch,
    title: "Product-Aware Recommendations",
    description: "Every concept is built from real, purchasable products — not just inspiration.",
  },
  {
    icon: Wallet,
    title: "Budget-Based Planning",
    description: "Designs that respect your budget, with clear pricing on every item.",
  },
  {
    icon: MapPin,
    title: "Location-Based Matching",
    description: "We prioritize products available near you for faster, easier sourcing.",
  },
  {
    icon: Users,
    title: "Team-Assisted Finalization",
    description: "Human designers review and refine before you commit to anything.",
  },
];

export function Capabilities() {
  return (
    <section className="relative bg-luxury-radial">
      <div className="container-wide py-20 md:py-28">
        <SectionHeading
          eyebrow="What we do"
          title="Intelligent design, grounded in the real world"
          description="Auralis pairs generative design with practical sourcing so ideas actually come to life."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <FeatureCard
              key={c.title}
              index={i}
              icon={<c.icon className="h-6 w-6" aria-hidden />}
              title={c.title}
              description={c.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
