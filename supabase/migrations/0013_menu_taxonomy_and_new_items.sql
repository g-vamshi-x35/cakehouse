-- Adds the new items from the restructured menu taxonomy: 5 mini cakes,
-- 3 mini bento cakes, 5 new pizza flavours, and a plain Veg Patties snack.
-- Prices are provisional, modeled on similar existing items — update via
-- the owner dashboard once real pricing is confirmed.
--
-- Note: category-filter tags (Birthday Cakes, Chocolate Cakes, etc.) live
-- entirely in the static catalog (src/data/products.ts), not the database,
-- so retagging existing products needed no migration — only these brand
-- new products need inserting here.
--
-- Idempotent — safe to run more than once. Each product upserts on its
-- unique slug, and its flavours are cleared and re-inserted.

do $$
declare
  cat_regular uuid;
  cat_pizza uuid;
  cat_snacks uuid;
  pid uuid;
begin
  select id into cat_regular from categories where slug = 'regular-cakes';
  select id into cat_pizza from categories where slug = 'pizza';
  select id into cat_snacks from categories where slug = 'snacks';

  -- Mini Vanilla Cake
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-vanilla-cake', 'Mini Vanilla Cake', cat_regular,
    'A single-serve mini version of our classic vanilla cake — soft sponge with light vanilla cream, perfect for a small treat.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 120, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla');

  -- Mini Chocolate Cake
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-chocolate-cake', 'Mini Chocolate Cake', cat_regular,
    'A single-serve mini chocolate cake — deep chocolate sponge layered with silky chocolate ganache.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 120, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate');

  -- Mini Black Forest Cake
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-black-forest-cake', 'Mini Black Forest Cake', cat_regular,
    'A single-serve mini Black Forest cake — chocolate sponge, whipped cream, cherries and chocolate shavings.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 130, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Black Forest');

  -- Mini Red Velvet Cake
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-red-velvet-cake', 'Mini Red Velvet Cake', cat_regular,
    'A single-serve mini red velvet cake — silky red velvet sponge with cream cheese frosting.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 150, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Red Velvet');

  -- Mini Pineapple Cake
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-pineapple-cake', 'Mini Pineapple Cake', cat_regular,
    'A single-serve mini pineapple cake — fresh pineapple folded into soft sponge with light whipped cream.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 120, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Pineapple');

  -- Mini Chocolate Bento
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-chocolate-bento', 'Mini Chocolate Bento', cat_regular,
    'A cute personal-size chocolate bento cake in a box — perfect for a small celebration or a sweet gift.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 150, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate');

  -- Mini Red Velvet Bento
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-red-velvet-bento', 'Mini Red Velvet Bento', cat_regular,
    'A cute personal-size red velvet bento cake in a box — silky sponge with cream cheese frosting.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 170, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Red Velvet');

  -- Mini Oreo Bento
  insert into products (slug, name, category_id, description, ingredients, base_price, is_active)
  values ('mini-oreo-bento', 'Mini Oreo Bento', cat_regular,
    'A cute personal-size Oreo bento cake in a box — chocolate sponge loaded with crushed Oreo-style cookies and cream.',
    '100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.', 160, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, base_price = excluded.base_price, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Oreo');

  -- Margherita Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('margherita-pizza', 'Margherita Pizza', cat_pizza, 'Classic pizza with tomato sauce, mozzarella and basil.', 110, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;

  -- Cheese Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('cheese-pizza', 'Cheese Pizza', cat_pizza, 'Loaded with extra mozzarella cheese.', 120, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;

  -- Veg Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('veg-pizza', 'Veg Pizza', cat_pizza, 'Topped with a colourful mix of fresh vegetables.', 130, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;

  -- Farm Fresh Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('farm-fresh-pizza', 'Farm Fresh Pizza', cat_pizza, 'Loaded with garden-fresh vegetable toppings.', 150, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;

  -- Cheese Burst Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('cheese-burst-pizza', 'Cheese Burst Pizza', cat_pizza, 'Stuffed-crust pizza with a molten cheese burst.', 180, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;

  -- Veg Patties
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('veg-patties', 'Veg Patties', cat_snacks, 'Flaky pastry filled with a spiced mixed-vegetable stuffing.', 20, true)
  on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, base_price = excluded.base_price, is_active = excluded.is_active;
end $$;
