-- Adds real product photos (reviewed individually — no third-party
-- branding, no identifiable real people, no other business's watermark)
-- for 17 cakes that were showing "Image Coming Soon". Matches products by
-- slug, so this only affects products that already exist.
--
-- Idempotent — clears existing images for these slugs before inserting,
-- safe to re-run.

do $$
declare
  pid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('vanilla-cake', '/images/products/cakes/vanilla-cake/1.jpg'),
      ('pineapple-cake', '/images/products/cakes/pineapple-cake/1.jpg'),
      ('butterscotch-cake', '/images/products/cakes/butterscotch-cake/1.jpg'),
      ('black-forest-cake', '/images/products/cakes/black-forest-cake/1.jpg'),
      ('chocolate-cake', '/images/products/cakes/chocolate-cake/1.jpg'),
      ('dark-truffle-cake', '/images/products/cakes/dark-truffle-cake/1.jpg'),
      ('red-velvet-cake', '/images/products/cakes/red-velvet-cake/1.jpg'),
      ('rasmalai-cake', '/images/products/cakes/rasmalai-cake/1.jpg'),
      ('bento-cake', '/images/products/cakes/bento-cake/1.jpg'),
      ('cheesecake', '/images/products/cakes/cheesecake/1.jpg'),
      ('chocolate-truffle-cake', '/images/products/cakes/chocolate-truffle-cake/1.jpg'),
      ('coffee-cake', '/images/products/cakes/coffee-cake/1.jpg'),
      ('dry-fruit-cake', '/images/products/cakes/dry-fruit-cake/1.jpg'),
      ('kesar-pista-cake', '/images/products/cakes/kesar-pista-cake/1.jpg'),
      ('mango-cake', '/images/products/cakes/mango-cake/1.jpg'),
      ('strawberry-cake', '/images/products/cakes/strawberry-cake/1.jpg'),
      ('white-forest-cake', '/images/products/cakes/white-forest-cake/1.jpg')
    ) as t(slug, url)
  loop
    select id into pid from products where slug = rec.slug;
    if pid is not null then
      delete from product_images where product_id = pid;
      insert into product_images (product_id, url, sort_order) values (pid, rec.url, 0);
    end if;
  end loop;
end $$;
