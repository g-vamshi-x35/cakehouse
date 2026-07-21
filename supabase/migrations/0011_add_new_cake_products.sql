-- Adds 17 new cake products (Cheesecake, Choco Chip, Chocolate Truffle,
-- Coffee, Dry Fruit, Ferrero Rocher, Kesar Pista, Mango, Mixed Fruit, Oreo,
-- Strawberry, White Forest, Car Bike, Cartoon, Photo, Princess, Spider-Man)
-- to the live catalog. Prices are provisional, modeled on similar existing
-- items — update via the owner dashboard once real pricing is confirmed.
--
-- Idempotent — safe to run more than once. Each product upserts on its
-- unique slug, and its flavours/weight options are cleared and re-inserted.

do $$
declare
  cat_regular uuid;
  cat_custom uuid;
  pid uuid;
begin
  select id into cat_regular from categories where slug = 'regular-cakes';
  select id into cat_custom from categories where slug = 'customized-cakes';

  -- Cheesecake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('cheesecake', 'Cheesecake', cat_regular,
    'A rich, creamy baked cheesecake on a buttery biscuit base — smooth, dense and indulgent in every bite.',
    'Refined flour, cream cheese, fresh cream, biscuit crumb, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    450, 900, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Classic'), (pid, 'Blueberry'), (pid, 'Strawberry');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 450), (pid, '1 kg', 900), (pid, '2 kg', 1710);

  -- Choco Chip Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('choco-chip-cake', 'Choco Chip Cake', cat_regular,
    'Soft vanilla-chocolate sponge studded with chocolate chips throughout, finished with a light cream frosting.',
    'Refined flour, chocolate chips, fresh cream, cocoa, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate Chip');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Chocolate Truffle Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('chocolate-truffle-cake', 'Chocolate Truffle Cake', cat_regular,
    'Moist chocolate sponge layered with silky chocolate truffle cream and a glossy ganache finish.',
    'Refined flour, cocoa, chocolate truffle cream, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    400, 800, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate Truffle');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 400), (pid, '1 kg', 800), (pid, '2 kg', 1520);

  -- Coffee Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('coffee-cake', 'Coffee Cake', cat_regular,
    'Soft coffee-infused sponge layered with light coffee cream — subtly sweet with a gentle coffee kick.',
    'Refined flour, coffee decoction, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Coffee');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Dry Fruit Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('dry-fruit-cake', 'Dry Fruit Cake', cat_regular,
    'Rich sponge loaded with almonds, cashews, raisins and dates — a wholesome, nutty favourite.',
    'Refined flour, mixed dry fruits (almonds, cashews, raisins, dates), fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    450, 900, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Dry Fruit');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 450), (pid, '1 kg', 900), (pid, '2 kg', 1710);

  -- Ferrero Rocher Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('ferrero-rocher-cake', 'Ferrero Rocher Cake', cat_regular,
    'Decadent hazelnut-chocolate sponge topped with Ferrero-style chocolate hazelnut balls and rich ganache.',
    'Refined flour, cocoa, hazelnut praline, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    550, 1000, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Ferrero Rocher');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 550), (pid, '1 kg', 1000), (pid, '2 kg', 1900);

  -- Kesar Pista Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('kesar-pista-cake', 'Kesar Pista Cake', cat_regular,
    'Fragrant saffron sponge layered with pistachio cream — a festive, aromatic favourite.',
    'Refined flour, saffron, pistachios, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    450, 900, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Kesar Pista');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 450), (pid, '1 kg', 900), (pid, '2 kg', 1710);

  -- Mango Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('mango-cake', 'Mango Cake', cat_regular,
    'Fresh mango pulp folded into a soft vanilla sponge with mango cream — a seasonal favourite.',
    'Refined flour, mango pulp, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Mango');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Mixed Fruit Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('mixed-fruit-cake', 'Mixed Fruit Cake', cat_regular,
    'Soft sponge loaded with a colourful mix of fresh seasonal fruits and light whipped cream.',
    'Refined flour, mixed seasonal fruits, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Mixed Fruit');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Oreo Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('oreo-cake', 'Oreo Cake', cat_regular,
    'Chocolate sponge loaded with crushed Oreo-style cookies and cream, finished with cookie crumble on top.',
    'Refined flour, cocoa, chocolate sandwich cookies, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    350, 700, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Oreo');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 700), (pid, '2 kg', 1330);

  -- Strawberry Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('strawberry-cake', 'Strawberry Cake', cat_regular,
    'Soft vanilla sponge layered with fresh strawberry compote and light whipped cream.',
    'Refined flour, strawberry compote, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Strawberry');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- White Forest Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_active)
  values ('white-forest-cake', 'White Forest Cake', cat_regular,
    'The classic Black Forest, reimagined in white — vanilla sponge, whipped cream, cherries and white chocolate shavings.',
    'Refined flour, fresh cream, cherries, white chocolate shavings, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'White Forest');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Car Bike Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_active)
  values ('car-bike-cake', 'Car Bike Cake', cat_custom,
    'A fun 3D bike-shaped cake, hand-sculpted and piped in cream — a joyful centerpiece for any little rider''s birthday.',
    'Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000,
    note = excluded.note, is_customizable = excluded.is_customizable, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);

  -- Cartoon Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_active)
  values ('cartoon-cake', 'Cartoon Cake', cat_custom,
    'Your child''s favourite cartoon character, hand-piped in cream on a soft sponge base — tell us the character and we''ll bring it to life.',
    'Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000,
    note = excluded.note, is_customizable = excluded.is_customizable, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);

  -- Photo Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_active)
  values ('photo-cake', 'Photo Cake', cat_custom,
    'An edible print of your favourite photo on a soft cream cake — a personal, memorable centerpiece for any celebration. Send us your photo on WhatsApp when ordering.',
    'Refined flour, fresh cream, edible photo print, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    350, 650, 'Send your photo on WhatsApp after ordering', true, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000,
    note = excluded.note, is_customizable = excluded.is_customizable, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);

  -- Princess Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_active)
  values ('princess-cake', 'Princess Cake', cat_custom,
    'A dreamy princess-themed cake with hand-piped cream detailing and a princess figure of your choice.',
    'Refined flour, fresh cream, fondant/cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000,
    note = excluded.note, is_customizable = excluded.is_customizable, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);

  -- Spider-Man Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_active)
  values ('spiderman-cake', 'Spider-Man Cake', cat_custom,
    'A web-slinging superhero cake, hand-piped in cream — a favourite for action-hero-loving kids.',
    'Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true)
  on conflict (slug) do update set
    name = excluded.name, category_id = excluded.category_id, description = excluded.description,
    ingredients = excluded.ingredients, price_500 = excluded.price_500, price_1000 = excluded.price_1000,
    note = excluded.note, is_customizable = excluded.is_customizable, is_active = excluded.is_active
  returning id into pid;
  delete from product_flavours where product_id = pid;
  delete from product_weight_options where product_id = pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);
end $$;
