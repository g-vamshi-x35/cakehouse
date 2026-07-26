-- Delivery dashboard schema: online/offline status, per-order delivery
-- assignment/charge/distance/location, cash-collection tracking, and an
-- internal (non-customer-facing) delivery rating/note.
--
-- Run this AFTER 0016_add_delivery_role.sql has been committed separately.

alter table profiles add column if not exists is_online boolean not null default false;

alter table orders add column if not exists assigned_delivery_id uuid references profiles(id);
alter table orders add column if not exists delivery_charge numeric(10,2) not null default 0;
alter table orders add column if not exists delivery_distance_km numeric(6,2);
alter table orders add column if not exists delivery_lat numeric;
alter table orders add column if not exists delivery_lng numeric;
alter table orders add column if not exists delivery_rating int check (delivery_rating between 1 and 5);
alter table orders add column if not exists delivery_notes text;
alter table orders add column if not exists cash_collected boolean not null default false;

-- Additive policies only (Postgres OR's multiple permissive policies on the
-- same table/command together), so these can't break the existing
-- customer/staff access rules already in place.

create policy "orders_select_delivery" on orders for select
  using (assigned_delivery_id = auth.uid());

create policy "orders_update_delivery" on orders for update
  using (assigned_delivery_id = auth.uid())
  with check (assigned_delivery_id = auth.uid());

create policy "order_items_select_delivery" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and o.assigned_delivery_id = auth.uid()
    )
  );
