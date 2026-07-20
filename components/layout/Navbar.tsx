"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, NAV_LINKS } from "@/lib/constants";
import { AnimatedCTAButton } from "@/components/ui/AnimatedCTAButton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserDropdown } from "./UserDropdown";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-sand-200/70 bg-sand-50/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="focus-ring flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold text-ink-900">
            {BRAND.name}
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-gold-dark">
            AI Design Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-ink-900"
                      : "text-ink-500 hover:text-ink-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                Login
              </Link>
              <Button href="/signup" variant="outline" size="sm">
                Sign Up
              </Button>
            </>
          )}
          <AnimatedCTAButton className="h-11 px-6 text-sm" />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="focus-ring rounded-full p-2 text-ink-900 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-sand-200/70 bg-sand-50/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-wide flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-white text-ink-900"
                          : "text-ink-600 hover:bg-white/60"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2 px-1">
                <AnimatedCTAButton className="w-full justify-center" />
              </li>

              {/* Auth section */}
              <li className="mt-3 border-t border-sand-200 pt-3">
                <MobileAuthLinks
                  isAuthenticated={isAuthenticated}
                  onNavigate={() => setOpen(false)}
                />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const MOBILE_ACCOUNT_LINKS = [
  { label: "Dashboard", href: "/account" },
  { label: "My Designs", href: "/account/designs" },
  { label: "Bookings", href: "/account/bookings" },
  { label: "Billing", href: "/account/billing" },
  { label: "Profile", href: "/account/profile" },
];

function MobileAuthLinks({
  isAuthenticated,
  onNavigate,
}: {
  isAuthenticated: boolean;
  onNavigate: () => void;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    onNavigate();
    await logout();
    router.push("/");
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-1">
        {MOBILE_ACCOUNT_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className="block rounded-2xl px-4 py-3 text-base font-medium text-ink-600 transition-colors hover:bg-white/60"
          >
            {l.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 block rounded-2xl px-4 py-3 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <Button href="/login" variant="outline" className="w-full justify-center" onClick={onNavigate}>
        Login
      </Button>
      <Button href="/signup" variant="primary" className="w-full justify-center" onClick={onNavigate}>
        Sign Up
      </Button>
    </div>
  );
}
