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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 18);
      setVisible(current <= 80 || current < lastScrollY);
      lastScrollY = current;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
        scrolled
          ? "border-b border-white/10 bg-[#0f0d11]/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="container-wide flex h-20 items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold text-sand-50">
            {BRAND.name}
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.32em] text-sand-200">
            AI Design Studio
          </span>
        </Link>

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
                    "focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-sand-50 shadow-soft"
                      : "text-sand-300 hover:text-sand-50 hover:bg-white/5"
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
                className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-sand-300 transition-colors hover:bg-white/5 hover:text-sand-50"
              >
                Login
              </Link>
              <Button href="/signup" variant="outline" size="sm" className="border-white/15 text-sand-50 hover:border-white/25 hover:bg-white/5">
                Sign Up
              </Button>
            </>
          )}
          <AnimatedCTAButton className="h-11 px-6 text-sm" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="focus-ring rounded-full border border-white/10 bg-white/5 p-2 text-sand-50 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-[#09080b]/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-wide flex flex-col gap-2 py-4">
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
                        "block rounded-3xl px-4 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-white/10 text-sand-50"
                          : "text-sand-300 hover:bg-white/10 hover:text-sand-50"
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
              <li className="mt-3 border-t border-white/10 pt-4">
                <MobileAuthLinks isAuthenticated={isAuthenticated} onNavigate={() => setOpen(false)} />
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
      <div className="flex flex-col gap-2">
        {MOBILE_ACCOUNT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="block rounded-3xl px-4 py-3 text-base font-medium text-sand-200 transition-colors hover:bg-white/10 hover:text-sand-50"
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring mt-2 rounded-3xl bg-rose-700/10 px-4 py-3 text-left text-base font-medium text-rose-200 transition-colors hover:bg-rose-700/20 hover:text-rose-100"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-1">
      <Button href="/login" variant="outline" className="w-full justify-center text-sand-100 hover:bg-white/10" onClick={onNavigate}>
        Login
      </Button>
      <Button href="/signup" variant="primary" className="w-full justify-center" onClick={onNavigate}>
        Sign Up
      </Button>
    </div>
  );
}
