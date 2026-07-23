import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminCustomerCard({
  customer,
}: {
  customer: { name?: string; email?: string; phone?: string; status?: string; city?: string };
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-base p-5">
      <h3 className="text-base font-semibold text-foreground">Customer</h3>
      <div className="mt-3 space-y-1 text-sm text-foreground/90">
        <p>{customer.name ?? "Unknown"}</p>
        <p>{customer.email ?? "No email"}</p>
        <p>{customer.phone ?? "No phone"}</p>
        <p>{customer.city ?? "No location"}</p>
      </div>
      <div className="mt-3">{customer.status ? <AdminStatusBadge status={customer.status} /> : null}</div>
    </article>
  );
}
