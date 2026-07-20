"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactSchema } from "@/lib/validation";
import { submitContact } from "@/lib/services/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-medium text-ink-800";
const fieldClass =
  "h-11 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus-ring";
const errorClass = "mt-1.5 text-sm text-red-600";

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactSchema) => {
    setSubmitError(null);
    try {
      const res = await submitContact(data);
      if (!res.success) throw new Error(res.message ?? "Something went wrong.");
      setSuccessMessage(res.message ?? "Thanks for reaching out. We'll reply shortly.");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again."
      );
    }
  };

  const sendAnother = () => {
    setSuccessMessage(null);
    setSubmitError(null);
    reset();
  };

  if (successMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-soft"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-ink-900">
          Message sent
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {successMessage}
        </p>
        <Button variant="outline" className="mt-6" onClick={sendAnother}>
          Send another
        </Button>
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
          <label htmlFor="contact-name" className={labelClass}>
            Full name
          </label>
          <input
            id="contact-name"
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
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
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
          <label htmlFor="contact-phone" className={labelClass}>
            Phone <span className="text-ink-400">(optional)</span>
          </label>
          <input
            id="contact-phone"
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
          <label htmlFor="contact-subject" className={labelClass}>
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            placeholder="How can we help?"
            aria-invalid={!!errors.subject}
            className={fieldClass}
            {...register("subject")}
          />
          {errors.subject && (
            <p className={errorClass}>{errors.subject.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us about your space and what you have in mind…"
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
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
