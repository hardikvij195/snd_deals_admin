// app/api/cron/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: { headers: { get: (arg0: string) => any; }; }) {
  const cronSecret = process.env.CRON_SECRET;
  const supabaseCronUrl = process.env.SUPABASE_CRON_URL;
  const supabaseCronSecret = process.env.SUPABASE_CRON_SECRET;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // --- 1. Validate Environment Variables ---
  if (!cronSecret || !supabaseCronUrl || !supabaseCronSecret || !supabaseAnonKey) {
    console.error("Missing one or more required env variables for cron job:", {
      cronSecret: !!cronSecret,
      supabaseCronUrl: !!supabaseCronUrl,
      supabaseCronSecret: !!supabaseCronSecret,
      supabaseAnonKey: !!supabaseAnonKey,
    });
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  // --- 2. Authenticate Incoming Request ---
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error("Invalid authorization header:", authHeader);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // --- 3. Trigger Supabase Edge Function ---
  try {
    console.log('Sending request to Supabase with headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer <redacted>`, // Redacted for security
      'x-cron-secret': supabaseCronSecret,
    });
    const response = await fetch(supabaseCronUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`, // Or use SUPABASE_SERVICE_ROLE_KEY
        'x-cron-secret': supabaseCronSecret,
      },
    });

    // --- 4. Handle Response from Supabase ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase function error: ${response.status} - ${errorText}`);
      return NextResponse.json({ message: 'Supabase function failed', details: errorText }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ message: 'Cron job triggered successfully', result });
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}