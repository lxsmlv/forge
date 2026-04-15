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
      <div className="min-h-screen bg-[var(--forge-black)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--forge-purple)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[var(--forge-black)] flex flex-col items-center justify-center text-[var(--forge-text-secondary)]">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)] pb-20">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)] truncate">{group.name}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/groups/${groupId}`);
              toast('Group link copied');
            }}
            className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-[var(--forge-radius-lg)] bg-[var(--forge-purple-glow)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center shadow-[var(--forge-shadow-glow)]">
            <Users className="w-7 h-7 text-[var(--forge-purple-bright)]" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-[var(--forge-text-primary)] tracking-tight">{group.name}</h2>
            {group.description && <p className="text-sm text-[var(--forge-text-secondary)] mt-1 leading-relaxed">{group.description}</p>}
            <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-1 uppercase tracking-wider">{membersCount} members</p>
          </div>

          <button
            onClick={handleToggleMembership}
            disabled={isPending}
            className={isMember ? 'forge-btn-secondary px-5 py-2 text-[13px] flex items-center gap-2' : 'forge-btn-primary px-5 py-2 text-[13px] flex items-center gap-2'}
          >
            {isMember ? (
              <><UserMinus className="w-4 h-4" />Leave</>
            ) : (
              <><UserPlus className="w-4 h-4" />Join</>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--forge-surface)] rounded-[var(--forge-radius-md)] p-1 border border-[var(--forge-border)] mb-4">
          <button onClick={() => setActiveTab('posts')}
            className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'posts' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}>
            Posts
          </button>
          <button onClick={() => setActiveTab('chat')}
            className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[13px] font-medium transition-all ${
              activeTab === 'chat' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)] border border-[rgba(139,92,246,0.2)]' : 'text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-secondary)] border border-transparent'
            }`}>
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </button>
        </div>

        {activeTab === 'chat' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-[var(--forge-text-tertiary)] py-8">No messages yet. Start chatting!</p>
              ) : messages.map((msg) => {
                return (
                  <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2 rounded-[18px] text-[14px] leading-snug ${
                      msg.is_mine
                        ? 'bg-gradient-to-br from-[var(--forge-purple)] to-[var(--forge-purple-dim)] text-white rounded-br-[6px] shadow-[0_2px_12px_rgba(139,92,246,0.25)]'
                        : 'bg-[var(--forge-card)] border border-[var(--forge-border)] text-[var(--forge-text-primary)] rounded-bl-[6px]'
                    }`}>
                      {!msg.is_mine && <p className="text-[11px] text-[var(--forge-purple-bright)] font-semibold mb-0.5">@{msg.sender?.username}</p>}
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_mine ? 'text-purple-200/80' : 'text-[var(--forge-text-tertiary)]'}`}>{msg.time}</p>
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
                  className="forge-input flex-1 !py-2"
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
                  className="forge-press h-10 w-10 rounded-[var(--forge-radius-md)] flex items-center justify-center shadow-[var(--forge-shadow-glow)] hover:shadow-[var(--forge-shadow-glow-strong)] transition-all"
                  style={{ background: 'var(--forge-gradient)' }}
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
          <div className="forge-card flex flex-col items-center py-12 px-6 text-center">
            <p className="text-sm text-[var(--forge-text-primary)] font-semibold">No posts in this group yet</p>
            <p className="text-xs text-[var(--forge-text-tertiary)] mt-1">Share a post to this group to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
