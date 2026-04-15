'use client';

import { createContext, useContext } from 'react';

export type Locale = 'en' | 'ru';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Landing
    'landing.subtitle': 'Friends club for those who lift, drive, and live well.',
    'landing.enter': 'Join Forge',
    'landing.already_member': 'Already a member? Sign in',

    // Auth
    'auth.full_name': 'Full name',
    'auth.username': 'Username',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.join': 'Join the club',
    'auth.signin': 'Sign in',
    'auth.welcome_back': 'Welcome back.',
    'auth.no_account': "Don't have an account? Enter with invite code",
    'auth.creating': 'Creating account...',
    'auth.signing_in': 'Signing in...',

    // Feed
    'feed.tab_feed': 'Feed',
    'feed.tab_cabinet': 'Cabinet',
    'feed.following': 'Following',
    'feed.saved': 'Saved',
    'feed.trending': 'Trending',
    'cat.gym': 'Gym',
    'cat.cars': 'Cars',
    'cat.lifestyle': 'Lifestyle',
    'cat.sport': 'Sport',

    // Stories
    'stories.your': 'Your story',

    // Nav
    'nav.feed': 'Feed',
    'nav.search': 'Search',
    'nav.post': 'Post',
    'nav.reels': 'Reels',
    'nav.profile': 'Profile',
    'feed.no_posts': 'No posts yet',
    'feed.be_first': 'Be the first to share something',
    'feed.follow_someone': 'Follow someone to see their posts',
    'feed.empty_start_following': 'Start following to fill your feed',
    'feed.empty_find_more': 'Find more people',

    // Create
    'create.new_post': 'New Post',
    'create.publish': 'Publish',
    'create.add_photos': 'Tap to add photos or videos (up to 10)',
    'create.whats_story': "What's the story?",
    'create.add_location': 'Add location (optional)',
    'create.category': 'Category',

    // Cabinet
    'cabinet.notes': 'Notes',
    'cabinet.workouts': 'Workouts',
    'cabinet.add_note': 'Add note',
    'cabinet.log_workout': 'Log workout',
    'cabinet.what_done': 'What needs to be done?',
    'cabinet.details': 'Details (optional)',
    'cabinet.duration': 'Duration (minutes)',
    'cabinet.no_notes': 'No notes yet',
    'cabinet.no_workouts': 'No workouts logged yet',

    // Profile
    'profile.edit': 'Edit profile',
    'profile.posts': 'Posts',
    'profile.followers': 'Followers',
    'profile.following_tab': 'Following',
    'profile.workouts': 'Workouts',
    'profile.activity': 'Activity',
    'profile.achievements': 'Achievements',
    'profile.no_posts': 'No posts yet',
    'profile.last_30': 'Last 30 days',

    // Settings
    'settings.title': 'Settings',
    'settings.change_password': 'Change password',
    'settings.new_password': 'New password',
    'settings.confirm_password': 'Confirm new password',
    'settings.update_password': 'Update password',
    'settings.theme': 'Dark mode',
    'settings.theme_switch': 'Tap to switch',
    'settings.export': 'Export my data',
    'settings.signout': 'Sign out',
    'settings.danger': 'Danger zone',
    'settings.delete_account': 'Delete my account',
    'settings.delete_confirm': 'This will permanently delete your account, posts, notes, and all data. This cannot be undone.',
    'settings.delete_yes': 'Yes, delete everything',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.none': 'No notifications yet',
    'notifications.liked': 'liked your post',
    'notifications.commented': 'commented on your post',
    'notifications.followed': 'started following you',

    // Onboarding
    'onboarding.add_photo': 'Add your photo',
    'onboarding.about_you': 'Write something about yourself...',
    'onboarding.next': 'Next',
    'onboarding.what_sports': 'What sports do you do?',
    'onboarding.your_car': 'Your car (e.g. Land Cruiser 200)',
    'onboarding.city': 'City',
    'onboarding.enter': 'Enter Forge',
    'onboarding.skip': 'Skip for now',
    'onboarding.setting_up': 'Setting up...',

    // Reset password
    'reset.forgot': 'Forgot password?',
    'reset.enter_email': 'Enter your email to reset password.',
    'reset.send': 'Send reset link',
    'reset.sending': 'Sending...',
    'reset.check_email': 'Check your email for a password reset link.',
    'reset.back': 'Back to login',

    // Messages
    'messages.title': 'Messages',
    'messages.chats': 'Chats',
    'messages.none': 'No messages yet',
    'messages.search_people': 'Search people...',
    'messages.start': 'Start the conversation',
    'messages.encrypted': 'Messages are end-to-end encrypted',
    'messages.only_you': 'Only you and @{username} can read them',
    'messages.placeholder': 'Message...',
    'messages.encrypted_placeholder': '🔒 Encrypted message...',

    // Search
    'search.placeholder': 'Search people or posts...',
    'search.people': 'People',
    'search.posts_tab': 'Posts',
    'search.trending_tags': 'Trending tags',
    'search.discover': 'Discover people',
    'search.no_people': 'No people found',
    'search.no_posts': 'No posts found',

    // Groups
    'groups.title': 'Groups',
    'groups.create': 'Create Group',
    'groups.none': 'No groups yet',
    'groups.create_first': 'Create the first one',
    'groups.members': 'members',
    'groups.join': 'Join',
    'groups.leave': 'Leave',
    'groups.no_posts': 'No posts in this group yet',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.report': 'Report',
    'common.repost': 'Repost',
    'common.pin': 'Pin to profile',
    'common.unpin': 'Unpin',
    'common.follow': 'Follow',
    'common.unfollow': 'Following',
    'common.block': 'Block',
    'common.online': 'Online now',
    'common.last_seen': 'Last seen',
  },
  ru: {
    'landing.subtitle': 'Клуб друзей для тех, кто тренируется, ездит и живёт в кайф.',
    'landing.enter': 'Присоединиться',
    'landing.already_member': 'Уже участник? Войти',

    'auth.full_name': 'Полное имя',
    'auth.username': 'Юзернейм',
    'auth.email': 'Почта',
    'auth.password': 'Пароль',
    'auth.join': 'Вступить в клуб',
    'auth.signin': 'Войти',
    'auth.welcome_back': 'С возвращением.',
    'auth.no_account': 'Нет аккаунта? Войти по инвайту',
    'auth.creating': 'Создаём аккаунт...',
    'auth.signing_in': 'Входим...',

    'feed.tab_feed': 'Лента',
    'feed.tab_cabinet': 'Кабинет',
    'feed.following': 'Подписки',
    'feed.saved': 'Сохранённые',
    'feed.trending': 'Популярное',
    'cat.gym': 'Зал',
    'cat.cars': 'Машины',
    'cat.lifestyle': 'Лайфстайл',
    'cat.sport': 'Спорт',

    'stories.your': 'Ваша история',

    'nav.feed': 'Лента',
    'nav.search': 'Поиск',
    'nav.post': 'Пост',
    'nav.reels': 'Рилсы',
    'nav.profile': 'Профиль',
    'feed.no_posts': 'Постов пока нет',
    'feed.be_first': 'Будь первым кто поделится',
    'feed.follow_someone': 'Подпишись на кого-нибудь',
    'feed.empty_start_following': 'Подпишись чтобы заполнить ленту',
    'feed.empty_find_more': 'Найти ещё людей',

    'create.new_post': 'Новый пост',
    'create.publish': 'Опубликовать',
    'create.add_photos': 'Добавь фото или видео (до 10)',
    'create.whats_story': 'Что нового?',
    'create.add_location': 'Добавить место (опционально)',
    'create.category': 'Категория',

    'cabinet.notes': 'Заметки',
    'cabinet.workouts': 'Тренировки',
    'cabinet.add_note': 'Добавить заметку',
    'cabinet.log_workout': 'Записать тренировку',
    'cabinet.what_done': 'Что нужно сделать?',
    'cabinet.details': 'Детали (опционально)',
    'cabinet.duration': 'Длительность (минуты)',
    'cabinet.no_notes': 'Заметок пока нет',
    'cabinet.no_workouts': 'Тренировок пока нет',

    'profile.edit': 'Редактировать',
    'profile.posts': 'Посты',
    'profile.followers': 'Подписчики',
    'profile.following_tab': 'Подписки',
    'profile.workouts': 'Тренировки',
    'profile.activity': 'Активность',
    'profile.achievements': 'Достижения',
    'profile.no_posts': 'Постов пока нет',
    'profile.last_30': 'Последние 30 дней',

    'settings.title': 'Настройки',
    'settings.change_password': 'Сменить пароль',
    'settings.new_password': 'Новый пароль',
    'settings.confirm_password': 'Подтвердите пароль',
    'settings.update_password': 'Обновить пароль',
    'settings.theme': 'Тёмная тема',
    'settings.theme_switch': 'Нажми для переключения',
    'settings.export': 'Скачать мои данные',
    'settings.signout': 'Выйти',
    'settings.danger': 'Опасная зона',
    'settings.delete_account': 'Удалить аккаунт',
    'settings.delete_confirm': 'Все данные будут удалены навсегда. Это необратимо.',
    'settings.delete_yes': 'Да, удалить всё',

    'notifications.title': 'Уведомления',
    'notifications.none': 'Уведомлений пока нет',
    'notifications.liked': 'лайкнул(а) твой пост',
    'notifications.commented': 'прокомментировал(а) пост',
    'notifications.followed': 'подписался(-лась) на тебя',

    'onboarding.add_photo': 'Добавьте фото',
    'onboarding.about_you': 'Напишите о себе...',
    'onboarding.next': 'Далее',
    'onboarding.what_sports': 'Какими видами спорта занимаетесь?',
    'onboarding.your_car': 'Ваша машина (например Land Cruiser 200)',
    'onboarding.city': 'Город',
    'onboarding.enter': 'Войти в Forge',
    'onboarding.skip': 'Пропустить',
    'onboarding.setting_up': 'Настраиваем...',

    'reset.forgot': 'Забыли пароль?',
    'reset.enter_email': 'Введите email для сброса пароля.',
    'reset.send': 'Отправить ссылку',
    'reset.sending': 'Отправляем...',
    'reset.check_email': 'Проверьте почту — ссылка для сброса отправлена.',
    'reset.back': 'Назад к входу',

    'messages.title': 'Сообщения',
    'messages.chats': 'Чаты',
    'messages.none': 'Сообщений пока нет',
    'messages.search_people': 'Поиск людей...',
    'messages.start': 'Начни разговор',
    'messages.encrypted': 'Сообщения зашифрованы',
    'messages.only_you': 'Только ты и @{username} можете их прочитать',
    'messages.placeholder': 'Сообщение...',
    'messages.encrypted_placeholder': '🔒 Зашифрованное сообщение...',

    'search.placeholder': 'Поиск людей и постов...',
    'search.people': 'Люди',
    'search.posts_tab': 'Посты',
    'search.trending_tags': 'Популярные теги',
    'search.discover': 'Рекомендации',
    'search.no_people': 'Никого не найдено',
    'search.no_posts': 'Постов не найдено',

    'groups.title': 'Группы',
    'groups.create': 'Создать группу',
    'groups.none': 'Групп пока нет',
    'groups.create_first': 'Создай первую',
    'groups.members': 'участников',
    'groups.join': 'Вступить',
    'groups.leave': 'Выйти',
    'groups.no_posts': 'В группе пока нет постов',

    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.add': 'Добавить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.report': 'Пожаловаться',
    'common.repost': 'Репост',
    'common.pin': 'Закрепить',
    'common.unpin': 'Открепить',
    'common.follow': 'Подписаться',
    'common.unfollow': 'Подписан(а)',
    'common.block': 'Заблокировать',
    'common.online': 'Онлайн',
    'common.last_seen': 'Был(а)',
  },
};

const I18nContext = createContext<Locale>('en');

export function useLocale() {
  return useContext(I18nContext);
}

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('forge-locale');
  if (stored === 'ru' || stored === 'en') return stored;
  const browser = navigator.language.slice(0, 2);
  return browser === 'ru' ? 'ru' : 'en';
}

export function setLocale(locale: Locale) {
  localStorage.setItem('forge-locale', locale);
}

export { I18nContext, translations };
