-- Adds a short, human-friendly product code (e.g. "CH-0001") for the owner
-- dashboard's Products list — separate from the internal UUID id. Mirrors
-- the same sequence + trigger pattern already used for orders.order_number.

create sequence if not exists product_sku_seq start 1;

alter table products add column if not exists sku text unique;

create or replace function public.generate_product_sku()
returns trigger
language plpgsql
as $$
begin
  if new.sku is null then
    new.sku := 'CH-' || lpad(nextval('product_sku_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_product_sku on products;
create trigger set_product_sku
  before insert on products
  for each row execute function public.generate_product_sku();

-- Backfill existing products (creation order, so older products get the
-- lower numbers) — safe to re-run, only touches rows still missing a sku.
do $$
declare
  rec record;
begin
  for rec in select id from products where sku is null order by created_at asc
  loop
    update products set sku = 'CH-' || lpad(nextval('product_sku_seq')::text, 4, '0') where id = rec.id;
  end loop;
end $$;
