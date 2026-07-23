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
    <footer className="mt-24 border-t border-white/10 bg-void text-muted-foreground">
      <div className="container-wide grid gap-12 py-24 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + newsletter */}
        <div className="lg:col-span-1">
          <span className="font-serif text-3xl font-light text-foreground">
            {BRAND.name}
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {BRAND.tagline}
          </p>

          <form onSubmit={onSubscribe} className="mt-8">
            <label htmlFor="newsletter" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Join our newsletter
            </label>
            {subscribed ? (
              <p className="mt-4 text-sm text-gold">
                Thanks — you&apos;re on the list.
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-12 w-full rounded-full border border-white/10 bg-base/5 px-5 text-sm text-foreground placeholder:text-white/20 focus-ring"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-base transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground">
            Explore
          </h3>
          <ul className="mt-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground">
            Services
          </h3>
          <ul className="mt-6 space-y-4">
            {SERVICES.map((s) => (
              <li key={s} className="text-sm text-muted-foreground">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground">
            Get in touch
          </h3>
          <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-4">
              <Mail className="mt-0.5 h-4 w-4 text-gold" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-gold transition-colors">
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <Phone className="mt-0.5 h-4 w-4 text-gold" />
              <a href={`tel:${BRAND.phone}`} className="hover:text-gold transition-colors">
                {BRAND.phone}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-4 w-4 text-gold" />
              <span>{BRAND.address}</span>
            </li>
          </ul>

          <div className="mt-8 flex gap-4">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-base/5 text-muted-foreground transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-base">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">Crafted with <span className="text-gold">AI</span> intelligence.</p>
        </div>
      </div>
    </footer>
  );
}
