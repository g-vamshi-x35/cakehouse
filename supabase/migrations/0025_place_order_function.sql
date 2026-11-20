-- Let the website place orders with only the public (publishable) key, so
-- online ordering works without SUPABASE_SERVICE_ROLE_KEY being configured.
--
-- Security is kept by doing the sensitive work inside the database:
--   * the item price comes from products / product_weight_options, never
--     from the caller;
--   * coupon discounts are validated here and capped at the subtotal;
--   * customer_id is always the signed-in user (auth.uid()), or null for a
--     guest - a caller can't attach an order to someone else;
--   * customers still have no direct insert/update rights on orders.
-- The delivery charge is computed by the website from the address; here it
-- is only clamped to a sane range (0-500).

create or replace function public.place_quick_order(
  p_product_id uuid,
  p_weight_label text,
  p_flavour text,
  p_custom_message text,
  p_qty integer,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_instructions text,
  p_event_date date,
  p_event_time time,
  p_payment_method text,
  p_coupon_code text,
  p_delivery_charge numeric,
  p_distance_km numeric,
  p_lat numeric,
  p_lng numeric
)
returns table (order_id uuid, order_number text, total numeric, advance_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products%rowtype;
  v_has_weights boolean;
  v_unit numeric;
  v_subtotal numeric;
  v_discount numeric := 0;
  v_coupon coupons%rowtype;
  v_coupon_id uuid;
  v_delivery numeric;
  v_total numeric;
  v_advance numeric;
  v_uid uuid := auth.uid();
  v_email text;
  v_is_qr boolean := coalesce(p_payment_method, '') = 'qr_manual';
  v_order orders%rowtype;
begin
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Please fill in your name, phone number and delivery address.';
  end if;
  if p_qty is null or p_qty < 1 or p_qty > 50 then
    raise exception 'Quantity must be between 1 and 50.';
  end if;

  select * into v_product from products where id = p_product_id and is_active;
  if not found then
    raise exception 'This item is no longer available.';
  end if;

  select exists (select 1 from product_weight_options where product_id = v_product.id) into v_has_weights;
  if v_has_weights then
    select w.price into v_unit
    from product_weight_options w
    where w.product_id = v_product.id and w.label = p_weight_label
    limit 1;
    if v_unit is null then
      raise exception 'Please choose a valid size for this item.';
    end if;
  else
    v_unit := coalesce(v_product.price_500, v_product.base_price);
  end if;
  if v_unit is null or v_unit <= 0 then
    raise exception 'This item can''t be ordered online right now.';
  end if;

  v_subtotal := v_unit * p_qty;

  if coalesce(trim(p_coupon_code), '') <> '' then
    select * into v_coupon from coupons where code = upper(trim(p_coupon_code));
    if found
       and v_coupon.active
       and v_subtotal >= v_coupon.min_order_amount
       and (v_coupon.expires_at is null or v_coupon.expires_at > now())
       and (v_coupon.max_uses is null or v_coupon.used_count < v_coupon.max_uses) then
      v_discount := least(
        v_subtotal,
        case when v_coupon.discount_type = 'percent'
          then round(v_subtotal * v_coupon.discount_value / 100)
          else v_coupon.discount_value
        end
      );
      v_coupon_id := v_coupon.id;
    end if;
  end if;

  v_delivery := least(greatest(coalesce(p_delivery_charge, 0), 0), 500);
  v_total := greatest(v_subtotal - v_discount, 0) + v_delivery;
  v_advance := least(100, v_total);

  if v_uid is not null then
    select email into v_email from auth.users where id = v_uid;
  end if;

  insert into orders (
    customer_id, customer_name, customer_phone, customer_email, delivery_address,
    delivery_instructions, event_date, event_time, subtotal, discount, coupon_id,
    total, advance_amount, payment_method, payment_status, order_status,
    delivery_charge, delivery_distance_km, delivery_lat, delivery_lng
  ) values (
    v_uid, trim(p_customer_name), trim(p_phone), v_email, trim(p_address),
    nullif(trim(coalesce(p_instructions, '')), ''), p_event_date, p_event_time,
    v_subtotal, v_discount, v_coupon_id, v_total, v_advance,
    (case when v_is_qr then 'qr_manual' else 'razorpay' end)::payment_method,
    (case when v_is_qr then 'advance_pending' else 'unpaid' end)::payment_status,
    'pending',
    v_delivery, p_distance_km, p_lat, p_lng
  )
  returning * into v_order;

  insert into order_items (
    order_id, product_id, product_name, weight_label, flavour, custom_message,
    quantity, unit_price, line_total
  ) values (
    v_order.id, v_product.id, v_product.name, nullif(p_weight_label, ''), nullif(p_flavour, ''),
    nullif(trim(coalesce(p_custom_message, '')), ''), p_qty, v_unit, v_subtotal
  );

  if v_coupon_id is not null then
    update coupons set used_count = used_count + 1 where id = v_coupon_id;
  end if;

  if v_uid is not null then
    insert into notifications (user_id, title, body, type)
    values (
      v_uid,
      'Order #' || v_order.order_number || ' placed',
      'Your order for ₹' || v_total || ' has been received. We''ll keep you posted as it moves along.',
      'order'
    );
  end if;

  return query select v_order.id, v_order.order_number, v_order.total, v_order.advance_amount;
end;
$$;

revoke all on function public.place_quick_order(uuid, text, text, text, integer, text, text, text, text, date, time, text, text, numeric, numeric, numeric, numeric) from public;
grant execute on function public.place_quick_order(uuid, text, text, text, integer, text, text, text, text, date, time, text, text, numeric, numeric, numeric, numeric) to anon, authenticated;

-- Order confirmation page for guests: read one order by its unguessable id
-- (the id is only ever shown to the person who placed it).
create or replace function public.get_order_confirmation(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'total', o.total,
    'advance_amount', o.advance_amount,
    'delivery_address', o.delivery_address,
    'delivery_charge', o.delivery_charge,
    'delivery_distance_km', o.delivery_distance_km,
    'event_date', o.event_date,
    'payment_status', o.payment_status,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', i.product_name,
        'weight_label', i.weight_label,
        'flavour', i.flavour,
        'quantity', i.quantity
      ))
      from order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from orders o
  where o.id = p_order_id;
$$;

revoke all on function public.get_order_confirmation(uuid) from public;
grant execute on function public.get_order_confirmation(uuid) to anon, authenticated;
