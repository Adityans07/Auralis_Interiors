"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

/** Password field with a show/hide visibility toggle. RHF-compatible (forwardRef). */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ id, label, error, className, ...props }, ref) {
    const [show, setShow] = React.useState(false);
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
          <input
            id={id}
            ref={ref}
            type={show ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "h-12 w-full rounded-2xl border border-white/10 bg-base pl-10 pr-11 text-sm text-foreground focus-ring",
              error && "border-red-300",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground/80 hover:text-foreground/90"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
