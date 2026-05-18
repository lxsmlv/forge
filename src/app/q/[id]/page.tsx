import { notFound } from 'next/navigation';
import { loadQuestionnaire } from '@/features/questionnaire/actions';
import { QuestionnaireForm } from './QuestionnaireForm';

export const dynamic = 'force-dynamic';

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadQuestionnaire(id);
  if (!data) notFound();
  return (
    <main className="qn-page">
      <QuestionnaireForm
        id={data.id}
        clientLabel={data.client_label}
        initialAnswers={data.answers ?? {}}
        initialUpdatedAt={data.updated_at}
      />
    </main>
  );
}
