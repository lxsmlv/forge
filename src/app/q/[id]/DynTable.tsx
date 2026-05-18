'use client';

import { type ReactNode } from 'react';
import { Fld, useQuestionnaire } from './QuestionnaireFields';

interface Props {
  id: string;
  headers: ReactNode[];
  rows: ReactNode[][]; // массив строк, каждая строка — массив ячеек (ReactNode)
}

export function DynTable({ id, headers, rows }: Props) {
  const { answers, setAnswer, mode } = useQuestionnaire();
  const cols = headers.length;
  const countKey = `${id}:rows`;
  const extraRaw = answers[countKey];
  const extraCount =
    typeof extraRaw === 'string' && /^\d+$/.test(extraRaw) ? parseInt(extraRaw, 10) : 0;

  function addRow() {
    setAnswer(countKey, String(extraCount + 1));
  }

  function removeRow(idx: number) {
    // сдвигаем значения снизу-вверх
    for (let r = idx; r < extraCount - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const next = answers[`${id}:e:${r + 1}:${c}`];
        setAnswer(`${id}:e:${r}:${c}`, typeof next === 'string' ? next : '');
      }
    }
    // очищаем хвост
    for (let c = 0; c < cols; c++) {
      setAnswer(`${id}:e:${extraCount - 1}:${c}`, '');
    }
    setAnswer(countKey, String(Math.max(0, extraCount - 1)));
  }

  const isEdit = mode === 'edit';

  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
            {isEdit && <th className="row-action" aria-label="" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, ri) => (
            <tr key={`base-${ri}`}>
              {cells.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
              {isEdit && <td className="row-action" />}
            </tr>
          ))}
          {Array.from({ length: extraCount }, (_, i) => (
            <tr key={`extra-${i}`} className="extra-row">
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <Fld id={`${id}:e:${i}:${c}`} placeholder="…" />
                </td>
              ))}
              {isEdit && (
                <td className="row-action">
                  <button
                    type="button"
                    className="row-del"
                    onClick={() => removeRow(i)}
                    aria-label="удалить строку"
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isEdit && (
        <button type="button" className="row-add" onClick={addRow}>
          + добавить строку
        </button>
      )}
    </div>
  );
}
