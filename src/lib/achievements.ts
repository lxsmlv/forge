export interface Achievement {
  emoji: string;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  minLevel?: number; // unlocks at this level
  xpReward?: number; // bonus XP when earned
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // === Getting Started (Level 1) ===
  first_post:     { emoji: '🎯', title: 'First Shot', titleRu: 'Первый шаг', description: 'Published your first post', descriptionRu: 'Опубликовал первый пост', minLevel: 1, xpReward: 20 },
  first_workout:  { emoji: '💪', title: 'Iron Starter', titleRu: 'В деле', description: 'Logged first workout', descriptionRu: 'Записал первую тренировку', minLevel: 1, xpReward: 20 },
  first_note:     { emoji: '📝', title: 'Thinker', titleRu: 'Мыслитель', description: 'Created first note', descriptionRu: 'Создал первую заметку', minLevel: 1, xpReward: 10 },
  founder:        { emoji: '🏗️', title: 'Founder', titleRu: 'Основатель', description: 'Early member of Forge', descriptionRu: 'Ранний участник Forge', minLevel: 1, xpReward: 50 },

  // === Consistency (Level 2-3) ===
  streak_7:       { emoji: '🔥', title: '7-Day Fire', titleRu: '7 дней огня', description: '7 days in a row', descriptionRu: '7 дней подряд', minLevel: 1, xpReward: 30 },
  ten_posts:      { emoji: '📸', title: 'Creator', titleRu: 'Создатель', description: '10 posts published', descriptionRu: '10 постов опубликовано', minLevel: 2, xpReward: 40 },
  ten_workouts:   { emoji: '🏋️', title: 'Consistent', titleRu: 'Стабильность', description: '10 workouts logged', descriptionRu: '10 тренировок записано', minLevel: 2, xpReward: 40 },
  ten_notes:      { emoji: '🧠', title: 'Organized', titleRu: 'Организованный', description: '10 notes created', descriptionRu: '10 заметок создано', minLevel: 2, xpReward: 30 },

  // === Social (Level 2-4) ===
  ten_followers:  { emoji: '👥', title: 'Growing', titleRu: 'Растёшь', description: '10 followers', descriptionRu: '10 подписчиков', minLevel: 2, xpReward: 40 },
  fifty_likes:    { emoji: '💜', title: 'Popular', titleRu: 'Популярный', description: '50 likes received', descriptionRu: '50 лайков получено', minLevel: 3, xpReward: 50 },
  first_message:  { emoji: '💬', title: 'Connected', titleRu: 'На связи', description: 'Sent first message', descriptionRu: 'Отправил первое сообщение', minLevel: 1, xpReward: 15 },

  // === Dedication (Level 3-5) ===
  streak_30:      { emoji: '⚡', title: 'Unstoppable', titleRu: 'Не остановить', description: '30 days in a row', descriptionRu: '30 дней подряд', minLevel: 3, xpReward: 100 },
  fifty_posts:    { emoji: '🌟', title: 'Star', titleRu: 'Звезда', description: '50 posts published', descriptionRu: '50 постов опубликовано', minLevel: 4, xpReward: 80 },
  fifty_workouts: { emoji: '🏆', title: 'Athlete', titleRu: 'Атлет', description: '50 workouts logged', descriptionRu: '50 тренировок записано', minLevel: 4, xpReward: 80 },
  hundred_likes:  { emoji: '🔥', title: 'On Fire', titleRu: 'В огне', description: '100 likes received', descriptionRu: '100 лайков получено', minLevel: 4, xpReward: 60 },

  // === Mastery (Level 5+) ===
  streak_100:     { emoji: '💎', title: 'Diamond', titleRu: 'Бриллиант', description: '100 days in a row', descriptionRu: '100 дней подряд', minLevel: 5, xpReward: 200 },
  level_5:        { emoji: '🎖️', title: 'Veteran', titleRu: 'Ветеран', description: 'Reached Level 5', descriptionRu: 'Достигнут 5 уровень', minLevel: 5, xpReward: 100 },
  level_10:       { emoji: '👑', title: 'Legend', titleRu: 'Легенда', description: 'Reached Level 10', descriptionRu: 'Достигнут 10 уровень', minLevel: 10, xpReward: 250 },

  // === Tasks & Goals ===
  ten_tasks_done: { emoji: '✅', title: 'Doer', titleRu: 'Делатель', description: '10 tasks completed', descriptionRu: '10 задач выполнено', minLevel: 2, xpReward: 30 },
  fifty_tasks:    { emoji: '🎯', title: 'Machine', titleRu: 'Машина', description: '50 tasks completed', descriptionRu: '50 задач выполнено', minLevel: 4, xpReward: 70 },
};
