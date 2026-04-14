export async function sendPush(userId: string, title: string, body: string, url?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://forgeclub.app' : 'http://localhost:3000';
    await fetch(`${baseUrl}/api/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch {}
}
