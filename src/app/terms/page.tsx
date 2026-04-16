'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/lib/useT';
import { getLocale } from '@/lib/i18n';

export default function Terms() {
  const t = useT();
  const locale = getLocale();

  return (
    <div className="min-h-screen bg-[var(--forge-black)] text-[var(--forge-text-primary)]">
      <header className="forge-header sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3.5">
          <Link href="/" className="forge-press flex items-center justify-center h-10 w-10 -ml-2 rounded-full text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] hover:bg-[var(--forge-card-hover)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-semibold text-[var(--forge-text-primary)]">
            {locale === 'ru' ? 'Условия использования' : 'Terms of Service'}
          </span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {locale === 'ru' ? <TermsRU /> : <TermsEN />}
      </main>
    </div>
  );
}

function TermsEN() {
  return (
    <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-[var(--forge-text-secondary)]">
      <h1 className="text-xl font-bold text-[var(--forge-text-primary)]">Terms of Service</h1>
      <p className="text-xs text-[var(--forge-text-tertiary)]">Last updated: April 13, 2026</p>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">1. Acceptance</h2>
      <p>By accessing Forge (forgeclub.app), you agree to these terms. If you disagree, do not use the service.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">2. Eligibility</h2>
      <p>You must be at least 16 years old.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">3. Your Account</h2>
      <p>You are responsible for maintaining the security of your account. Do not share your credentials. You are responsible for all activity under your account.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">4. Content</h2>
      <p>You retain ownership of content you post. By posting, you grant Forge a non-exclusive license to display your content within the platform. You must not post illegal, harmful, abusive, or hateful content.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">5. Prohibited Conduct</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Harassment, bullying, or threats</li>
        <li>Spam or misleading content</li>
        <li>Impersonation of others</li>
        <li>Sharing others' private information</li>
        <li>Circumventing security measures</li>
        <li>Using bots or automated access</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">6. Termination</h2>
      <p>We may suspend or terminate your account for violations. You may delete your account at any time through Settings.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">7. Disclaimer</h2>
      <p>Forge is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">8. Changes</h2>
      <p>We may update these terms. Continued use constitutes acceptance of changes.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">9. Contact</h2>
      <p>Questions? Email alex@forgeclub.app</p></section>
    </div>
  );
}

function TermsRU() {
  return (
    <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-[var(--forge-text-secondary)]">
      <h1 className="text-xl font-bold text-[var(--forge-text-primary)]">Условия использования</h1>
      <p className="text-xs text-[var(--forge-text-tertiary)]">Обновлено: 13 апреля 2026</p>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">1. Принятие условий</h2>
      <p>Используя Forge (forgeclub.app), вы соглашаетесь с настоящими условиями. Если вы не согласны — не используйте сервис.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">2. Возраст</h2>
      <p>Вам должно быть не менее 16 лет.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">3. Ваш аккаунт</h2>
      <p>Вы несёте ответственность за безопасность своего аккаунта. Не передавайте свои данные для входа. Вы отвечаете за все действия под вашей учётной записью.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">4. Контент</h2>
      <p>Вы сохраняете права на свой контент. Публикуя его, вы предоставляете Forge неисключительную лицензию на отображение в рамках платформы. Запрещено публиковать незаконный, вредоносный или оскорбительный контент.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">5. Запрещённые действия</h2>
      <ul className="list-disc pl-4 space-y-1">
        <li>Травля, угрозы, оскорбления</li>
        <li>Спам и вводящий в заблуждение контент</li>
        <li>Выдача себя за другого человека</li>
        <li>Распространение чужой личной информации</li>
        <li>Обход мер безопасности</li>
        <li>Использование ботов или автоматизированного доступа</li>
      </ul></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">6. Прекращение доступа</h2>
      <p>Мы можем приостановить или удалить аккаунт за нарушения. Вы можете удалить аккаунт в любое время через Настройки.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">7. Отказ от гарантий</h2>
      <p>Forge предоставляется «как есть» без гарантий. Мы не несём ответственности за ущерб, связанный с использованием платформы.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">8. Изменения</h2>
      <p>Мы можем обновить эти условия. Продолжение использования означает принятие изменений.</p></section>

      <section><h2 className="text-[15px] font-semibold text-[var(--forge-text-primary)] mb-2">9. Контакты</h2>
      <p>Вопросы? Пишите на alex@forgeclub.app</p></section>
    </div>
  );
}
