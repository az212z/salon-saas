import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==============================
// Supabase Server Client (for Server Components & Actions)
// ==============================
export async function createClient() {
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
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above
          }
        },
      },
    }
  );
}

// ==============================
// Middleware — Multi-Tenant Subdomain Resolution
// ==============================
export async function updateSession(request: NextRequest) {
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
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '');
          supabaseResponse = NextResponse.next({
            request,
          });
          supabaseResponse.cookies.set(name, '', options);
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // Resolve tenant from subdomain
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saloni.sa';

  // Extract subdomain (e.g., "luxe-beauty" from "luxe-beauty.saloni.sa")
  const subdomain = hostname.replace(`.${rootDomain}`, '').replace('www.', '');

  // Store tenant slug in headers for downstream use
  if (subdomain && subdomain !== hostname && subdomain !== 'app' && subdomain !== 'admin') {
    request.headers.set('x-tenant-slug', subdomain);
  }

  // Protect admin/app routes
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Protect salon admin routes
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Protect staff routes
  if (url.pathname.startsWith('/staff')) {
    if (!user) {
      url.pathname = '/staff/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}