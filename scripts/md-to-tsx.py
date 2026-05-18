#!/usr/bin/env python3
"""Генерирует TSX-компонент с контентом анкеты Полины из markdown.

Использование:
  python3 scripts/md-to-tsx.py

Источник: /Users/alexsamoilov/ObsidianVault/ClaudeMemory/projects/sotskontrakt-polina/dokumenty/zadaniya-poline.md
Выход:    src/app/q/[id]/forms/polina-content.tsx
"""

import re
from pathlib import Path

SRC = Path("/Users/alexsamoilov/ObsidianVault/ClaudeMemory/projects/sotskontrakt-polina/dokumenty/zadaniya-poline.md")
DST = Path("/Users/alexsamoilov/WebstormProjects/MyProjects/forge/src/app/q/[id]/forms/polina-content.tsx")

cb_counter = [0]
fld_counter = [0]


def esc(s: str) -> str:
    """Экранирует строку для JSX (как content между тегами или в значениях атрибутов)."""
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("{", "&#123;").replace("}", "&#125;")


def jsx_text(s: str) -> str:
    """Экранирует строку для использования внутри JSX-текста."""
    return s.replace("{", "&#123;").replace("}", "&#125;").replace("<", "&lt;").replace(">", "&gt;")


def next_cb_id() -> str:
    cb_counter[0] += 1
    return f"cb{cb_counter[0]}"


def next_fld_id() -> str:
    fld_counter[0] += 1
    return f"fld{fld_counter[0]}"


def format_inline(t: str) -> str:
    """Конвертирует inline markdown → JSX-фрагменты. Возвращает строку JSX-кода."""
    # Поля _____ заменяем на компонент <Fld>
    def fld_repl(m):
        return f"{{f('{next_fld_id()}')}}"

    parts = []
    i = 0
    while i < len(t):
        # Подчёркивания (поле)
        m = re.match(r"_{3,}", t[i:])
        if m:
            parts.append(fld_repl(m))
            i += len(m.group(0))
            continue
        # Жирный
        m = re.match(r"\*\*(.+?)\*\*", t[i:])
        if m:
            parts.append(f"<b>{jsx_text(m.group(1))}</b>")
            i += len(m.group(0))
            continue
        # Курсив
        m = re.match(r"(?<!\*)\*([^*]+)\*(?!\*)", t[i:])
        if m:
            parts.append(f"<i>{jsx_text(m.group(1))}</i>")
            i += len(m.group(0))
            continue
        # Inline code
        m = re.match(r"`([^`]+)`", t[i:])
        if m:
            parts.append(f"<code>{jsx_text(m.group(1))}</code>")
            i += len(m.group(0))
            continue
        # Ссылки
        m = re.match(r"\[([^\]]+)\]\(([^)]+)\)", t[i:])
        if m:
            parts.append(f'<a href="{m.group(2)}" target="_blank" rel="noopener noreferrer">{jsx_text(m.group(1))}</a>')
            i += len(m.group(0))
            continue
        # Обычный символ
        ch = t[i]
        if ch == "{":
            parts.append("&#123;")
        elif ch == "}":
            parts.append("&#125;")
        elif ch == "<":
            parts.append("&lt;")
        elif ch == ">":
            parts.append("&gt;")
        else:
            parts.append(ch)
        i += 1
    return "".join(parts)


def md_to_tsx(md: str) -> str:
    out = []
    lines = md.split("\n")
    in_table = False
    in_frontmatter = False
    fm_seen = False
    i = 0

    while i < len(lines):
        line = lines[i]

        # Frontmatter (--- ... ---)
        if not fm_seen and line.strip() == "---" and i == 0:
            in_frontmatter = True
            fm_seen = True
            i += 1
            continue
        if in_frontmatter:
            if line.strip() == "---":
                in_frontmatter = False
            i += 1
            continue

        # Чекбокс
        m = re.match(r"^\s*-?\s*\[( |x|X)\]\s+(.+)$", line)
        if m:
            if in_table:
                out.append("</tbody></table></div>")
                in_table = False
            cb_id = next_cb_id()
            label = format_inline(m.group(2))
            out.append(f"<Cb id='{cb_id}'>{label}</Cb>")
            i += 1
            continue

        # Таблица
        if "|" in line and line.strip().startswith("|"):
            if not in_table:
                # Заголовок таблицы — следующая строка должна быть разделителем
                if i + 1 < len(lines) and re.match(r"^\s*\|?[\s|:\-]+\|?\s*$", lines[i + 1]):
                    in_table = True
                    cells = [c.strip() for c in line.strip().strip("|").split("|")]
                    out.append('<div className="tbl-wrap"><table><thead><tr>')
                    for c in cells:
                        out.append(f"<th>{format_inline(c)}</th>")
                    out.append("</tr></thead><tbody>")
                    i += 2  # пропускаем разделитель
                    continue
            if in_table:
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                out.append("<tr>")
                for c in cells:
                    if c == "":
                        # Пустая ячейка → поле
                        out.append(f"<td>{{f('{next_fld_id()}')}}</td>")
                    else:
                        out.append(f"<td>{format_inline(c)}</td>")
                out.append("</tr>")
                i += 1
                continue

        # Если были в таблице и строка не табличная — закрыть
        if in_table:
            out.append("</tbody></table></div>")
            in_table = False

        # Заголовки
        if line.startswith("#### "):
            out.append(f"<h4>{format_inline(line[5:])}</h4>")
        elif line.startswith("### "):
            out.append(f"<h3>{format_inline(line[4:])}</h3>")
        elif line.startswith("## "):
            out.append(f"<h2>{format_inline(line[3:])}</h2>")
        elif line.startswith("# "):
            out.append(f"<h1>{format_inline(line[2:])}</h1>")
        elif line.startswith("> "):
            out.append(f"<blockquote>{format_inline(line[2:])}</blockquote>")
        elif line.strip() == "---":
            out.append("<hr/>")
        elif re.match(r"^\s*-\s+", line):
            m2 = re.match(r"^\s*-\s+(.+)$", line)
            out.append(f'<p className="bullet">• {format_inline(m2.group(1))}</p>')
        elif re.match(r"^\d+\.\s+", line):
            m2 = re.match(r"^(\d+)\.\s+(.+)$", line)
            out.append(f'<p className="bullet">{m2.group(1)}. {format_inline(m2.group(2))}</p>')
        elif line.strip() == "":
            pass
        else:
            out.append(f"<p>{format_inline(line)}</p>")

        i += 1

    if in_table:
        out.append("</tbody></table></div>")

    return "\n      ".join(out)


def main():
    md = SRC.read_text(encoding="utf-8")
    body = md_to_tsx(md)

    tsx = f"""// AUTO-GENERATED from {SRC.name}. Не редактировать вручную — пересобрать через scripts/md-to-tsx.py
import {{ Cb, Fld }} from '../QuestionnaireFields';
import type {{ ReactNode }} from 'react';

export const POLINA_CB_COUNT = {cb_counter[0]};
export const POLINA_FLD_COUNT = {fld_counter[0]};

export function PolinaContent({{ f }}: {{ f: (id: string) => ReactNode }}) {{
  return (
    <>
      {body}
    </>
  );
}}
"""

    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(tsx, encoding="utf-8")
    print(f"OK: {DST}")
    print(f"Чекбоксов: {cb_counter[0]}")
    print(f"Полей ввода: {fld_counter[0]}")


if __name__ == "__main__":
    main()
