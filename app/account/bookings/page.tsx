"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import type { CustomerBooking } from "@/lib/types";
import { accountService } from "@/lib/services/account";
import { AccountHeader } from "@/components/account/AccountHeader";
import { BookingHistoryCard } from "@/components/account/BookingHistoryCard";
import { Button } from "@/components/ui/Button";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    accountService
      .getMyBookings()
      .then((res) => {
        if (active) setBookings(res.data);
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
      <AccountHeader
        title="Bookings"
        description="Your consultation requests and their status."
      />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-3xl border border-white/10 bg-base/5 shadow-glow">
          <Loader2 className="h-6 w-6 animate-spin text-gold-dark" aria-hidden />
          <span className="sr-only">Loading your bookings…</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-base/5 p-12 text-center shadow-glow">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
            <CalendarDays className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-xl font-semibold text-foreground">
            You have no bookings yet.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Book a consultation with our design team to talk through your space.
          </p>
          <div className="mt-6">
            <Button href="/booking">Book a consultation</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <BookingHistoryCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
