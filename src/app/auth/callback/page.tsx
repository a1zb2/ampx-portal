'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Shield, AlertTriangle } from 'lucide-react';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();

    // 1. Catch Format A: Implicit Hash (#access_token=...)
    // Supabase automatically parses this from the URL, we just need to listen for it.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        window.location.href = '/dashboard';
      }
    });

    // 2. Catch Format B: PKCE Query Parameter (?code=...)
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setErrorMsg(`Exchange Error: ${error.message}`);
      });
    }

    // 3. Fallback: If absolutely neither format is present, throw the error
    const timeoutId = setTimeout(() => {
      if (!code && !window.location.hash.includes('access_token')) {
        setErrorMsg('No secure token found in URL. The link may be broken, expired, or improperly copied.');
      }
    }, 2000);

    // Cleanup listeners
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="h-16 w-16 bg-black text-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
        {errorMsg ? <AlertTriangle className="h-8 w-8 text-red-500" /> : <Shield className="h-8 w-8 animate-pulse" />}
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 text-center">
        {errorMsg ? 'Authentication Failed' : 'Verifying Secure Tunnel...'}
      </h2>
      <p className="text-sm font-medium text-gray-500 max-w-md text-center">
        {errorMsg ? errorMsg : 'Decrypting credentials and bypassing the matrix.'}
      </p>
      {errorMsg && (
        <a href="/" className="mt-6 px-6 py-3 bg-black text-white rounded-md text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors shadow-sm">
          Return to Login
        </a>
      )}
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black">
      <Suspense fallback={<div className="font-bold text-gray-400 animate-pulse">Initializing...</div>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}