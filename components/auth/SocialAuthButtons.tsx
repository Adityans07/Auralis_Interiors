"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.37 12.78c.02 2.5 2.2 3.33 2.22 3.34-.02.06-.35 1.2-1.15 2.37-.69 1.02-1.41 2.03-2.55 2.05-1.11.02-1.47-.66-2.75-.66-1.28 0-1.68.64-2.73.68-1.09.04-1.93-1.1-2.63-2.11-1.43-2.08-2.53-5.88-1.06-8.44a4.1 4.1 0 0 1 3.45-2.1c1.07-.02 2.08.72 2.74.72.65 0 1.88-.89 3.17-.76.54.02 2.06.22 3.03 1.64-.08.05-1.81 1.06-1.79 3.17M14.28 4.6c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.47 1.26-.54.63-1.02 1.63-.89 2.59.94.07 1.9-.47 2.49-1.18" />
    </svg>
  );
}

/**
 * Placeholder social auth buttons (Google / Apple), shared by the login and
 * signup forms. No real OAuth — clicking shows an info toast. The backend will
 * wire these to real providers later.
 */
export function SocialAuthButtons({ verb = "Continue" }: { verb?: string }) {
  const { toast } = useToast();
  const onSocial = () =>
    toast("Social sign-in is a placeholder in this demo.", "info");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground/80">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-3">
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={onSocial}>
          <GoogleGlyph />
          {verb} with Google
        </Button>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={onSocial}>
          <AppleGlyph />
          {verb} with Apple
        </Button>
      </div>
    </div>
  );
}
