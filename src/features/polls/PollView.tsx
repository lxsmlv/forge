'use client';

import { useState, useEffect, useTransition } from 'react';
import { getPoll, votePoll } from './actions';
import { BarChart3 } from 'lucide-react';

export function PollView({ postId }: { postId: string }) {
  const [poll, setPoll] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPoll(postId).then(setPoll);
  }, [postId]);

  if (!poll) return null;

  const hasVoted = !!poll.my_vote;

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    setPoll({
      ...poll,
      my_vote: optionId,
      total_votes: poll.total_votes + 1,
      options: poll.options.map((o: any) => ({
        ...o,
        votes: o.id === optionId ? o.votes + 1 : o.votes,
        percentage: Math.round(((o.id === optionId ? o.votes + 1 : o.votes) / (poll.total_votes + 1)) * 100),
      })),
    });
    startTransition(() => { votePoll(poll.id, optionId); });
  };

  return (
    <div className="px-4 pb-3">
      <p className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
        <BarChart3 className="w-4 h-4 text-purple-400" />
        {poll.question}
      </p>
      <div className="flex flex-col gap-1.5">
        {poll.options.map((opt: any) => (
          <button
            key={opt.id}
            onClick={() => handleVote(opt.id)}
            disabled={hasVoted || isPending}
            className={`relative w-full text-left px-3 py-2 rounded-lg border text-sm transition-all overflow-hidden ${
              poll.my_vote === opt.id
                ? 'border-purple-600/50 text-purple-400'
                : hasVoted
                  ? 'border-zinc-800/50 text-zinc-400'
                  : 'border-zinc-800/50 text-zinc-300 hover:border-purple-600/30'
            }`}
          >
            {hasVoted && (
              <div
                className="absolute inset-y-0 left-0 bg-purple-600/10 transition-all"
                style={{ width: `${opt.percentage}%` }}
              />
            )}
            <span className="relative z-10 flex items-center justify-between">
              <span>{opt.text}</span>
              {hasVoted && <span className="text-xs text-zinc-500">{opt.percentage}%</span>}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-700 mt-1.5">{poll.total_votes} votes</p>
    </div>
  );
}
