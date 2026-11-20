-- Security hardening. Fixes three holes that were reachable with nothing but
-- the public (publishable/anon) key every visitor's browser already has:
--
-- 1. Any signed-in customer could PATCH their own profiles row and set
--    role = 'owner', gaining the full owner dashboard.
-- 2. Every guest order (customer_id is null) was readable by anyone —
--    names, phone numbers and delivery addresses of all guest customers.
-- 3. Guest orders and their payments were updatable by anyone, so an order
--    could be marked paid/confirmed or have its total changed directly.
--
-- Orders, order items and payments are now written only by the server
-- (service-role client, after it has validated prices and payments), and
-- customers can read only their own orders. The guest confirmation page
-- reads its order server-side by its unguessable UUID.

-- 1. Role changes: only an owner (or the server's service role) may change
--    a profile's role. Everyone may still edit their own name/phone/etc.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Only requests coming through the public API as a regular visitor or
  -- signed-in user are restricted; the service role (server) and direct
  -- database/SQL-editor sessions are not.
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') in ('anon', 'authenticated')
     and not public.is_owner() then
    raise exception 'Not allowed to change role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on profiles;
create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function public.prevent_role_self_escalation();

-- 2 & 3. Orders: read own or staff; no direct inserts/updates by customers.
drop policy if exists "orders_select" on orders;
create policy "orders_select" on orders for select
  using (customer_id = auth.uid() or public.is_staff());

drop policy if exists "orders_insert" on orders;
drop policy if exists "orders_update_own_payment" on orders;

drop policy if exists "order_items_select" on order_items;
create policy "order_items_select" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or public.is_staff())
    )
  );

drop policy if exists "order_items_insert" on order_items;

drop policy if exists "payments_select" on payments;
create policy "payments_select" on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or public.is_staff())
    )
  );

drop policy if exists "payments_insert" on payments;
drop policy if exists "payments_update_own_or_admin" on payments;
drop policy if exists "payments_update_staff" on payments;
create policy "payments_update_staff" on payments for update
  using (public.is_staff())
  with check (public.is_staff());
