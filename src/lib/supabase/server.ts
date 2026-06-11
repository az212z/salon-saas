import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function valueLooksConfigured(value: string | undefined, blocked: string[]) {
  if (!value) return false;
  return !blocked.some((item) => value.includes(item));
}

export function isSupabaseConfigured() {
  return (
    valueLooksConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL, ["example.supabase.co", "your-project", "localhost"]) &&
    valueLooksConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ["dummy", "your-anon-key"])
  );
}

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Demo pages remain available without database access.");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components cannot write cookies directly.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Components cannot write cookies directly.
          }
        },
      },
    }
  );
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value);
          supabaseResponse = NextResponse.next({ request });
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, "");
          supabaseResponse = NextResponse.next({ request });
          supabaseResponse.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saloni.sa";
  const subdomain = hostname.replace(`.${rootDomain}`, "").replace("www.", "");

  if (subdomain && subdomain !== hostname && subdomain !== "app" && subdomain !== "admin") {
    request.headers.set("x-tenant-slug", subdomain);
  }

  if ((url.pathname.startsWith("/app") || url.pathname.startsWith("/admin")) && !user) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/dashboard") && !user) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/staff") && !user) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
