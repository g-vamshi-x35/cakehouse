-- The existing "notifications_staff_insert" policy only allows
-- owner/employee (is_staff()) to write notifications for other users —
-- a delivery-role account couldn't notify the owner when a delivery is
-- completed. Additive policy, same pattern as the delivery order access
-- added in 0017 (Postgres OR's multiple permissive policies together).

create policy "notifications_delivery_insert" on notifications for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'delivery')
  );
