-- Ensure messages and notifications tables have FULL replica identity for realtime events.
-- Default REPLICA IDENTITY only logs the primary key on UPDATE/DELETE, which can cause
-- Supabase Realtime to omit payload.old / some fields. FULL logs the full row.

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Publication already includes messages and notifications; verify by running:
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname='supabase_realtime';
