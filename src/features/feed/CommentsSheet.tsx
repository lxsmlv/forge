'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { X, Send, Trash2, Reply } from 'lucide-react';
import { getComments, addComment, deleteComment } from './comments-actions';
import { Input } from '@/components/ui/input';

interface Props {
  postId: string;
  onClose: (count?: number) => void;
}

function CommentItem({ comment, postId, onRefresh, onReply }: { comment: any; postId: string; onRefresh: () => void; onReply: (username: string, parentId: string) => void }) {
  const initials = comment.author.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <div className="flex gap-3 group">
        <div className="h-8 w-8 shrink-0 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-400 overflow-hidden">
          {comment.author.avatar_url ? (
            <img src={comment.author.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">@{comment.author.username}</span>
            <span className="text-xs text-zinc-600">{comment.created_at}</span>
          </div>
          <p className="text-sm text-zinc-300 mt-0.5">{comment.text}</p>
          <button
            onClick={() => onReply(comment.author.username, comment.id)}
            className="text-xs text-zinc-600 hover:text-purple-400 mt-1 transition-colors"
          >
            Reply
          </button>
        </div>
        <button
          onClick={async () => {
            await deleteComment(comment.id);
            onRefresh();
          }}
          className="shrink-0 text-zinc-800 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-11 mt-2 flex flex-col gap-2 border-l border-zinc-800/50 pl-3">
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onRefresh={onRefresh} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSheet({ postId, onClose }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ username: string; parentId: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => { loadComments(); }, [postId]);

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const handleSend = () => {
    if (!text.trim()) return;
    const currentText = text;
    const parentId = replyTo?.parentId;
    setText('');
    setReplyTo(null);
    startTransition(async () => {
      await addComment(postId, currentText, parentId);
      await loadComments();
    });
  };

  const handleReply = (username: string, parentId: string) => {
    setReplyTo({ username, parentId });
    setText(`@${username} `);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => onClose(totalCount)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-zinc-950 border-t border-zinc-800 rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <span className="text-sm font-medium text-zinc-400">Comments ({totalCount})</span>
          <button onClick={() => onClose(totalCount)} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-600 py-8">No comments yet. Be the first.</p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={postId} onRefresh={loadComments} onReply={handleReply} />
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-zinc-800/50">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2">
              <Reply className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400">Replying to @{replyTo.username}</span>
              <button onClick={() => { setReplyTo(null); setText(''); }} className="text-xs text-zinc-600 hover:text-white">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
              className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-600 focus:ring-purple-600/30"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || isPending}
              className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
