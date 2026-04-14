'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, UserMinus, Share2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/features/feed/PostCard';
import { getGroupById, joinGroup, leaveGroup, getGroupPosts } from '@/features/groups/actions';
import { getGroupMessages, sendGroupMessage } from '@/features/groups/chat-actions';
import { toast } from 'sonner';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');
  const [chatText, setChatText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([getGroupById(groupId), getGroupPosts(groupId), getGroupMessages(groupId)]).then(([g, p, m]) => {
      setGroup(g);
      setPosts(p);
      setMessages(m);
      setIsMember(g?.is_member || false);
      setMembersCount(g?.members_count || 0);
      setLoading(false);
    });
  }, [groupId]);

  const handleToggleMembership = () => {
    setIsMember(!isMember);
    setMembersCount(isMember ? membersCount - 1 : membersCount + 1);
    startTransition(async () => {
      if (isMember) await leaveGroup(groupId);
      else await joinGroup(groupId);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-zinc-400">{group.name}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/groups/${groupId}`);
              toast('Group link copied');
            }}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center">
            <Users className="w-7 h-7 text-purple-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{group.name}</h2>
            {group.description && <p className="text-sm text-zinc-500 mt-1">{group.description}</p>}
            <p className="text-xs text-zinc-600 mt-1">{membersCount} members</p>
          </div>

          <Button
            onClick={handleToggleMembership}
            disabled={isPending}
            size="sm"
            className={`px-6 font-bold transition-all ${
              isMember
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
            }`}
          >
            {isMember ? (
              <><UserMinus className="w-4 h-4 mr-2" />Leave</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" />Join</>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-950 rounded-lg p-1 border border-zinc-800/50 mb-4">
          <button onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'posts' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-zinc-500 border border-transparent'
            }`}>
            Posts
          </button>
          <button onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chat' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' : 'text-zinc-500 border border-transparent'
            }`}>
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </button>
        </div>

        {activeTab === 'chat' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-zinc-600 py-8">No messages yet. Start chatting!</p>
              ) : messages.map((msg) => {
                const initials = msg.sender?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                return (
                  <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.is_mine ? 'bg-purple-600 text-white rounded-br-md' : 'bg-zinc-900 text-zinc-200 rounded-bl-md'
                    }`}>
                      {!msg.is_mine && <p className="text-xs text-purple-400 font-medium mb-0.5">@{msg.sender?.username}</p>}
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_mine ? 'text-purple-300' : 'text-zinc-600'}`}>{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {isMember && (
              <div className="flex gap-2">
                <Input
                  placeholder="Message..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && chatText.trim()) {
                      const txt = chatText;
                      setChatText('');
                      await sendGroupMessage(groupId, txt);
                      const updated = await getGroupMessages(groupId);
                      setMessages(updated);
                    }
                  }}
                  className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
                />
                <button
                  onClick={async () => {
                    if (!chatText.trim()) return;
                    const txt = chatText;
                    setChatText('');
                    await sendGroupMessage(groupId, txt);
                    const updated = await getGroupMessages(groupId);
                    setMessages(updated);
                  }}
                  className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-zinc-600">
            <p className="text-sm">No posts in this group yet</p>
            <p className="text-xs text-zinc-700 mt-1">Share a post to this group to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
