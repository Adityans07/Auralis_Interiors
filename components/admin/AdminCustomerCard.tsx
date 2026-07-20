import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminCustomerCard({
  customer,
}: {
  customer: { name?: string; email?: string; phone?: string; status?: string; city?: string };
}) {
  return (
    <article className="rounded-2xl border border-sand-200 bg-white p-5">
      <h3 className="text-base font-semibold text-ink-900">Customer</h3>
      <div className="mt-3 space-y-1 text-sm text-ink-700">
        <p>{customer.name ?? "Unknown"}</p>
        <p>{customer.email ?? "No email"}</p>
        <p>{customer.phone ?? "No phone"}</p>
        <p>{customer.city ?? "No location"}</p>
      </div>
      <div className="mt-3">{customer.status ? <AdminStatusBadge status={customer.status} /> : null}</div>
    </article>
  );
}
