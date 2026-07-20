-- Seed: categories + products + images/flavours/weight options.
-- Safe to run once against a fresh schema from 0001_init.sql.

do $$
declare
  cat_regular uuid;
  cat_custom uuid;
  cat_pizza uuid;
  cat_snacks uuid;
  pid uuid;
begin
  insert into categories (slug, name, sort_order) values ('regular-cakes', 'Regular Cakes', 1) returning id into cat_regular;
  insert into categories (slug, name, sort_order) values ('customized-cakes', 'Customized Cakes', 2) returning id into cat_custom;
  insert into categories (slug, name, sort_order) values ('pizza', 'Pizza', 3) returning id into cat_pizza;
  insert into categories (slug, name, sort_order) values ('snacks', 'Samosa & Patties', 4) returning id into cat_snacks;

  -- Vanilla Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('vanilla-cake', 'Vanilla Cake', cat_regular,
    'A timeless classic — soft, moist vanilla sponge layered with light vanilla cream. Simple, comforting and always a crowd-pleaser.',
    'Refined flour, sugar, fresh cream, vegetable oil, vanilla essence, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 550, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 550), (pid, '2 kg', 1045);

  -- Pineapple Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('pineapple-cake', 'Pineapple Cake', cat_regular,
    'Fresh pineapple chunks folded into a soft vanilla sponge, finished with a light whipped cream and pineapple glaze.',
    'Refined flour, fresh cream, pineapple compote, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Butterscotch Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('butterscotch-cake', 'Butterscotch Cake', cat_regular,
    'Caramelised butterscotch sponge layered with praline crunch and butterscotch cream — rich, nutty and irresistible.',
    'Refined flour, butterscotch praline, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Butterscotch');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Black Forest Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('black-forest-cake', 'Black Forest Cake', cat_regular,
    'The bestseller — chocolate sponge soaked lightly, layered with whipped cream, cherries and chocolate shavings.',
    'Refined flour, cocoa, fresh cream, cherries, chocolate shavings, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Black Forest');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Chocolate Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('chocolate-cake', 'Chocolate Cake', cat_regular,
    'A deep, indulgent chocolate sponge layered with silky chocolate ganache — made for true chocolate lovers.',
    'Refined flour, cocoa, chocolate ganache, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Dark Truffle Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('dark-truffle-cake', 'Dark Truffle Cake', cat_regular,
    'Decadent dark chocolate sponge enrobed in glossy truffle ganache — for the serious chocolate connoisseur.',
    'Refined flour, dark cocoa, truffle ganache, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    450, 900, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Dark Chocolate');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 450), (pid, '1 kg', 900), (pid, '2 kg', 1710);

  -- Tutti Frutti Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('tutti-frutti-cake', 'Tutti Frutti Cake', cat_regular,
    'Soft vanilla sponge studded with colourful candied tutti frutti bits, finished with a fresh fruit topping — a fun, fruity favourite.',
    'Refined flour, tutti frutti, fresh cream, seasonal fruit, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Tutti Frutti');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);
  insert into product_images (product_id, url, sort_order) values (pid, '/images/menu/menu-fruit-cake.jpg', 0);

  -- Red Velvet Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('red-velvet-cake', 'Red Velvet Cake', cat_regular,
    'Silky red velvet sponge layered with cream cheese frosting — elegant, smooth and beautifully balanced.',
    'Refined flour, cocoa, cream cheese frosting, fresh cream, sugar, vegetable oil, food colour, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    350, 700, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Red Velvet');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 700), (pid, '2 kg', 1330);

  -- Kit Kat Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('kit-kat-cake', 'Kit Kat Cake', cat_regular,
    'Chocolate sponge wrapped in a ring of Kit Kat fingers, piled high with chocolates and drizzled ganache.',
    'Refined flour, cocoa, chocolate ganache, wafer chocolates, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    550, 1000, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Chocolate');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 550), (pid, '1 kg', 1000), (pid, '2 kg', 1900);

  -- Rasmalai Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, is_featured, is_active)
  values ('rasmalai-cake', 'Rasmalai Cake', cat_regular,
    'A fusion favourite — soft sponge soaked in rasmalai milk, layered with malai cream and chopped pistachios.',
    'Refined flour, milk, rasmalai, fresh cream, pistachios, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    290, 590, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Rasmalai');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 290), (pid, '1 kg', 590), (pid, '2 kg', 1121);

  -- Doll Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_featured, is_active)
  values ('doll-cake', 'Doll Cake', cat_custom,
    'A show-stopping princess doll cake — soft sponge skirt piped by hand with detailed cream rosettes and a doll of your choice.',
    'Refined flour, fresh cream, fondant/cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);
  insert into product_images (product_id, url, sort_order) values (pid, '/images/menu/menu-doll-barbie-cake.jpg', 0);

  -- Car Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_featured, is_active)
  values ('car-cake', 'Car Cake', cat_custom,
    'A fun 3D car-shaped cake, hand-sculpted and piped in cream — perfect for a little one''s birthday.',
    'Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, true, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);
  insert into product_images (product_id, url, sort_order) values (pid, '/images/menu/menu-car-cake.jpg', 0);

  -- Doraemon Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, price_1000, note, is_customizable, is_featured, is_active)
  values ('doraemon-cake', 'Doraemon Cake', cat_custom,
    'Everyone''s favourite robot cat, hand-piped in cream on a soft sponge base — a guaranteed smile at any kids'' party.',
    'Refined flour, fresh cream, cream detailing, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen. Final design & price depend on complexity.',
    350, 650, 'Final price depends on design', true, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 350), (pid, '1 kg', 650), (pid, '2 kg', 1235);
  insert into product_images (product_id, url, sort_order) values (pid, '/images/menu/menu-doraemon-cake.jpg', 0);

  -- Bento Cake
  insert into products (slug, name, category_id, description, ingredients, price_500, base_price, note, is_customizable, is_featured, is_active)
  values ('bento-cake', 'Bento Cake', cat_custom,
    'A cute mini personal-size cake in a box, perfect for a small celebration, a sweet gift, or just because.',
    'Refined flour, fresh cream, sugar, vegetable oil, baking essentials. 100% eggless & vegetarian. Every cake is handmade fresh to order in our kitchen.',
    150, 150, 'Final price depends on design', true, false, true)
  returning id into pid;
  insert into product_flavours (product_id, name) values (pid, 'Vanilla'), (pid, 'Chocolate'), (pid, 'Butterscotch'), (pid, 'Black Forest'), (pid, 'Red Velvet'), (pid, 'Pineapple');
  insert into product_weight_options (product_id, label, price) values (pid, '0.5 kg', 150);

  -- Pizza
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('onion-pizza', '8" Onion Pizza', cat_pizza, 'Classic thin-crust pizza loaded with onions and mozzarella.', 100, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('sweetcorn-pizza', '8" Sweetcorn Pizza', cat_pizza, 'Cheesy pizza topped with sweet corn kernels.', 120, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('paneer-pizza', '8" Paneer Pizza', cat_pizza, 'Loaded with soft paneer cubes and mozzarella.', 130, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('mushroom-pizza', '8" Mushroom Pizza', cat_pizza, 'Fresh mushrooms over a cheesy tomato base.', 130, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('large-pizza', '12" Large Pizza', cat_pizza, 'Our large 12-inch pizza — great for sharing.', 250, true);

  -- Samosa & Patties
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('samosa', 'Samosa', cat_snacks, 'Crispy, golden and spiced — a teatime favourite.', 7, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('paneer-patties', 'Paneer Patties', cat_snacks, 'Flaky pastry filled with a spiced paneer stuffing.', 25, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('mushroom-patties', 'Mushroom Patties', cat_snacks, 'Flaky pastry filled with a savoury mushroom stuffing.', 25, true);
  insert into products (slug, name, category_id, description, base_price, is_active)
  values ('aloo-patties', 'Aloo Patties', cat_snacks, 'Flaky pastry filled with spiced mashed potato.', 20, true);
end $$;
