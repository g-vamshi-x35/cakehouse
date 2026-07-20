-- Storage bucket for custom-cake inspiration images (and future uploads).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "uploads_public_read" on storage.objects for select
  using (bucket_id = 'uploads');

create policy "uploads_authenticated_insert" on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "uploads_owner_delete" on storage.objects for delete
  using (bucket_id = 'uploads' and owner = auth.uid());
