import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

webPush.setVapidDetails(
  'mailto:alex@forgeclub.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(request: NextRequest) {
  const { userId, title, body, url } = await request.json();

  if (!userId || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        sub.subscription as any,
        JSON.stringify({ title, body, url: url || '/feed', tag: `forge-${Date.now()}` }),
      );
      sent++;
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabaseAdmin.from('push_subscriptions').delete().eq('subscription', sub.subscription);
      }
    }
  }

  return NextResponse.json({ sent });
}
