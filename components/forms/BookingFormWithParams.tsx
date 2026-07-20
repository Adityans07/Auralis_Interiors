"use client";

import { useSearchParams } from "next/navigation";
import { BookingForm } from "./BookingForm";

/**
 * Client wrapper that reads the optional `?design=` search param and prefills
 * the booking form's design reference. Must be rendered inside a <Suspense>
 * boundary (required by Next 14 for useSearchParams).
 */
export function BookingFormWithParams() {
  const searchParams = useSearchParams();
  const design = searchParams.get("design") ?? undefined;

  return <BookingForm defaultReference={design} />;
}
