import { NextRequest, NextResponse } from "next/server";

type AuthMeEnvelope = {
  success?: boolean;
  data?: {
    authenticated?: boolean;
    user?: {
      role?: string;
    } | null;
  };
};

function backendBaseUrl(): string {
  // const fallback = "http://localhost:8000";
  const fallback = "https://auralis-interiors.onrender.com";
  const raw = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? fallback;
  return raw.replace(/\/+$/, "");
}

function redirectToAdminLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  if (request.nextUrl.pathname !== "/admin") {
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("auralis_session")?.value ?? request.cookies.get("auralis_user_id")?.value;
  if (!sessionCookie) {
    return redirectToAdminLogin(request);
  }

  try {
    const response = await fetch(`${backendBaseUrl()}/api/auth/me`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return redirectToAdminLogin(request);
    }

    const payload = (await response.json()) as AuthMeEnvelope;
    const authenticated = Boolean(payload?.data?.authenticated);
    const isAdmin = payload?.data?.user?.role === "ADMIN";

    if (!authenticated) {
      return redirectToAdminLogin(request);
    }

    if (!isAdmin) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  } catch {
    return redirectToAdminLogin(request);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
