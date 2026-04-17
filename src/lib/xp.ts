/**
 * XP / Level system for Forge.
 *
 * Level formula: level = floor(xp / 500) + 1
 * XP to next level: 500 - (xp % 500)
 * Progress %: (xp % 500) / 500
 */

export const XP_REWARDS = {
  post: 10,
  note: 5,
  task_done: 10,
  workout: 15,
  daily_login: 3,
  streak_bonus: 5, // per streak day
  like_received: 2,
  comment_received: 3,
} as const;

export function getLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function getXpProgress(xp: number): { current: number; needed: number; percent: number } {
  const inLevel = xp % 500;
  return { current: inLevel, needed: 500, percent: Math.round((inLevel / 500) * 100) };
}
