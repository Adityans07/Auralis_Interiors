"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ADMIN_NAV_LINKS, AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, customer } = useAuth();

  useEffect(() => {
    const onLoginPage = pathname === "/admin/login";
    if (status === "unauthenticated" && !onLoginPage) {
      router.replace("/admin/login");
      return;
    }
    if (status === "authenticated" && customer?.role !== "ADMIN" && !onLoginPage) {
      router.replace("/");
      return;
    }
    if (status === "authenticated" && customer?.role === "ADMIN" && onLoginPage) {
      router.replace("/admin");
    }
  }, [status, customer, pathname, router]);

  const onLoginPage = pathname === "/admin/login";
  if (onLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-dark" />
      </div>
    );
  }

  if (status !== "authenticated" || customer?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto grid max-w-[1500px] gap-4 p-4 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="min-w-0">
          <AdminTopbar />
          <div className="mb-4 overflow-x-auto lg:hidden">
            <div className="flex gap-2">
              {ADMIN_NAV_LINKS.map((link) => {
                const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs",
                      active ? "border-white/20 bg-base/10 text-foreground" : "border-white/10 bg-base text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
