'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { UserList } from '@/features/profile/UserList';
import { getFollowers } from '@/features/profile/followers-actions';
import { createClient } from '@/lib/supabase/client';

export default function FollowersPage() {
  const params = useParams();
  const username = params.username as string;

  const loadUsers = useCallback(async () => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
    if (!profile) return [];
    return getFollowers(profile.id);
  }, [username]);

  return <UserList title={`@${username}'s followers`} loadUsers={loadUsers} />;
}
