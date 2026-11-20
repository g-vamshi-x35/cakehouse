-- Fill "Image Coming Soon" items with the closest existing photo:
-- customized cakes use the bakery's own photos (gallery / menu), mini cakes
-- use the same-flavour cake photo, mini bentos use the bento photo, and the
-- remaining pizzas reuse the nearest pizza photo. Only fills products that
-- have no photo yet, so owner-uploaded photos are never replaced.

do $$
declare
  pid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('spiderman-cake', '/images/hero/hero-spiderman-cake.jpg'),
      ('princess-cake', '/images/gallery/gallery-04.jpg'),
      ('cartoon-cake', '/images/gallery/gallery-02.jpg'),
      ('car-bike-cake', '/images/menu/menu-car-cake.jpg'),
      ('mixed-fruit-cake', '/images/menu/menu-fruit-cake.jpg'),
      ('mini-vanilla-cake', '/images/products/cakes/vanilla-cake/2.jpg'),
      ('mini-pineapple-cake', '/images/products/cakes/pineapple-cake/2.jpg'),
      ('mini-black-forest-cake', '/images/products/cakes/black-forest-cake/2.jpg'),
      ('mini-chocolate-cake', '/images/products/cakes/chocolate-cake/2.jpg'),
      ('mini-red-velvet-cake', '/images/products/cakes/red-velvet-cake/2.jpg'),
      ('mini-chocolate-bento', '/images/products/cakes/bento-cake/1.jpg'),
      ('mini-red-velvet-bento', '/images/products/cakes/bento-cake/1.jpg'),
      ('mini-oreo-bento', '/images/products/cakes/bento-cake/1.jpg'),
      ('veg-pizza', '/images/products/pizza/sweetcorn-pizza/1.jpg'),
      ('farm-fresh-pizza', '/images/products/pizza/sweetcorn-pizza/1.jpg'),
      ('margherita-pizza', '/images/products/pizza/cheese-pizza/1.jpg'),
      ('cheese-burst-pizza', '/images/products/pizza/cheese-pizza/1.jpg'),
      ('large-pizza', '/images/products/pizza/onion-pizza/1.jpg'),
      ('mushroom-pizza', '/images/products/pizza/paneer-pizza/1.jpg')
    ) as t(slug, url)
  loop
    select id into pid from products where slug = rec.slug;
    if pid is not null and not exists (select 1 from product_images where product_id = pid) then
      insert into product_images (product_id, url, sort_order) values (pid, rec.url, 0);
    end if;
  end loop;
end $$;
