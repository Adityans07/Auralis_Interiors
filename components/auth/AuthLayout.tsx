"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Wallet, CalendarCheck } from "lucide-react";
import { BRAND } from "@/lib/constants";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Optional footer node (e.g. links to other auth pages). */
  footer?: React.ReactNode;
}

const TRUST = [
  { icon: ShieldCheck, text: "Save your designs securely in one place" },
  { icon: Wallet, text: "Track budgets and pricing over time" },
  { icon: CalendarCheck, text: "Manage consultations and bookings" },
];

/** Split-screen premium auth shell: form card + decorative brand panel. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-sand-50">
      <div className="pointer-events-none absolute inset-0 bg-luxury-radial" />

      <div className="container-wide relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16">
        {/* Form side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass rounded-4xl p-8 shadow-soft sm:p-10">
            <Link href="/" className="focus-ring mb-6 inline-flex flex-col leading-none">
              <span className="font-serif text-xl font-semibold text-ink-900">
                {BRAND.name}
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.25em] text-gold-dark">
                AI Design Studio
              </span>
            </Link>

            <h1 className="text-3xl font-semibold text-ink-900">{title}</h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-sm text-ink-500">{footer}</div>}
          </div>
        </motion.div>

        {/* Decorative side */}
        <div className="relative hidden h-full min-h-[32rem] overflow-hidden rounded-4xl lg:block">
          <Image
            src="https://picsum.photos/seed/auralis-auth/1000/1400"
            alt="A beautifully designed interior space"
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-sand-50">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-light backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Your design home
            </span>
            <p className="mt-5 font-serif text-3xl font-semibold leading-snug">
              Save your designs, track budgets, and manage consultations in one
              place.
            </p>
            <ul className="mt-6 space-y-3">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-sand-100/85">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-gold-light" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
