'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type QuestionnaireMode = 'edit' | 'view';

export interface QuestionnaireState {
  answers: Record<string, string | boolean>;
  setAnswer: (id: string, value: string | boolean) => void;
  mode: QuestionnaireMode;
}

const QuestionnaireContext = createContext<QuestionnaireState | null>(null);

export function QuestionnaireProvider({
  value,
  children,
}: {
  value: QuestionnaireState;
  children: ReactNode;
}) {
  return <QuestionnaireContext.Provider value={value}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire(): QuestionnaireState {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error('QuestionnaireProvider missing');
  return ctx;
}

export function Cb({ id, children }: { id: string; children: ReactNode }) {
  const { answers, setAnswer, mode } = useQuestionnaire();
  const checked = answers[id] === true;

  if (mode === 'view') {
    return (
      <div className={`cb-ro ${checked ? 'is-checked' : ''}`}>
        <span className="cb-ro-mark">{checked ? '✓' : '·'}</span>
        <span className="cb-ro-text">{children}</span>
      </div>
    );
  }

  return (
    <label className="cb">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setAnswer(id, e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

export function Fld({ id, placeholder = '…' }: { id: string; placeholder?: string }) {
  const { answers, setAnswer, mode } = useQuestionnaire();
  const value = typeof answers[id] === 'string' ? (answers[id] as string) : '';

  if (mode === 'view') {
    return (
      <span className={`fld-ro ${value ? 'is-filled' : 'is-empty'}`}>
        {value || '—'}
      </span>
    );
  }

  return (
    <input
      type="text"
      className="inline-fld"
      value={value}
      placeholder={placeholder}
      onChange={(e) => setAnswer(id, e.target.value)}
    />
  );
}
