import { NextResponse } from "next/server";

/**
 * Render owns the HttpOnly authentication cookie, while this middleware runs
 * on the Vercel domain.  A Vercel request cannot access or forward Render's
 * cookie, so server-side checks here always reject a valid cross-site login.
 *
 * AdminLayout verifies /api/auth/me in the browser (where the Render cookie is
 * correctly included), and every /api/admin endpoint independently enforces
 * `require_admin` on the backend.  Keeping this middleware as a pass-through
 * avoids an invalid redirect loop without weakening API authorization.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
