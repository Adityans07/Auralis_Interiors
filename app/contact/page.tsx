import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach the Auralis Interiors team — questions, collaborations, or a project in mind. We usually reply within one business day.",
};

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: BRAND.phone,
    href: `tel:${BRAND.phone}`,
  },
  {
    icon: MapPin,
    label: "Studio",
    value: BRAND.address,
  },
  {
    icon: Clock,
    label: "Hours",
    value: BRAND.hours,
  },
];

const FAQS = [
  {
    q: "How quickly will I hear back?",
    a: "Most messages receive a reply within one business day. For time-sensitive projects, mention your timeline in the message.",
  },
  {
    q: "Do you work with clients outside San Francisco?",
    a: "Yes. Our AI-assisted process is remote-first, and we collaborate with clients worldwide while sourcing products near you.",
  },
  {
    q: "Can I book a consultation instead?",
    a: "Absolutely. Head to our booking page to reserve a dedicated consultation with one of our designers.",
  },
  {
    q: "Is there a cost to get started?",
    a: "Your first design exploration is complimentary. We only discuss investment once you've seen concepts you love.",
  },
];

export default function ContactPage() {
  return (
    <div className="container-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Contact"
        title="Let's design something remarkable."
        description="Whether you have a question, a space, or a bold idea — we'd love to hear from you."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Form */}
        <Reveal>
          <ContactForm />
        </Reveal>

        {/* Contact info */}
        <Reveal index={1} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="glass-dark rounded-3xl p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="focus-ring mt-2 block text-sm font-light text-foreground transition-colors hover:text-gold-light"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-light text-foreground">
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/5 bg-void shadow-glow">
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 bg-dark-gradient mix-blend-screen"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold-dark shadow-glow">
                <MapPin className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-medium text-foreground">
                Map preview
              </p>
              <p className="mt-1 text-xs font-light text-muted-foreground">{BRAND.address}</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* FAQ */}
      <div className="mt-24 md:mt-32">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers to common questions"
          description="A few things clients often ask before reaching out."
        />
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} index={i} as="div">
              <details className="group rounded-3xl glass-dark p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground">
                  {faq.q}
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
