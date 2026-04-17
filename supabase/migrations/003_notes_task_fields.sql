ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_task boolean DEFAULT false;
