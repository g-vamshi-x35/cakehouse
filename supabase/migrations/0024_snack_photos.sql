-- Photos supplied by the owner for Samosa, the four patties and Cheese
-- Burst pizza. Fills products with no photo; Cheese Burst also replaces the
-- shared Cheese pizza photo it was given in 0023. Owner-uploaded photos
-- (any other URL) are never replaced.

do $$
declare
  pid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('samosa', '/images/products/snacks/samosa/1.jpg'),
      ('veg-patties', '/images/products/snacks/veg-patties/1.jpg'),
      ('aloo-patties', '/images/products/snacks/veg-patties/1.jpg'),
      ('paneer-patties', '/images/products/snacks/paneer-patties/1.jpg'),
      ('mushroom-patties', '/images/products/snacks/paneer-patties/1.jpg'),
      ('cheese-burst-pizza', '/images/products/pizza/cheese-burst-pizza/1.jpg')
    ) as t(slug, url)
  loop
    select id into pid from products where slug = rec.slug;
    if pid is null then continue; end if;
    delete from product_images
      where product_id = pid and url = '/images/products/pizza/cheese-pizza/1.jpg' and rec.slug = 'cheese-burst-pizza';
    if not exists (select 1 from product_images where product_id = pid) then
      insert into product_images (product_id, url, sort_order) values (pid, rec.url, 0);
    end if;
  end loop;
end $$;
