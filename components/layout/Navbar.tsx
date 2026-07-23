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
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-base/60 backdrop-blur-2xl"
          : "bg-transparent"
      )}
    >
      <nav className="container-wide flex h-20 items-center justify-between">
        <Link href="/" className="focus-ring flex flex-col leading-none">
          <span className="font-serif text-2xl font-light text-foreground">
            {BRAND.name}
          </span>
          <span className="mt-1 text-[0.55rem] uppercase tracking-[0.3em] text-gold">
            AI Design Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-2 lg:flex">
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
                    "focus-ring rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Button href="/signup" variant="outline" size="sm" className="rounded-full uppercase tracking-widest text-xs h-9">
                Sign Up
              </Button>
            </>
          )}
          <AnimatedCTAButton className="h-9 px-6 text-xs uppercase tracking-widest rounded-full" />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="focus-ring rounded-full p-2 text-foreground lg:hidden"
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-base/95 backdrop-blur-2xl lg:hidden"
          >
            <ul className="container-wide flex flex-col gap-2 py-6">
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
                        "block rounded-2xl px-4 py-3 text-lg font-serif transition-colors",
                        active
                          ? "bg-base/10 text-foreground"
                          : "text-muted-foreground hover:bg-base/5 hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-4 px-1">
                <AnimatedCTAButton className="w-full justify-center py-6 text-sm" />
              </li>

              {/* Auth section */}
              <li className="mt-6 border-t border-white/10 pt-6">
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
            className="block rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-base/60"
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
