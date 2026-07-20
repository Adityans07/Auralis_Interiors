import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminBookingCard({
  booking,
}: {
  booking: {
    id: string;
    name: string;
    email: string;
    phone: string;
    projectType: string;
    preferredDate: string;
    preferredTime: string;
    city: string;
    status: string;
  };
}) {
  return (
    <article className="rounded-2xl border border-sand-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Booking {booking.id.slice(0, 8)}</h3>
          <p className="text-sm text-ink-500">{booking.projectType}</p>
        </div>
        <AdminStatusBadge status={booking.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-700">
        <div>
          <dt className="text-xs uppercase text-ink-500">Name</dt>
          <dd>{booking.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ink-500">Email</dt>
          <dd>{booking.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ink-500">Phone</dt>
          <dd>{booking.phone}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ink-500">City</dt>
          <dd>{booking.city}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ink-500">Date</dt>
          <dd>{new Date(booking.preferredDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ink-500">Time</dt>
          <dd>{booking.preferredTime}</dd>
        </div>
      </dl>
    </article>
  );
}
