-- Live updates for the mobile app:
--   * staff get a bell + notification the moment a customer places an order;
--   * customers see their order-tracking messages appear instantly.
--
-- Supabase Realtime only sends a row change to users whose Row Level
-- Security policies allow them to read that row, so customers still only
-- receive their own orders / notifications and staff see what they already
-- can in the dashboards. Nothing else changes for the website.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
