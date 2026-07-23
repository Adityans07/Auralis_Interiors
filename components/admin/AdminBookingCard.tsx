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
    <article className="rounded-2xl border border-white/10 bg-base p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Booking {booking.id.slice(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">{booking.projectType}</p>
        </div>
        <AdminStatusBadge status={booking.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-foreground/90">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Name</dt>
          <dd>{booking.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Email</dt>
          <dd>{booking.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Phone</dt>
          <dd>{booking.phone}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">City</dt>
          <dd>{booking.city}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Date</dt>
          <dd>{new Date(booking.preferredDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Time</dt>
          <dd>{booking.preferredTime}</dd>
        </div>
      </dl>
    </article>
  );
}
