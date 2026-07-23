"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCustomerCard } from "@/components/admin/AdminCustomerCard";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { getAdminCustomerById, updateCustomerUsage } from "@/lib/services/adminService";
import type { AdminCustomerDetail } from "@/lib/types/admin";

function UsageManagementCard({
  customerId,
  usage,
  onUpdate,
}: {
  customerId: string;
  usage: { freeGenerationUsed: boolean; bonusFreeGenerations: number; totalGenerations: number; paidGenerations: number };
  onUpdate: () => void;
}) {
  const [grantAmount, setGrantAmount] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handle = async (action: "reset" | "grant") => {
    setLoading(action);
    setMessage(null);
    try {
      await updateCustomerUsage(customerId, action, action === "grant" ? grantAmount : undefined);
      setMessage({ type: "success", text: action === "reset" ? "Free generation reset successfully." : `Granted ${grantAmount} bonus generation(s).` });
      onUpdate();
    } catch {
      setMessage({ type: "error", text: "Failed to update. Please try again." });
    } finally {
      setLoading(null);
    }
  };

  const freeUsed = usage.freeGenerationUsed;
  const bonus = usage.bonusFreeGenerations;
  const canGenerate = !freeUsed || bonus > 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-base p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Free Generation Management</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            canGenerate
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${canGenerate ? "bg-emerald-400" : "bg-red-400"}`} />
          {canGenerate ? "Can Generate" : "Exhausted"}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-void p-3">
          <p className="text-xs uppercase text-muted-foreground">Free Gen Used</p>
          <p className={`mt-1 text-lg font-semibold ${freeUsed ? "text-red-400" : "text-emerald-400"}`}>
            {freeUsed ? "Yes" : "No"}
          </p>
        </div>
        <div className="rounded-xl bg-void p-3">
          <p className="text-xs uppercase text-muted-foreground">Bonus Remaining</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{bonus}</p>
        </div>
        <div className="rounded-xl bg-void p-3">
          <p className="text-xs uppercase text-muted-foreground">Total Generations</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{usage.totalGenerations}</p>
        </div>
        <div className="rounded-xl bg-void p-3">
          <p className="text-xs uppercase text-muted-foreground">Paid Generations</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{usage.paidGenerations}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-white/8 pt-4 space-y-3">
        {/* Reset */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Reset Free Generation</p>
            <p className="text-xs text-muted-foreground">Clears free_generation_used and any remaining bonus.</p>
          </div>
          <button
            onClick={() => handle("reset")}
            disabled={loading !== null}
            className="shrink-0 rounded-lg border border-white/10 bg-void px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5 disabled:opacity-50"
          >
            {loading === "reset" ? "Resetting…" : "Reset"}
          </button>
        </div>

        {/* Grant */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Grant Bonus Generations</p>
            <p className="text-xs text-muted-foreground">Customer can generate this many times without paying.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={1}
              max={20}
              value={grantAmount}
              onChange={(e) => setGrantAmount(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-16 rounded-lg border border-white/10 bg-void px-2 py-2 text-center text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-dark"
            />
            <button
              onClick={() => handle("grant")}
              disabled={loading !== null}
              className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loading === "grant" ? "Granting…" : "Grant"}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </article>
  );
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminCustomerDetail | null>(null);

  const load = () => {
    if (!params?.id) return;
    getAdminCustomerById(params.id).then((response) => setData(response.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading customer profile…</p>;
  }

  const customer = data.customer;
  const usage = customer.usage ?? {
    freeGenerationUsed: false,
    bonusFreeGenerations: 0,
    totalGenerations: 0,
    paidGenerations: 0,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Customer — ${customer.name ?? ""}`}
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
          <h3 className="text-base font-semibold text-foreground">Activity Summary</h3>
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

      {/* Free Generation Management */}
      <UsageManagementCard
        customerId={String(customer.id ?? params.id)}
        usage={usage}
        onUpdate={load}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminNotesPanel notes={data.notes} />
        <AdminActivityTimeline
          events={[
            ...data.designRequests.map((item) => ({
              id: item.id,
              label: `Design request ${item.id.slice(0, 8)} · ${item.status}`,
              createdAt: item.createdAt,
            })),
            ...data.bookings.map((item) => ({
              id: `booking-${item.id}`,
              label: `Booking ${item.id.slice(0, 8)} · ${item.status}`,
              createdAt: item.createdAt,
            })),
            ...data.payments.map((item) => ({
              id: `payment-${item.id}`,
              label: `Payment ${item.id.slice(0, 8)} · ${item.status}`,
              createdAt: item.createdAt,
            })),
          ]}
        />
      </section>
    </div>
  );
}
