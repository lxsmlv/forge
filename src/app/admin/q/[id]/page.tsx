import { notFound } from 'next/navigation';
import { loadQuestionnaire } from '@/features/questionnaire/actions';
import { AdminView } from './AdminView';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadQuestionnaire(id);
  if (!data) notFound();

  return (
    <AdminView
      id={data.id}
      clientLabel={data.client_label}
      answers={data.answers ?? {}}
      updatedAt={data.updated_at}
    />
  );
}
