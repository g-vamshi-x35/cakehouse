-- No-auth-required mode: let anonymous visitors submit reviews (matching
-- orders/custom_cake_requests/contact_messages, which already allow guest
-- inserts). Reviews need a display name when there's no logged-in profile
-- to pull one from.

alter table reviews add column if not exists guest_name text;

drop policy if exists "reviews_insert_own" on reviews;
create policy "reviews_insert_own" on reviews for insert
  with check (customer_id = auth.uid() or customer_id is null);

-- Guest orders (customer_id is null) need to be readable right after
-- checkout on the confirmation/tracking page, without a session.
drop policy if exists "orders_select" on orders;
create policy "orders_select" on orders for select
  using (customer_id = auth.uid() or customer_id is null or public.is_staff());

drop policy if exists "order_items_select" on order_items;
create policy "order_items_select" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or o.customer_id is null or public.is_staff())
    )
  );

drop policy if exists "payments_select" on payments;
create policy "payments_select" on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or o.customer_id is null or public.is_staff())
    )
  );
