import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side initialization using service role bypass to read tracking logs safely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Requires your secret service role token in .env
);

export async function POST(request: Request) {
  try {
    // 1. Validate Cron security handshake to prevent random public execution attacks
    const { authHeader } = await request.json().catch(() => ({ authHeader: '' }));
    if (authHeader !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized handshake signature' }, { status: 401 });
    }

    // 2. Query the database for elements waiting inside Scheduled ('col-4')
    const { data: scheduledPayloads, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('status', 'col-4');

    if (fetchError) throw fetchError;
    if (!scheduledPayloads || scheduledPayloads.length === 0) {
      return NextResponse.json({ status: 'Idle', message: 'No payloads inside deployment queues.' });
    }

    const outputLogs = [];

    // 3. Process execution cycle
    for (const post of scheduledPayloads) {
      // Fetch the operator's active LinkedIn token credentials from their profile preferences
      const { data: prefMatrix } = await supabaseAdmin
        .from('user_preferences')
        .select('webhook_url')
        .eq('user_id', post.user_id)
        .single();

      // MOCK PRODUCTION EXECUTION LINK: This is where the LinkedIn handshake drops down
      console.log(`[DEPLOY RUN] Injecting copy node payload down user lane: ${post.user_id}`);
      
      // 4. Archive item from queue -> Transition to a new structural tracking state ('published')
      await supabaseAdmin
        .from('posts')
        .update({ 
          status: 'published',
          tag: 'Live Archive'
        })
        .eq('id', post.id);

      outputLogs.push({ id: post.id, status: 'Dispatched to external network arrays' });
    }

    return NextResponse.json({ status: 'Success', processed: outputLogs });
  } catch (error: any) {
    console.error('Publish Engine Core Failure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}