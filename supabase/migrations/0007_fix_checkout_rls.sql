-- Fix RLS across the rest of the checkout pipeline (order_items + payments),
-- and add a narrow owner-write exception on orders/payments so the Razorpay
-- verify callback can mark a guest/customer's own order as paid.
--
-- Trust model: /api/payments/verify cryptographically checks the Razorpay
-- signature server-side BEFORE it ever runs these updates. RLS here only
-- confirms the row being touched belongs to the order being paid for — the
-- same "own row" concept already used for orders_select (see 0006).
--
-- Safe to re-run: every policy is dropped (if it exists) before being recreated.

-- order_items -----------------------------------------------------------
drop policy if exists "order_items_select" on order_items;
drop policy if exists "order_items_insert" on order_items;

create policy "order_items_select" on order_items for select
  using (exists (
    select 1 from orders o
    where o.id = order_id and (public.is_staff() or o.customer_id = auth.uid() or o.customer_id is null)
  ));

create policy "order_items_insert" on order_items for insert
  with check (exists (
    select 1 from orders o
    where o.id = order_id and (o.customer_id = auth.uid() or o.customer_id is null)
  ));

-- payments ----------------------------------------------------------------
drop policy if exists "payments_select" on payments;
drop policy if exists "payments_staff_write" on payments;
drop policy if exists "payments_insert" on payments;
drop policy if exists "payments_update_own_or_admin" on payments;
drop policy if exists "payments_delete_admin" on payments;

create policy "payments_select" on payments for select
  using (exists (
    select 1 from orders o
    where o.id = order_id and (public.is_staff() or o.customer_id = auth.uid() or o.customer_id is null)
  ));

create policy "payments_insert" on payments for insert
  with check (exists (
    select 1 from orders o
    where o.id = order_id and (o.customer_id = auth.uid() or o.customer_id is null)
  ));

create policy "payments_update_own_or_admin" on payments for update
  using (public.is_staff() or exists (
    select 1 from orders o
    where o.id = order_id and (o.customer_id = auth.uid() or o.customer_id is null)
  ))
  with check (public.is_staff() or exists (
    select 1 from orders o
    where o.id = order_id and (o.customer_id = auth.uid() or o.customer_id is null)
  ));

create policy "payments_delete_admin" on payments for delete
  using (public.is_staff());

-- orders: add a narrow owner-write exception on top of the admin policy ---
drop policy if exists "orders_update_own_payment" on orders;

create policy "orders_update_own_payment" on orders for update
  using (customer_id = auth.uid() or customer_id is null)
  with check (customer_id = auth.uid() or customer_id is null);
