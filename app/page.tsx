import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Capabilities } from "@/components/home/Capabilities";
import { StylesShowcase } from "@/components/home/StylesShowcase";
import { TryUsPromo } from "@/components/home/TryUsPromo";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BlogPreview } from "@/components/home/BlogPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Capabilities />
      <StylesShowcase />
      <TryUsPromo />
      <TestimonialsSection />
      <BlogPreview />
    </>
  );
}
