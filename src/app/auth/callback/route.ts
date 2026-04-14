import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile from Google data
        const meta = data.user.user_metadata;
        const username = (meta.name || meta.full_name || data.user.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);

        await supabase.from('profiles').insert({
          id: data.user.id,
          username: username + Math.floor(Math.random() * 1000),
          full_name: meta.full_name || meta.name || 'User',
          avatar_url: meta.avatar_url || meta.picture || null,
        });

        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
