'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { getLocale } from '@/lib/i18n';

export default function Privacy() {
  const t = useT();
  const locale = getLocale();

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link href="/" className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">
            {locale === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
          </span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {locale === 'ru' ? <PrivacyRU /> : <PrivacyEN />}
      </main>
    </div>
  );
}

function PrivacyEN() {
  return (
    <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-[var(--forge-text-secondary)]">
      <h1 className="text-xl font-bold text-[var(--forge-text-primary)]">Privacy Policy</h1>
      <p className="text-xs text-[var(--forge-text-tertiary)]">Last updated: April 13, 2026</p>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">1. What We Collect</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Account information: email, username, name</li>
        <li>Profile data: bio, city, car, sports (provided by you)</li>
        <li>Content: posts, photos, videos, comments, notes, workouts</li>
        <li>Usage data: login activity, interactions</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">2. How We Use It</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>To provide and improve Forge</li>
        <li>To show your content to other members</li>
        <li>To send notifications about activity</li>
        <li>To enforce our terms and moderate content</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">3. Your Private Data</h2>
      <p>Your Cabinet (notes, workouts) is private. Only you can see it. Direct messages are end-to-end encrypted — we cannot read them.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">4. Data Storage</h2>
      <p>Data is stored on Supabase (EU region). Photos and videos are stored in secure cloud storage.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">5. Third Parties</h2>
      <p>We do not sell your data. We use Supabase for infrastructure and Vercel for hosting. No advertising trackers.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">6. Your Rights</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Access your data through your profile</li>
        <li>Edit or delete your content at any time</li>
        <li>Delete your account completely through Settings</li>
        <li>Request data export by emailing us</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">7. Cookies</h2>
      <p>We use essential cookies for authentication. No tracking cookies.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">8. Contact</h2>
      <p>alex@forgeclub.app</p></section>
    </div>
  );
}

function PrivacyRU() {
  return (
    <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-[var(--forge-text-secondary)]">
      <h1 className="text-xl font-bold text-[var(--forge-text-primary)]">Политика конфиденциальности</h1>
      <p className="text-xs text-[var(--forge-text-tertiary)]">Обновлено: 13 апреля 2026</p>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">1. Что мы собираем</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Данные аккаунта: email, имя пользователя, имя</li>
        <li>Данные профиля: биография, город, машина, виды спорта (заполняете вы)</li>
        <li>Контент: посты, фото, видео, комментарии, заметки, тренировки</li>
        <li>Данные использования: активность входа, взаимодействия</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">2. Как мы используем данные</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Для работы и улучшения Forge</li>
        <li>Для показа вашего контента другим участникам</li>
        <li>Для отправки уведомлений об активности</li>
        <li>Для соблюдения условий и модерации контента</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">3. Ваши приватные данные</h2>
      <p>Ваш Кабинет (заметки, тренировки) приватный. Только вы его видите. Личные сообщения зашифрованы сквозным шифрованием — мы не можем их прочитать.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">4. Хранение данных</h2>
      <p>Данные хранятся на Supabase (регион ЕС). Фото и видео — в защищённом облачном хранилище.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">5. Третьи стороны</h2>
      <p>Мы не продаём ваши данные. Мы используем Supabase для инфраструктуры и Vercel для хостинга. Никаких рекламных трекеров.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">6. Ваши права</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Доступ к данным через профиль</li>
        <li>Редактирование или удаление контента в любое время</li>
        <li>Полное удаление аккаунта через Настройки</li>
        <li>Запрос экспорта данных по email</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">7. Файлы cookie</h2>
      <p>Мы используем только необходимые cookie для аутентификации. Никаких отслеживающих cookie.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">8. Контакты</h2>
      <p>alex@forgeclub.app</p></section>
    </div>
  );
}
