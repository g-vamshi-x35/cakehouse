-- Photos for items that showed "Image Coming Soon": Ferrero Rocher cake
-- and the Cheese, Onion, Sweetcorn and Paneer pizzas. Only fills products
-- that have no photo yet, so an owner-uploaded photo is never replaced.

do $$
declare
  pid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('ferrero-rocher-cake', '/images/products/cakes/ferrero-rocher-cake/1.jpg'),
      ('cheese-pizza', '/images/products/pizza/cheese-pizza/1.jpg'),
      ('onion-pizza', '/images/products/pizza/onion-pizza/1.jpg'),
      ('sweetcorn-pizza', '/images/products/pizza/sweetcorn-pizza/1.jpg'),
      ('paneer-pizza', '/images/products/pizza/paneer-pizza/1.jpg')
    ) as t(slug, url)
  loop
    select id into pid from products where slug = rec.slug;
    if pid is not null and not exists (select 1 from product_images where product_id = pid) then
      insert into product_images (product_id, url, sort_order) values (pid, rec.url, 0);
    end if;
  end loop;
end $$;
