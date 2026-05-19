import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize Server-Side Supabase Client for Edge Routing
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  // 2. Extrapolate active session identity
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Security Guardrails: Protect all /dashboard paths
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // No valid session token found -> Hard boot back to root landing page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Reverse Guardrail: Prevent authenticated users from getting trapped on the landing/login view
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

// Ensure the middleware strictly runs on dashboard and login vectors only
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};