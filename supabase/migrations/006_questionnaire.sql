-- Анкеты клиентов (для одностраничного сайта на forgeclub.app)
-- Доступ — публичный, защита только через знание UUID в URL

create extension if not exists pgcrypto;

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  client_label text not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.questionnaires enable row level security;

drop policy if exists "Public read by id" on public.questionnaires;
create policy "Public read by id"
  on public.questionnaires
  for select
  using (true);

drop policy if exists "Public update by id" on public.questionnaires;
create policy "Public update by id"
  on public.questionnaires
  for update
  using (true)
  with check (true);

-- Полина (бизнес-план соцконтракта для груминг-студии)
insert into public.questionnaires (id, client_label)
values ('a7b9c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Полина — соцконтракт груминг-студии')
on conflict (id) do nothing;
