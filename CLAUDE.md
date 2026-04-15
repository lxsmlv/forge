@AGENTS.md
@/Users/alexsamoilov/ObsidianVault/ClaudeMemory/projects/forge.md

# Forge — project-level overrides (pet scope)

Глобальные правила из `~/.claude/CLAUDE.md` заточены под рабочие проекты (ts-up/core-service/query-service и т.п.). Для Forge применяются следующие переопределения:

## Что переопределяется

- **Формат коммитов:** conventional (`feat(feed):`, `design:`, `fix(auth):`). НЕ `OP#XXXXXX:`.
- **Ветки:** работаем напрямую в `main`. Никаких `OP-DRAFT`/`OP-XXXXXX` веток.
- **GitLab wiki / релиз-ветки / базы Росатома:** неприменимо.
- **JSDoc:** необязателен для небольших React-компонентов (оставляем только когда логика нетривиальна).

## Что СОХРАНЯЕТСЯ из глобального

- **Никаких AI-упоминаний** в коммитах, MR, комментариях, любом публичном контенте. Это правило абсолютно.
- **Ответы пользователю на русском.**
- **Работа с памятью через Obsidian vault** — всё структурное кладётся в `ObsidianVault/ClaudeMemory/`, не в `MEMORY.md`, не во встроенную память Claude.

## Роутинг: куда что класть в Forge

| Тип информации | Куда |
|----------------|------|
| Видение продукта, манифест | `Obsidian/projects/forge.md` (неизменное ядро) |
| Текущее состояние, что в работе | `Obsidian/projects/forge.md` секция «Current state» |
| Дизайн-спека под новую фичу | `docs/superpowers/specs/YYYY-MM-DD-<тема>-design.md` в репо |
| План имплементации | `docs/superpowers/plans/YYYY-MM-DD-<тема>.md` в репо |
| Архитектурное решение (ADR) | `Obsidian/decisions/YYYY-MM-DD-<тема>.md` |
| Фидбек Алекса о методе работы | `Obsidian/feedback/<тема>.md` |
| Термин предметной области | `Obsidian/glossary/<термин>.md` |
| Личный контекст (бро, коллеги) | `Obsidian/people/<имя>.md` |
| Код, конфиги, типы | репо (обычные места) |

## Ритуал конца сессии

Перед финальным коммитом я обновляю `Current state` в `Obsidian/projects/forge.md` — чем кончили, что в работе, что блокирует. Обновление занимает 1 правку, без этого сессия считается незавершённой.

## Спеки и планы — на русском

Все спеки в `docs/superpowers/specs/` и планы в `docs/superpowers/plans/` — на русском (см. `Obsidian/feedback/specs-in-russian.md`). Commit-messages — по-прежнему на английском.
