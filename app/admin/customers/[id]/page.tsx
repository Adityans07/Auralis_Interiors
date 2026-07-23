"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCustomerCard } from "@/components/admin/AdminCustomerCard";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { getAdminCustomerById } from "@/lib/services/adminService";
import type { AdminCustomerDetail } from "@/lib/types/admin";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminCustomerDetail | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    getAdminCustomerById(params.id).then((response) => setData(response.data));
  }, [params?.id]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading customer profile...</p>;
  }

  const customer = data.customer as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Customer ${String(customer.name ?? "")}`}
        description="Profile, usage summary, and linked history."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminCustomerCard
          customer={{
            name: String(customer.name ?? ""),
            email: String(customer.email ?? ""),
            phone: customer.phone ? String(customer.phone) : undefined,
            city: customer.city ? String(customer.city) : undefined,
            status: String(customer.status ?? "ACTIVE"),
          }}
        />

        <article className="rounded-2xl border border-white/10 bg-base p-5 lg:col-span-2">
          <h3 className="text-base font-semibold text-foreground">Usage Summary</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-void p-3">
              <p className="text-xs uppercase text-muted-foreground">Design Requests</p>
              <p className="text-lg font-semibold text-foreground">{data.designRequests.length}</p>
            </div>
            <div className="rounded-xl bg-void p-3">
              <p className="text-xs uppercase text-muted-foreground">Bookings</p>
              <p className="text-lg font-semibold text-foreground">{data.bookings.length}</p>
            </div>
            <div className="rounded-xl bg-void p-3">
              <p className="text-xs uppercase text-muted-foreground">Payments</p>
              <p className="text-lg font-semibold text-foreground">{data.payments.length}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminNotesPanel notes={data.notes} />
        <AdminActivityTimeline
          events={[
            ...data.designRequests.map((item) => ({
              id: String(item.id),
              label: `Design request ${String(item.id).slice(0, 8)} · ${String(item.status ?? "")}`,
              createdAt: String(item.createdAt ?? new Date().toISOString()),
            })),
            ...data.bookings.map((item) => ({
              id: `booking-${String(item.id)}`,
              label: `Booking ${String(item.id).slice(0, 8)} · ${String(item.status ?? "")}`,
              createdAt: String(item.createdAt ?? new Date().toISOString()),
            })),
            ...data.payments.map((item) => ({
              id: `payment-${String(item.id)}`,
              label: `Payment ${String(item.id).slice(0, 8)} · ${String(item.status ?? "")}`,
              createdAt: String(item.createdAt ?? new Date().toISOString()),
            })),
          ]}
        />
      </section>
    </div>
  );
}
