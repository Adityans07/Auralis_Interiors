"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/design-requests": "Design Requests",
  "/admin/generated-designs": "Generated Designs",
  "/admin/selected-designs": "Selected Designs / Leads",
  "/admin/bookings": "Bookings",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/blogs": "Blogs",
  "/admin/contact-messages": "Contact Messages",
  "/admin/payments": "Payments",
  "/admin/ai-logs": "AI Logs",
  "/admin/settings": "Settings",
  "/admin/team": "Team",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useAuth();
  const title = Object.entries(TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 mb-5 rounded-2xl border border-sand-200 bg-white/90 p-3 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-500">Admin</p>
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="h-9 rounded-xl border border-sand-200 bg-white pl-8 pr-2 text-sm text-ink-800 focus-ring"
              placeholder="Search"
            />
          </label>
          <span className="hidden text-sm text-ink-600 md:inline">{customer?.email}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
