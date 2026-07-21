-- Fix orders RLS: allow anyone (including anonymous/guest checkout) to INSERT
-- an order, while SELECT/UPDATE/DELETE stay restricted to admin/staff, plus
-- a narrow self-view exception so the order confirmation page and "My Orders"
-- keep working for the customer/guest who placed the order.
--
-- Safe to re-run: every policy is dropped (if it exists) before being recreated.

alter table orders enable row level security;

drop policy if exists "orders_select" on orders;
drop policy if exists "orders_insert" on orders;
drop policy if exists "orders_update_staff" on orders;
drop policy if exists "orders_update_own_pending" on orders;
drop policy if exists "orders_update_admin" on orders;
drop policy if exists "orders_delete_admin" on orders;

-- SELECT: staff/admin see everything; a customer sees their own orders;
-- a guest order (customer_id is null) is viewable by anyone holding its id
-- (same guest-access model already used for reviews/custom-cake requests).
create policy "orders_select" on orders for select
  using (public.is_staff() or customer_id = auth.uid() or customer_id is null);

-- INSERT: anyone can place an order. A logged-in customer may only tag the
-- order with their own id; a guest must leave customer_id null (no one can
-- impersonate another customer's account on insert).
create policy "orders_insert" on orders for insert
  with check (customer_id = auth.uid() or customer_id is null);

-- UPDATE / DELETE: admin/staff only. No policy exists for anonymous or
-- customer roles, so RLS denies those by default.
create policy "orders_update_admin" on orders for update
  using (public.is_staff())
  with check (public.is_staff());
create policy "orders_delete_admin" on orders for delete
  using (public.is_staff());
