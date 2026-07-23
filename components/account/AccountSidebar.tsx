"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LayoutGrid,
  CalendarDays,
  CreditCard,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { ACCOUNT_NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

/** Map the icon string names from ACCOUNT_NAV_LINKS to lucide components. */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  LayoutGrid,
  CalendarDays,
  CreditCard,
  User,
  Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Desktop vertical nav */}
      <nav
        aria-label="Account navigation"
        className="hidden md:flex md:flex-col md:gap-1"
      >
        {ACCOUNT_NAV_LINKS.map((link) => {
          const Icon = ICONS[link.icon] ?? LayoutDashboard;
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-white/10/5 hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {link.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="focus-ring mt-2 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden />
          Log out
        </button>
      </nav>

      {/* Mobile horizontally-scrollable tab bar */}
      <nav
        aria-label="Account navigation"
        className="md:hidden -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1"
      >
        {ACCOUNT_NAV_LINKS.map((link) => {
          const Icon = ICONS[link.icon] ?? LayoutDashboard;
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-white/20 bg-white/10 text-foreground"
                  : "border-white/10 bg-base text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="focus-ring flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-base px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-red-200 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </nav>
    </>
  );
}
