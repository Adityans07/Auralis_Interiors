import { CalendarDays, Clock, MapPin, Tag } from "lucide-react";
import type { BookingStatus, CustomerBooking } from "@/lib/types";
import { cn, formatDate, humanize } from "@/lib/utils";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface BookingHistoryCardProps {
  booking: CustomerBooking;
}

export function BookingHistoryCard({ booking }: BookingHistoryCardProps) {
  const status = STATUS_CONFIG[booking.status];

  return (
    <article className="rounded-3xl border border-sand-200 bg-white/80 p-5 shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-400">
            {booking.id}
          </p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-ink-900">
            {booking.projectType === "consultation"
              ? "Design Consultation"
              : `${humanize(booking.projectType)} Project`}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-ink-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
          <dt className="sr-only">Date</dt>
          <dd>{formatDate(booking.preferredDate)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-400" aria-hidden />
          <dt className="sr-only">Time</dt>
          <dd>{booking.preferredTime}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-ink-400" aria-hidden />
          <dt className="sr-only">Location</dt>
          <dd>{booking.location}</dd>
        </div>
        {booking.designReference && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-ink-400" aria-hidden />
            <dt className="sr-only">Design reference</dt>
            <dd className="truncate">{booking.designReference}</dd>
          </div>
        )}
      </dl>

      {booking.message && (
        <p className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-500">
          {booking.message}
        </p>
      )}
    </article>
  );
}
