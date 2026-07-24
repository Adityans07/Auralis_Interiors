"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Design Requests", href: "/admin/design-requests" },
  { label: "Generated Designs", href: "/admin/generated-designs" },
  { label: "Selected Designs", href: "/admin/selected-designs" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Vendors", href: "/admin/vendors" },
  { label: "Blogs", href: "/admin/blogs" },
  { label: "Contact Messages", href: "/admin/contact-messages" },
  { label: "Payments", href: "/admin/payments" },
  { label: "AI Logs", href: "/admin/ai-logs" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Team", href: "/admin/team" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full rounded-2xl border border-white/10 bg-base p-3">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Admin Portal</p>
      <nav className="space-y-1">
        {ADMIN_NAV_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition-colors",
                active ? "bg-base/10 text-foreground" : "text-muted-foreground hover:bg-base/10 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
