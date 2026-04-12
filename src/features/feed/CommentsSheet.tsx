'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { getComments, addComment } from './comments-actions';
import { Input } from '@/components/ui/input';

interface Props {
  postId: string;
  onClose: (count?: number) => void;
}

export function CommentsSheet({ postId, onClose }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getComments(postId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [postId]);

  const handleSend = () => {
    if (!text.trim()) return;
    const currentText = text;
    setText('');
    startTransition(async () => {
      await addComment(postId, currentText);
      const updated = await getComments(postId);
      setComments(updated);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => onClose(comments.length)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-zinc-950 border-t border-zinc-800 rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <span className="text-sm font-medium text-zinc-400">Comments</span>
          <button onClick={() => onClose(comments.length)} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-600 py-8">No comments yet. Be the first.</p>
          ) : (
            comments.map((comment) => {
              const initials = comment.author.full_name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-400">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">@{comment.author.username}</span>
                      <span className="text-xs text-zinc-600">{comment.created_at}</span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-800/50 flex gap-2">
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
  );
}
