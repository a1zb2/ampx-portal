import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
  
  // Scopes required to view profile and publish articles/posts natively
  const scope = 'openid profile w_member_social email';
  const state = 'ampx_secure_state_string_random'; // In production, generate dynamically per user

  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(linkedinAuthUrl);
}