import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        // New user without invite — check if came from signup flow
        const cookieInvite = cookieStore.get('forge_invited');

        if (!cookieInvite?.value) {
          // No invite — delete user and redirect to landing
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!,
          );
          await supabaseAdmin.auth.admin.deleteUser(data.user.id);
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/?error=invite_required`);
        }

        // Has invite — create profile
        const meta = data.user.user_metadata;
        const username = (meta.name || meta.full_name || data.user.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);

        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!,
        );

        await supabaseAdmin.from('profiles').insert({
          id: data.user.id,
          username: username + Math.floor(Math.random() * 1000),
          full_name: meta.full_name || meta.name || 'User',
          avatar_url: meta.avatar_url || meta.picture || null,
        });

        // Clear invite cookie
        cookieStore.delete('forge_invited');

        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
