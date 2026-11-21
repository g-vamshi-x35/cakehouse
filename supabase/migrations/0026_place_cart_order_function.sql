-- Multi-item checkout for the mobile app's shopping cart.
--
-- Additive only: place_quick_order (used by the website) is unchanged.
-- Same security model as 0025_place_order_function.sql:
--   * every unit price is read from products / product_weight_options,
--     never trusted from the caller;
--   * coupons are validated here and capped at the subtotal;
--   * customer_id is always auth.uid() (or null for a guest);
--   * customers keep no direct insert/update rights on orders.
--
-- p_items is a JSON array of
--   { "product_id": uuid, "weight_label": text, "flavour": text,
--     "custom_message": text, "qty": int }

create or replace function public.place_cart_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_instructions text,
  p_event_date date,
  p_event_time time,
  p_payment_method text,
  p_coupon_code text,
  p_delivery_charge numeric
)
returns table (order_id uuid, order_number text, total numeric, advance_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product products%rowtype;
  v_has_weights boolean;
  v_unit numeric;
  v_qty integer;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
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
  v_count integer := 0;
begin
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Please fill in your name, phone number and delivery address.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'Please order at most 20 different items at once.';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'qty')::integer, 0);
    if v_qty < 1 or v_qty > 50 then
      raise exception 'Quantity must be between 1 and 50.';
    end if;

    select * into v_product from products where id = (v_item->>'product_id')::uuid and is_active;
    if not found then
      raise exception 'This item is no longer available.';
    end if;

    select exists (select 1 from product_weight_options where product_id = v_product.id) into v_has_weights;
    v_unit := null;
    if v_has_weights then
      select w.price into v_unit
      from product_weight_options w
      where w.product_id = v_product.id and w.label = coalesce(v_item->>'weight_label', '')
      limit 1;
      if v_unit is null then
        raise exception 'Please choose a valid size for %.', v_product.name;
      end if;
    else
      v_unit := coalesce(v_product.price_500, v_product.base_price);
    end if;
    if v_unit is null or v_unit <= 0 then
      raise exception 'This item can''t be ordered online right now.';
    end if;

    v_subtotal := v_subtotal + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'weight_label', nullif(coalesce(v_item->>'weight_label', ''), ''),
      'flavour', nullif(coalesce(v_item->>'flavour', ''), ''),
      'custom_message', nullif(trim(coalesce(v_item->>'custom_message', '')), ''),
      'qty', v_qty,
      'unit', v_unit
    );
    v_count := v_count + 1;
  end loop;

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
    total, advance_amount, payment_method, payment_status, order_status, delivery_charge
  ) values (
    v_uid, trim(p_customer_name), trim(p_phone), v_email, trim(p_address),
    nullif(trim(coalesce(p_instructions, '')), ''), p_event_date, p_event_time,
    v_subtotal, v_discount, v_coupon_id, v_total, v_advance,
    (case when v_is_qr then 'qr_manual' else 'cod' end)::payment_method,
    (case when v_is_qr then 'advance_pending' else 'unpaid' end)::payment_status,
    'pending', v_delivery
  )
  returning * into v_order;

  insert into order_items (
    order_id, product_id, product_name, weight_label, flavour, custom_message,
    quantity, unit_price, line_total
  )
  select v_order.id, (l->>'product_id')::uuid, l->>'product_name', l->>'weight_label', l->>'flavour',
         l->>'custom_message', (l->>'qty')::integer, (l->>'unit')::numeric,
         (l->>'unit')::numeric * (l->>'qty')::integer
  from jsonb_array_elements(v_lines) l;

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

revoke all on function public.place_cart_order(jsonb, text, text, text, text, date, time, text, text, numeric) from public;
grant execute on function public.place_cart_order(jsonb, text, text, text, text, date, time, text, text, numeric) to anon, authenticated;
