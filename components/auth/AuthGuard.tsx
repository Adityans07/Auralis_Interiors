"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { setRedirectIntent } from "@/lib/services/redirect";
import { Button } from "@/components/ui/Button";

/**
 * MOCK route guard for account pages. If there is no mock session, it stores
 * the intended path and redirects to /login. While loading or redirecting it
 * renders a friendly fallback (never the protected content).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      setRedirectIntent(pathname);
      router.replace("/login");
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-dark" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Fallback shown momentarily while redirecting (also works if JS-nav fails).
    return (
      <div className="container-wide flex min-h-[60vh] items-center justify-center py-20">
        <div className="glass max-w-md rounded-4xl p-10 text-center shadow-glow">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-foreground">
            Login required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in to view your account. We&apos;ll bring you right back
            here.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button href="/login" className="justify-center">
              Log In
            </Button>
            <Button href="/signup" variant="outline" className="justify-center">
              Create Account
            </Button>
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted-foreground/80 hover:text-foreground/90"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
