'use client';

import { useRef } from 'react';
import { QuestionnaireProvider, Fld } from '@/app/q/[id]/QuestionnaireFields';
import {
  PolinaContent,
  POLINA_CB_COUNT,
  POLINA_FLD_COUNT,
} from '@/app/q/[id]/forms/polina-content';

type Answers = Record<string, string | boolean>;

interface Props {
  id: string;
  clientLabel: string;
  answers: Answers;
  updatedAt: string;
}

export function AdminView({ id, clientLabel, answers, updatedAt }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const cbDone = Object.entries(answers).filter(
    ([k, v]) => k.startsWith('cb') && v === true,
  ).length;
  const fldDone = Object.entries(answers).filter(
    ([k, v]) => k.startsWith('fld') && typeof v === 'string' && v.trim().length > 0,
  ).length;
  const total = POLINA_CB_COUNT + POLINA_FLD_COUNT;
  const done = cbDone + fldDone;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const updatedDate = (() => {
    try {
      return new Date(updatedAt).toLocaleString('ru-RU');
    } catch {
      return updatedAt;
    }
  })();

  function downloadHtml() {
    const inner = bodyRef.current?.outerHTML ?? '';
    // Соберём чистый HTML-документ со стилями
    const styles = Array.from(document.styleSheets)
      .map((s) => {
        try {
          return Array.from(s.cssRules)
            .map((r) => r.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${clientLabel} — ответы (${updatedDate})</title>
<style>${styles}</style>
</head>
<body>
<div class="qn-page">
<header class="qn-header">
  <span class="eyebrow">снимок · ${updatedDate}</span>
  <h1>${clientLabel}</h1>
  <p style="margin-top:10px;font-family:var(--font-numerals);font-size:12px;color:var(--ink-soft);">Заполнено: ${done} / ${total} (${cbDone} ✓ + ${fldDone} полей, ${pct}%)</p>
</header>
${inner}
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = clientLabel.replace(/[^\p{L}\d-]+/gu, '_').slice(0, 60);
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${safeName}_${dateStr}_${done}of${total}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function downloadJson() {
    const payload = {
      id,
      client_label: clientLabel,
      updated_at: updatedAt,
      stats: { total, done, cbDone, fldDone, percent: pct },
      answers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = clientLabel.replace(/[^\p{L}\d-]+/gu, '_').slice(0, 60);
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${safeName}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  return (
    <QuestionnaireProvider value={{ answers, setAnswer: () => {}, mode: 'view' }}>
      <main className="qn-page">
        <div className="admin-bar">
          <div className="admin-bar-info">
            <span className="eyebrow">снимок · admin</span>
            <strong>{clientLabel}</strong>
            <span className="admin-bar-meta">
              обновлено {updatedDate} · {done}/{total} ({pct}%)
            </span>
          </div>
          <div className="admin-bar-actions">
            <button type="button" className="admin-btn" onClick={downloadJson}>
              JSON
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={downloadHtml}>
              Скачать HTML
            </button>
          </div>
        </div>

        <div className="qn-body admin-readonly" ref={bodyRef}>
          <PolinaContent f={(fid) => <Fld key={fid} id={fid} />} />
        </div>
      </main>
    </QuestionnaireProvider>
  );
}
