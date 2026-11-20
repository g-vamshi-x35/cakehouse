-- Two more guards for requests made straight to the public API:
--
-- 1. The "orders_update_delivery" policy let a delivery-role user update ANY
--    column of an order assigned to them (total, payment status, customer
--    address...). They may now only change the delivery fields the delivery
--    dashboard actually uses, and only to delivery statuses.
-- 2. Anyone could insert/update a review with is_verified = true and get a
--    "Verified purchase" badge. Verification is now computed by the
--    database from the reviewer's own delivered orders.

create or replace function public.guard_delivery_order_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  allowed constant text[] := array['order_status','cash_collected','delivery_rating','delivery_notes','updated_at'];
begin
  -- Staff (owner/employee) and the server's service role are unrestricted.
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') or public.is_staff() then
    return new;
  end if;

  if (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
    raise exception 'Delivery staff can only update delivery status, cash collected and delivery notes';
  end if;

  if new.order_status is distinct from old.order_status
     and new.order_status not in ('out_for_delivery', 'delivered', 'cancelled') then
    raise exception 'Delivery staff can only set an order to out for delivery, delivered or cancelled';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_guard_delivery_update on orders;
create trigger orders_guard_delivery_update
  before update on orders
  for each row execute function public.guard_delivery_order_update();

create or replace function public.set_review_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Staff and the service role may set the flag themselves (moderation).
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') or public.is_staff() then
    return new;
  end if;

  new.is_verified := new.customer_id is not null
    and new.customer_id = auth.uid()
    and exists (
      select 1
      from order_items oi
      join orders o on o.id = oi.order_id
      where oi.product_id = new.product_id
        and o.customer_id = new.customer_id
        and o.order_status = 'delivered'
    );
  return new;
end;
$$;

drop trigger if exists reviews_set_verification on reviews;
create trigger reviews_set_verification
  before insert or update on reviews
  for each row execute function public.set_review_verification();
