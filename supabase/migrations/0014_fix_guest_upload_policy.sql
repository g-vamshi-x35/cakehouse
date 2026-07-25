-- The Custom Cake request form is guest-friendly (no login required —
-- custom_cake_requests already has a guest insert policy), but the
-- inspiration-photo upload was still blocked for anonymous visitors
-- because storage.objects only allowed authenticated inserts into the
-- 'uploads' bucket. This is why guests hit "Couldn't upload that image"
-- when they attach a photo without being logged in.
--
-- Scoped to the custom-cakes/ path specifically rather than opening the
-- whole bucket to anonymous uploads, since other upload paths may want
-- to stay authenticated-only in future.

drop policy if exists "uploads_authenticated_insert" on storage.objects;

create policy "uploads_insert" on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (
      auth.role() = 'authenticated'
      or (auth.role() = 'anon' and name like 'custom-cakes/%')
    )
  );
