'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveAnswers } from '@/features/questionnaire/actions';
import { Fld, QuestionnaireProvider } from './QuestionnaireFields';
import { PolinaContent, POLINA_CB_COUNT, POLINA_FLD_COUNT } from './forms/polina-content';

type Answers = Record<string, string | boolean>;

interface Props {
  id: string;
  clientLabel: string;
  initialAnswers: Answers;
  initialUpdatedAt: string;
}

type SaveState = 'idle' | 'pending' | 'saved' | 'error';

export function QuestionnaireForm({ id, clientLabel, initialAnswers, initialUpdatedAt }: Props) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string>(initialUpdatedAt);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Answers | null>(null);
  const inFlightRef = useRef(false);

  const flushSave = useCallback(async () => {
    if (inFlightRef.current) return;
    const payload = pendingRef.current;
    if (!payload) return;
    pendingRef.current = null;
    inFlightRef.current = true;
    setSaveState('pending');
    const result = await saveAnswers(id, payload);
    inFlightRef.current = false;
    if (result.ok) {
      setSaveState('saved');
      if (result.updated_at) setLastSavedAt(result.updated_at);
      // Если за время запроса появились ещё изменения — сохраняем их следующим тиком
      if (pendingRef.current) flushSave();
    } else {
      setSaveState('error');
    }
  }, [id]);

  const setAnswer = useCallback(
    (key: string, value: string | boolean) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        pendingRef.current = next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void flushSave();
        }, 600);
        return next;
      });
    },
    [flushSave],
  );

  // Сохраняем при покидании страницы
  useEffect(() => {
    const handler = () => {
      if (pendingRef.current) {
        // Лучше что-то отправим до закрытия — fire-and-forget
        void flushSave();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [flushSave]);

  const cbDone = Object.entries(answers).filter(([k, v]) => k.startsWith('cb') && v === true).length;
  const fldDone = Object.entries(answers).filter(
    ([k, v]) => k.startsWith('fld') && typeof v === 'string' && v.trim().length > 0,
  ).length;
  const total = POLINA_CB_COUNT + POLINA_FLD_COUNT;
  const done = cbDone + fldDone;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusText = (() => {
    if (saveState === 'pending') return 'сохраняем…';
    if (saveState === 'error') return 'ошибка сохранения';
    if (saveState === 'saved' || saveState === 'idle') {
      try {
        const dt = new Date(lastSavedAt);
        return `сохранено ${dt.toLocaleString('ru-RU')}`;
      } catch {
        return 'сохранено';
      }
    }
    return '';
  })();

  return (
    <QuestionnaireProvider value={{ answers, setAnswer }}>
      <div className="qn-progress">
        <div className="qn-progress-row">
          <span>
            {done} / {total} заполнено ({cbDone} ✓ + {fldDone} полей)
          </span>
          <span className="qn-status">{statusText}</span>
        </div>
        <div className="qn-progress-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>

      <header className="qn-header">
        <span className="eyebrow">workbook · 2026</span>
        <h1>{renderHeading(clientLabel)}</h1>
      </header>

      <div className="qn-body">
        <PolinaContent f={(fid) => <Fld key={fid} id={fid} />} />
      </div>

      <div className="qn-footer-spacer" />
    </QuestionnaireProvider>
  );
}

function renderHeading(label: string) {
  const idx = label.indexOf(' — ');
  if (idx === -1) return label;
  const head = label.slice(0, idx);
  const tail = label.slice(idx + 3);
  return (
    <>
      {head}
      <br />
      <em>{tail}</em>
    </>
  );
}
