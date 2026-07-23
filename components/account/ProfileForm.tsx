"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileSchema } from "@/lib/validation";
import type { DesignStyle } from "@/lib/types";
import { STYLE_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-medium text-foreground";
const fieldClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-base px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus-ring";
const errorClass = "mt-1.5 text-sm text-red-600";

export function ProfileForm() {
  const { customer, updateProfile } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
      country: customer?.country ?? "",
      address: customer?.address ?? "",
      preferredStyle: customer?.preferredStyle ?? "",
      preferredContactTime: customer?.preferredContactTime ?? "",
    },
  });

  const onSubmit = async (data: ProfileSchema) => {
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        address: data.address,
        preferredStyle: data.preferredStyle
          ? (data.preferredStyle as DesignStyle)
          : undefined,
        preferredContactTime: data.preferredContactTime,
      });
      toast("Profile updated.", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not update your profile.",
        "error"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Full name
          </label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className={fieldClass}
            {...register("name")}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            className={fieldClass}
            {...register("phone")}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-style" className={labelClass}>
            Preferred style <span className="text-muted-foreground/80">(optional)</span>
          </label>
          <select
            id="profile-style"
            aria-invalid={!!errors.preferredStyle}
            className={fieldClass}
            {...register("preferredStyle")}
          >
            <option value="">No preference</option>
            {STYLE_OPTIONS.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          {errors.preferredStyle && (
            <p className={errorClass}>{errors.preferredStyle.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-city" className={labelClass}>
            City <span className="text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="profile-city"
            type="text"
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            className={fieldClass}
            {...register("city")}
          />
          {errors.city && <p className={errorClass}>{errors.city.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-state" className={labelClass}>
            State / region <span className="text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="profile-state"
            type="text"
            autoComplete="address-level1"
            aria-invalid={!!errors.state}
            className={fieldClass}
            {...register("state")}
          />
          {errors.state && <p className={errorClass}>{errors.state.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-country" className={labelClass}>
            Country <span className="text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="profile-country"
            type="text"
            autoComplete="country-name"
            aria-invalid={!!errors.country}
            className={fieldClass}
            {...register("country")}
          />
          {errors.country && (
            <p className={errorClass}>{errors.country.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-contact-time" className={labelClass}>
            Preferred contact time{" "}
            <span className="text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="profile-contact-time"
            type="text"
            placeholder="e.g. Weekday mornings"
            aria-invalid={!!errors.preferredContactTime}
            className={fieldClass}
            {...register("preferredContactTime")}
          />
          {errors.preferredContactTime && (
            <p className={errorClass}>{errors.preferredContactTime.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="profile-address" className={labelClass}>
          Address <span className="text-muted-foreground/80">(optional)</span>
        </label>
        <textarea
          id="profile-address"
          rows={3}
          autoComplete="street-address"
          aria-invalid={!!errors.address}
          className={cn(fieldClass, "h-auto resize-y py-3")}
          {...register("address")}
        />
        {errors.address && (
          <p className={errorClass}>{errors.address.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-6">
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
