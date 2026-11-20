-- New product photos in one consistent style: simple, affordable local
-- Indian bakery cakes (whipped cream, gold cake board, plain background)
-- replacing the earlier premium/luxury-looking stock photos. Also gives
-- Tutti Frutti, Kit Kat and Choco Chip their own photos.
--
-- Files are named 2.jpg (not 1.jpg) so browsers and image CDNs don't keep
-- serving the old cached pictures. Idempotent: matches products by slug.

do $$
declare
  pid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('black-forest-cake', '/images/products/cakes/black-forest-cake/2.jpg'),
      ('butterscotch-cake', '/images/products/cakes/butterscotch-cake/2.jpg'),
      ('cheesecake', '/images/products/cakes/cheesecake/2.jpg'),
      ('choco-chip-cake', '/images/products/cakes/choco-chip-cake/2.jpg'),
      ('chocolate-cake', '/images/products/cakes/chocolate-cake/2.jpg'),
      ('chocolate-truffle-cake', '/images/products/cakes/chocolate-truffle-cake/2.jpg'),
      ('coffee-cake', '/images/products/cakes/coffee-cake/2.jpg'),
      ('dark-truffle-cake', '/images/products/cakes/dark-truffle-cake/2.jpg'),
      ('dry-fruit-cake', '/images/products/cakes/dry-fruit-cake/2.jpg'),
      ('kesar-pista-cake', '/images/products/cakes/kesar-pista-cake/2.jpg'),
      ('kit-kat-cake', '/images/products/cakes/kit-kat-cake/2.jpg'),
      ('mango-cake', '/images/products/cakes/mango-cake/2.jpg'),
      ('pineapple-cake', '/images/products/cakes/pineapple-cake/2.jpg'),
      ('rasmalai-cake', '/images/products/cakes/rasmalai-cake/2.jpg'),
      ('red-velvet-cake', '/images/products/cakes/red-velvet-cake/2.jpg'),
      ('strawberry-cake', '/images/products/cakes/strawberry-cake/2.jpg'),
      ('tutti-frutti-cake', '/images/products/cakes/tutti-frutti-cake/2.jpg'),
      ('vanilla-cake', '/images/products/cakes/vanilla-cake/2.jpg'),
      ('white-forest-cake', '/images/products/cakes/white-forest-cake/2.jpg')
    ) as t(slug, url)
  loop
    select id into pid from products where slug = rec.slug;
    if pid is not null then
      delete from product_images where product_id = pid;
      insert into product_images (product_id, url, sort_order) values (pid, rec.url, 0);
    end if;
  end loop;
end $$;

-- Flavour choices for customized & bento cakes: every flavour on the shop's
-- price list in the regular 290–350 range (Dark Truffle and Kit Kat are
-- priced higher, so they stay separate products).
do $$
declare
  pid uuid;
  flv text;
begin
  for pid in select p.id from products p join categories c on c.id = p.category_id where c.slug = 'customized-cakes'
  loop
    delete from product_flavours where product_id = pid;
    foreach flv in array array['Vanilla','Pineapple','Butterscotch','Black Forest','Chocolate','Tutti Frutti','Red Velvet','Rasmalai','Strawberry','Mango','White Forest']
    loop
      insert into product_flavours (product_id, name) values (pid, flv);
    end loop;
  end loop;
end $$;
