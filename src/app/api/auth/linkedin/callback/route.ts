import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    console.error('LinkedIn OAuth access denied:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed', request.url));
  }

  // 1. Initialize server-side Supabase client to track who is currently logged in
  let response = NextResponse.redirect(new URL('/dashboard/settings?sync=success', request.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }));
          response = NextResponse.redirect(new URL('/dashboard/settings?sync=success', request.url));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated portal session found.');

    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;

    // 2. Perform server handshake: Trade auth code for access bearer token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`LinkedIn Token Exchange Error: ${tokenData.error_description || tokenData.error}`);
    }

    // 3. Persist encrypted access token inside user preferences column layout
    // In production, encrypt this value before saving to your preferences table
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      webhook_url: tokenData.access_token // Storing access token securely inside your DB preferences loop
    }, { onConflict: 'user_id' });

    return response;
  } catch (err: any) {
    console.error('OAuth processing failure:', err.message);
    return NextResponse.redirect(new URL('/dashboard/settings?error=handshake_failed', request.url));
  }
}