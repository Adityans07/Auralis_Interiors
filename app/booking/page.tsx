import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarClock, MessageSquareText, Sparkles } from "lucide-react";
import { BookingFormWithParams } from "@/components/forms/BookingFormWithParams";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Reserve a personalized design consultation with the Auralis Interiors team. Share your space, timeline, and budget — we'll take it from there.",
};

const EXPECTATIONS = [
  {
    icon: CalendarClock,
    title: "A time that suits you",
    description:
      "Choose your preferred date and time — we'll confirm the slot and send calendar details.",
  },
  {
    icon: MessageSquareText,
    title: "A focused conversation",
    description:
      "A designer reviews your space, goals, and budget to shape a tailored plan.",
  },
  {
    icon: Sparkles,
    title: "Concepts to explore",
    description:
      "Leave with clear next steps and AI-assisted design directions made for you.",
  },
];

export default function BookingPage() {
  return (
    <div className="container-wide py-20 md:py-28">
      <SectionHeading
        eyebrow="Booking"
        title="Book a Consultation"
        description="Tell us about your project and reserve a session with our design team. It takes less than two minutes."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Form */}
        <Reveal>
          <Suspense
            fallback={
              <div className="rounded-3xl border border-sand-200 bg-white/80 p-8 shadow-soft">
                <p className="text-sm text-ink-500">Loading booking form…</p>
              </div>
            }
          >
            <BookingFormWithParams />
          </Suspense>
        </Reveal>

        {/* What to expect */}
        <Reveal index={1}>
          <aside className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-soft sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              What to expect
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              A calm, considered process — no pressure, just clarity.
            </p>
            <ul className="mt-6 space-y-6">
              {EXPECTATIONS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-ink-800">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
