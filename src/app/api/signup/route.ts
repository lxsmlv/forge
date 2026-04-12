import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(request: NextRequest) {
  const { email, password, username, full_name, invite_code } = await request.json();

  if (!email || !password || !username || !full_name || !invite_code) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invite_codes')
    .select('id, used_by')
    .eq('code', invite_code)
    .maybeSingle();

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
  }

  if (invite.used_by) {
    return NextResponse.json({ error: 'Invite code already used' }, { status: 400 });
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

  await supabaseAdmin
    .from('invite_codes')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('code', invite_code)
    .is('used_by', null);

  return NextResponse.json({ user_id: userId, email });
}
