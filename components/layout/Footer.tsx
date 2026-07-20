"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Facebook, Youtube, Mail, Phone, MapPin, Send } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/lib/constants";

const SERVICES = [
  "AI Interior Design",
  "AI Exterior Design",
  "Budget Planning",
  "Product Sourcing",
  "Design Consultation",
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Mock newsletter subscribe — wire to a real endpoint later.
  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer className="mt-24 bg-ink-950 text-sand-100">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + newsletter */}
        <div className="lg:col-span-1">
          <span className="font-serif text-2xl font-semibold text-sand-50">
            {BRAND.name}
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-100/70">
            {BRAND.tagline}
          </p>

          <form onSubmit={onSubscribe} className="mt-6">
            <label htmlFor="newsletter" className="text-xs uppercase tracking-widest text-sand-100/60">
              Join our newsletter
            </label>
            {subscribed ? (
              <p className="mt-2 text-sm text-gold-light">
                Thanks — you&apos;re on the list.
              </p>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-sand-50 placeholder:text-sand-100/40 focus-ring"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink-900 transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-50">
            Explore
          </h3>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-sand-100/70 transition-colors hover:text-gold-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-50">
            Services
          </h3>
          <ul className="mt-4 space-y-3">
            {SERVICES.map((s) => (
              <li key={s} className="text-sm text-sand-100/70">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-sand-50">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/70">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-gold-light" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-gold-light">
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-gold-light" />
              <a href={`tel:${BRAND.phone}`} className="hover:text-gold-light">
                {BRAND.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-gold-light" />
              <span>{BRAND.address}</span>
            </li>
          </ul>

          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sand-100/80 transition-colors hover:bg-gold hover:text-ink-900"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-6 text-xs text-sand-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>Crafted with AI-assisted design intelligence.</p>
        </div>
      </div>
    </footer>
  );
}
