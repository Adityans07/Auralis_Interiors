"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  LayoutGrid,
  Loader2,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { AccountOverview, RecentActivity } from "@/lib/types";
import { accountService } from "@/lib/services/account";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountStatCard } from "@/components/account/AccountStatCard";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const ACTIVITY_ICONS: Record<RecentActivity["type"], LucideIcon> = {
  design: LayoutGrid,
  booking: CalendarDays,
  payment: CreditCard,
  account: Star,
};

export default function AccountDashboardPage() {
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    accountService
      .getAccountOverview()
      .then((res) => {
        if (active) setOverview(res.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <AccountHeader />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-3xl border border-white/10 bg-base/5 shadow-glow">
          <Loader2 className="h-6 w-6 animate-spin text-gold-dark" aria-hidden />
          <span className="sr-only">Loading your dashboard…</span>
        </div>
      ) : !overview ? (
        <div className="rounded-3xl border border-white/10 bg-base/5 p-8 text-center shadow-glow">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your dashboard right now. Please try again
            later.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <AccountStatCard
              label="Free generation"
              value={overview.freeGenerationUsed ? "Used" : "Available"}
              icon={<Sparkles className="h-5 w-5" />}
              hint={
                overview.freeGenerationUsed
                  ? "$19 per additional design"
                  : "Your first design is free"
              }
            />
            <AccountStatCard
              label="Design requests"
              value={overview.totalDesignRequests}
              icon={<LayoutGrid className="h-5 w-5" />}
            />
            <AccountStatCard
              label="Saved designs"
              value={overview.savedDesigns}
              icon={<Star className="h-5 w-5" />}
            />
            <AccountStatCard
              label="Upcoming bookings"
              value={overview.upcomingBookings}
              icon={<CalendarDays className="h-5 w-5" />}
            />
          </div>

          {/* Selected design highlight */}
          {overview.selectedDesignTitle && (
            <div className="flex flex-col gap-4 rounded-3xl border border-gold/30 bg-gold/10 p-6 shadow-glow sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
                  <Star className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-gold-dark">
                    Selected design
                  </p>
                  <p className="mt-0.5 font-serif text-lg font-semibold text-foreground">
                    {overview.selectedDesignTitle}
                  </p>
                </div>
              </div>
              <Button href="/account/designs" variant="outline">
                View my designs
              </Button>
            </div>
          )}

          {/* Recent activity */}
          <section className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Recent activity
            </h2>
            {overview.recentActivity.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {overview.recentActivity.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] ?? Star;
                  return (
                    <li key={activity.id} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{activity.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <Link
                href="/account/designs"
                className="focus-ring rounded-full text-sm font-medium text-foreground/90 underline-offset-4 hover:text-foreground hover:underline"
              >
                My designs
              </Link>
              <Link
                href="/account/bookings"
                className="focus-ring rounded-full text-sm font-medium text-foreground/90 underline-offset-4 hover:text-foreground hover:underline"
              >
                Bookings
              </Link>
              <Link
                href="/account/billing"
                className="focus-ring rounded-full text-sm font-medium text-foreground/90 underline-offset-4 hover:text-foreground hover:underline"
              >
                Billing
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
