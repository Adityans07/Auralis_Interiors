"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { bookingSchema, type BookingSchema } from "@/lib/validation";
import { submitBooking } from "@/lib/services/api";
import { BUDGET_RANGES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-medium text-ink-800";
const fieldClass =
  "h-11 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus-ring";
const errorClass = "mt-1.5 text-sm text-red-600";

interface BookingFormProps {
  defaultReference?: string;
}

export function BookingForm({ defaultReference }: BookingFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    bookingId: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingSchema>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      designReference: defaultReference ?? "",
    },
  });

  const onSubmit = async (data: BookingSchema) => {
    setSubmitError(null);
    try {
      const res = await submitBooking(data);
      if (!res.success) throw new Error(res.message ?? "Something went wrong.");
      setConfirmation({
        message:
          "Your consultation request has been received. Our team will contact you shortly.",
        bookingId: res.data.bookingId,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your request. Please try again."
      );
    }
  };

  const bookAnother = () => {
    setConfirmation(null);
    setSubmitError(null);
    reset({ designReference: defaultReference ?? "" });
  };

  if (confirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-soft"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CalendarCheck className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-ink-900">
          Consultation requested
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {confirmation.message}
        </p>
        <p className="mt-4 inline-block rounded-full border border-sand-200 bg-white px-4 py-2 text-sm text-ink-700">
          Booking reference:{" "}
          <span className="font-semibold text-ink-900">
            {confirmation.bookingId}
          </span>
        </p>
        <div className="mt-6">
          <Button variant="outline" onClick={bookAnother}>
            Book another
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className={labelClass}>
            Full name
          </label>
          <input
            id="booking-name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={!!errors.name}
            className={fieldClass}
            {...register("name")}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="booking-email" className={labelClass}>
            Email
          </label>
          <input
            id="booking-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            aria-invalid={!!errors.email}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="booking-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="booking-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (415) 555-0142"
            aria-invalid={!!errors.phone}
            className={fieldClass}
            {...register("phone")}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="booking-projectType" className={labelClass}>
            Project type
          </label>
          <select
            id="booking-projectType"
            defaultValue=""
            aria-invalid={!!errors.projectType}
            className={fieldClass}
            {...register("projectType")}
          >
            <option value="" disabled>
              Select a project type
            </option>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="consultation">General Consultation</option>
          </select>
          {errors.projectType && (
            <p className={errorClass}>{errors.projectType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-date" className={labelClass}>
            Preferred date
          </label>
          <input
            id="booking-date"
            type="date"
            aria-invalid={!!errors.preferredDate}
            className={fieldClass}
            {...register("preferredDate")}
          />
          {errors.preferredDate && (
            <p className={errorClass}>{errors.preferredDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-time" className={labelClass}>
            Preferred time
          </label>
          <input
            id="booking-time"
            type="time"
            aria-invalid={!!errors.preferredTime}
            className={fieldClass}
            {...register("preferredTime")}
          />
          {errors.preferredTime && (
            <p className={errorClass}>{errors.preferredTime.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-location" className={labelClass}>
            City / location
          </label>
          <input
            id="booking-location"
            type="text"
            autoComplete="address-level2"
            placeholder="San Francisco, CA"
            aria-invalid={!!errors.location}
            className={fieldClass}
            {...register("location")}
          />
          {errors.location && (
            <p className={errorClass}>{errors.location.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="booking-budget" className={labelClass}>
            Budget range
          </label>
          <select
            id="booking-budget"
            defaultValue=""
            aria-invalid={!!errors.budgetRange}
            className={fieldClass}
            {...register("budgetRange")}
          >
            <option value="" disabled>
              Select a budget range
            </option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          {errors.budgetRange && (
            <p className={errorClass}>{errors.budgetRange.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="booking-reference" className={labelClass}>
          Design reference <span className="text-ink-400">(optional)</span>
        </label>
        <input
          id="booking-reference"
          type="text"
          placeholder="e.g. a saved design ID or concept name"
          aria-invalid={!!errors.designReference}
          className={fieldClass}
          {...register("designReference")}
        />
        {errors.designReference && (
          <p className={errorClass}>{errors.designReference.message}</p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="booking-message" className={labelClass}>
          Anything else? <span className="text-ink-400">(optional)</span>
        </label>
        <textarea
          id="booking-message"
          rows={4}
          placeholder="Share goals, timelines, or details you'd like us to know…"
          aria-invalid={!!errors.message}
          className={cn(fieldClass, "h-auto resize-y py-3")}
          {...register("message")}
        />
        {errors.message && (
          <p className={errorClass}>{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-6 w-full"
      >
        {isSubmitting ? "Sending…" : "Request consultation"}
      </Button>
    </form>
  );
}
