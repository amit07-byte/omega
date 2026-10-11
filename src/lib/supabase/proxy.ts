import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { destinationAfterAuth } from "@/lib/auth/onboarding";
import { publicEnv } from "@/lib/env";

const CACHE_HEADERS = ["cache-control", "expires", "pragma"] as const;

function copySession(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  for (const header of CACHE_HEADERS) {
    const value = from.headers.get(header);
    if (value) {
      to.headers.set(header, value);
    }
  }
  return to;
}

function redirectTo(request: NextRequest, session: NextResponse, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  return copySession(session, NextResponse.redirect(redirectUrl));
}

function isOnboardingRoute(pathname: string) {
  return pathname === "/business/onboarding" || pathname === "/creator/onboarding";
}

export async function updateSession(request: NextRequest) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims.sub);
  const pathname = request.nextUrl.pathname;
  const needsProfile = pathname.startsWith("/account") || isOnboardingRoute(pathname);

  if (!signedIn && needsProfile) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  if (signedIn && needsProfile) {
    const destination = await destinationAfterAuth(supabase);
    if (destination !== "/login" && pathname !== destination) {
      return redirectTo(request, supabaseResponse, destination);
    }
  }

  return supabaseResponse;
}
