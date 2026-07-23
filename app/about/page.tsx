import type { Metadata } from "next";
import Image from "next/image";
import {
  Sparkles,
  Users,
  ShieldCheck,
  Gauge,
  Search,
  Wand2,
  SlidersHorizontal,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StepCard } from "@/components/ui/StepCard";
import { Button } from "@/components/ui/Button";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story behind Auralis Interiors — where generative AI meets human design craft to create spaces that are personal, practical, and beautifully sourced.",
};

const STATS = [
  { value: "1,200+", label: "Spaces designed" },
  { value: "4.9", label: "Average client rating" },
  { value: "48-hr", label: "Concept turnaround" },
  { value: "30+", label: "Cities served" },
];

const WHY = [
  {
    icon: Sparkles,
    title: "AI that explores at scale",
    description:
      "Our models generate dozens of tailored directions in seconds, so you start from possibility — not a blank room.",
  },
  {
    icon: Users,
    title: "Designers who curate",
    description:
      "Seasoned interior designers edit every concept, bringing taste, proportion, and real-world judgment the machine can't.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded in real products",
    description:
      "Each recommendation is a genuine, purchasable item matched to your budget and available near you.",
  },
  {
    icon: Gauge,
    title: "Fast, without the compromise",
    description:
      "What once took weeks of back-and-forth now arrives in days, with the polish you'd expect from a boutique studio.",
  },
];

const PROCESS = [
  {
    icon: Search,
    title: "Discover",
    description:
      "Share your space, budget, style, and the way you actually live. We listen before we design.",
  },
  {
    icon: Wand2,
    title: "Generate",
    description:
      "Our AI composes multiple personalized concepts, each built from products that fit your constraints.",
  },
  {
    icon: SlidersHorizontal,
    title: "Refine",
    description:
      "Our design team edits, swaps, and elevates — tuning every detail with you until it feels right.",
  },
  {
    icon: PackageCheck,
    title: "Deliver",
    description:
      "Receive a finalized plan with sourcing links, layouts, and pricing — ready to bring to life.",
  },
];

const TEAM = [
  {
    name: "Elena Márquez",
    role: "Head of Design",
    seed: "auralis-team-elena",
    bio: "Fifteen years shaping residential interiors from Barcelona to San Francisco.",
  },
  {
    name: "Devin Okafor",
    role: "Lead AI Engineer",
    seed: "auralis-team-devin",
    bio: "Builds the generative models that turn a photo into a room full of options.",
  },
  {
    name: "Priya Nair",
    role: "Landscape Lead",
    seed: "auralis-team-priya",
    bio: "Brings gardens, patios, and facades to life with a climate-first eye.",
  },
  {
    name: "Marcus Lindqvist",
    role: "Client Success",
    seed: "auralis-team-marcus",
    bio: "Guides every client from first concept to the day the last cushion lands.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* 1. Hero / intro */}
      <section className="relative overflow-hidden bg-luxury-radial">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-wide py-20 md:py-28">
          <SectionHeading
            eyebrow="Our Story"
            title="Where artificial intelligence meets human artistry"
            description={`${BRAND.name} was built on a simple belief: everyone deserves a beautifully designed space, and technology should make that feel effortless — never impersonal.`}
          />

          <Reveal index={1} className="mt-14">
            <div className="relative aspect-[16/8] overflow-hidden rounded-4xl border border-white/10 shadow-glow">
              <Image
                src="https://picsum.photos/seed/auralis-about-hero/1600/800"
                alt="A sunlit, thoughtfully styled living room designed by Auralis Interiors"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Brand story */}
      <section className="container-wide py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <span className="eyebrow mb-4">How we started</span>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              A studio born from two frustrations
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Our founders met at the intersection of design and machine
                learning — one had spent a career styling homes, the other
                teaching computers to see. Both kept running into the same wall:
                great design was slow, expensive, and out of reach for most
                people, while the AI tools that promised to help produced pretty
                pictures of furniture no one could actually buy.
              </p>
              <p>
                So they built {BRAND.name} to close that gap. We pair generative
                design with a catalog of real, purchasable products and a team of
                human designers who make sure every concept is livable, sourceable,
                and genuinely yours.
              </p>
              <p>
                Today we help homeowners, renters, and small businesses reimagine
                their spaces in days instead of months — with the warmth of a
                boutique studio and the reach of intelligent software.
              </p>
            </div>
          </Reveal>

          <Reveal index={1} className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-4xl border border-white/10 shadow-glow">
              <Image
                src="https://picsum.photos/seed/auralis-about-story/900/1120"
                alt="Auralis designers reviewing material swatches and layout concepts together"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Mission statement */}
      <section className="container-wide py-10 md:py-16">
        <Reveal className="relative overflow-hidden rounded-4xl bg-void px-6 py-16 text-center text-foreground md:px-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-luxury-radial opacity-80" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <span className="eyebrow mb-4 text-gold-light">Our mission</span>
            <p className="text-2xl font-serif font-medium leading-snug text-foreground sm:text-3xl md:text-4xl">
              To make thoughtful, beautiful design accessible to everyone — by
              blending the speed and imagination of AI with the taste and care of
              real designers.
            </p>
          </div>
        </Reveal>
      </section>

      {/* 4. Why AI + human designers */}
      <section className="relative bg-luxury-radial">
        <div className="container-wide py-20 md:py-28">
          <SectionHeading
            eyebrow="Why AI + human designers"
            title="The best of both, on purpose"
            description="Software brings breadth and speed. People bring judgment and warmth. We designed Auralis so you never have to choose between them."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item, i) => (
              <FeatureCard
                key={item.title}
                index={i}
                icon={<item.icon className="h-6 w-6" aria-hidden />}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Design process */}
      <section className="container-wide py-20 md:py-28">
        <SectionHeading
          eyebrow="Our process"
          title="From first photo to finished space"
          description="A clear, four-step path that keeps you in control at every stage."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <StepCard
              key={step.title}
              step={i + 1}
              index={i}
              icon={<step.icon className="h-5 w-5" aria-hidden />}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </section>

      {/* 6. Team */}
      <section className="relative bg-void py-20 md:py-32">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Meet the team"
            title="The people behind your space"
            description="A small, senior team of designers and engineers who care as much about how a room feels as how it looks."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member, i) => (
              <Reveal
                key={member.name}
                index={i}
                as="article"
                className="group glass-dark overflow-hidden rounded-[2rem] transition-colors hover:bg-white/10"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl m-2">
                  <Image
                    src={`https://picsum.photos/seed/${member.seed}/600/750`}
                    alt={`Portrait of ${member.name}, ${member.role} at ${BRAND.name}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-2xl font-light text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
                    {member.role}
                  </p>
                  <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trust indicators */}
      <section className="container-wide py-10 md:py-20">
        <Reveal className="glass-dark rounded-[3rem] px-6 py-16 md:px-16 md:py-20">
          <dl className="grid grid-cols-2 gap-y-12 text-center lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-serif text-5xl font-light text-foreground sm:text-6xl md:text-7xl">
                    {stat.value}
                  </span>
                  <span className="mt-6 block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* 8. Closing CTA */}
      <section className="container-wide py-24 md:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mb-6">Ready when you are</span>
          <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl md:text-6xl">
            Let&rsquo;s design a space that feels like you
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
            Start with a free set of AI-generated concepts, or book a consultation
            with our design team to talk it through.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <AnimatedCTAButton />
            <Button href="/booking" variant="outline" size="lg" className="rounded-full border-white/20 text-foreground hover:border-white/40 hover:bg-white/10">
              Book Consultation <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
