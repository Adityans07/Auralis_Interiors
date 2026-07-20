"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary (App Router). Rendered when a segment throws
 * during render. `reset()` retries rendering the segment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd report to an error service.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container-wide flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-8 text-2xl font-semibold text-ink-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-ink-500">
        We hit an unexpected error while loading this page. You can try again, or
        head back home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} className="justify-center">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Button href="/" variant="outline" className="justify-center">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
