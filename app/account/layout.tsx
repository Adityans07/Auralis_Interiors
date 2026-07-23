"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-luxury-radial">
        <div className="container-wide py-10 md:py-16">
          <div className="grid gap-8 md:grid-cols-[220px_1fr] lg:gap-12">
            {/* Sidebar (desktop) / tab bar (mobile) */}
            <aside className="md:sticky md:top-24 md:self-start">
              <div className="rounded-3xl border border-white/10 bg-base/5 p-3 shadow-glow md:p-4">
                <AccountSidebar />
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
