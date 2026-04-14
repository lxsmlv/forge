export async function sendPush(userId: string, title: string, body: string, url?: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}/api/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch {}
}
