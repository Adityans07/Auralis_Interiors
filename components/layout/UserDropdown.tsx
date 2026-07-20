"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LayoutGrid,
  CalendarDays,
  CreditCard,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

const MENU = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "My Designs", href: "/account/designs", icon: LayoutGrid },
  { label: "Bookings", href: "/account/bookings", icon: CalendarDays },
  { label: "Billing", href: "/account/billing", icon: CreditCard },
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserDropdown() {
  const { customer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!customer) return null;

  const onLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus-ring flex items-center gap-2 rounded-full border border-sand-200 bg-white/70 py-1 pl-1 pr-3 transition-colors hover:border-ink-900/30"
      >
        {customer.avatarUrl ? (
          <Image
            src={customer.avatarUrl}
            alt={customer.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-gold-light">
            {initials(customer.name)}
          </span>
        )}
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-ink-800 sm:block">
          {customer.name.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-ink-400 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="menu"
            className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft"
          >
            <div className="border-b border-sand-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-ink-900">
                {customer.name}
              </p>
              <p className="truncate text-xs text-ink-500">{customer.email}</p>
            </div>
            <ul className="py-1">
              {MENU.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-sand-100"
                  >
                    <Icon className="h-4 w-4 text-ink-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-sand-200 py-1">
              <button
                type="button"
                onClick={onLogout}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
