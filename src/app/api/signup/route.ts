import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`signup:${ip}`, 5, 300000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { email, password, username, full_name } = await request.json();

  if (!email || !password || !username || !full_name) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    username,
    full_name,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    const msg = profileError.message.includes('duplicate')
      ? 'Username already taken'
      : profileError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ user_id: userId, email });
}
