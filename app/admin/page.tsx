"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { getAdminDashboard } from "@/lib/services/adminService";
import type { AdminDashboardResponse } from "@/lib/types/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAdminDashboard()
      .then((response) => {
        if (mounted) setData(response.data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-dark" />
      </div>
    );
  }

  if (!data) {
    return <AdminEmptyState title="Dashboard unavailable" message="Could not load analytics right now." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Business Overview"
        description="Live stats for requests, leads, bookings, and AI health."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Design Requests" value={data.stats.totalDesignRequests} />
        <AdminStatCard label="New Requests Today" value={data.stats.newDesignRequestsToday} />
        <AdminStatCard label="Completed AI Generations" value={data.stats.completedAiGenerations} />
        <AdminStatCard label="Failed AI Generations" value={data.stats.failedAiGenerations} />
        <AdminStatCard label="Selected Designs" value={data.stats.selectedDesigns} />
        <AdminStatCard label="Pending Bookings" value={data.stats.pendingBookings} />
        <AdminStatCard label="Confirmed Bookings" value={data.stats.confirmedBookings} />
        <AdminStatCard label="Unread Contact Messages" value={data.stats.contactMessagesUnread} />
        <AdminStatCard label="Total Customers" value={data.stats.totalCustomers} />
        <AdminStatCard label="Paid Generations" value={data.stats.paidGenerations} />
        <AdminStatCard label="Estimated Revenue" value={`$${Math.round(data.stats.estimatedRevenue).toLocaleString()}`} />
        <AdminStatCard label="Request to Lead Conversion" value={`${data.stats.conversionRate}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-sand-200 bg-white p-5">
          <h3 className="text-base font-semibold text-ink-900">Recent Design Requests</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            {data.recent.designRequests.slice(0, 6).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <span>{item.customerName}</span>
                <Link className="text-gold-dark hover:text-ink-900" href={`/admin/design-requests/${item.id}`}>
                  {item.status}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-sand-200 bg-white p-5">
          <h3 className="text-base font-semibold text-ink-900">Recent Failed AI Generations</h3>
          {data.recent.failedAiGenerations.length ? (
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {data.recent.failedAiGenerations.slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-xl bg-red-50 px-3 py-2 text-red-700">
                  <p className="font-medium">{item.designRequestId}</p>
                  <p className="text-xs">{item.errorCode ?? "UNKNOWN_ERROR"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-500">No recent failures.</p>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-sand-200 bg-white p-5">
        <h3 className="text-base font-semibold text-ink-900">Quick Actions</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/products/new" className="rounded-xl border border-sand-200 px-3 py-2 hover:bg-sand-50">
            Add Product
          </Link>
          <Link href="/admin/blogs/new" className="rounded-xl border border-sand-200 px-3 py-2 hover:bg-sand-50">
            Create Blog Post
          </Link>
          <Link href="/admin/bookings" className="rounded-xl border border-sand-200 px-3 py-2 hover:bg-sand-50">
            View Pending Bookings
          </Link>
          <Link href="/admin/selected-designs" className="rounded-xl border border-sand-200 px-3 py-2 hover:bg-sand-50">
            View New Leads
          </Link>
        </div>
      </section>
    </div>
  );
}
