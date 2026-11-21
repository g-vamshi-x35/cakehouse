-- Premium Cakes collection (photos from the owner's "cake data/cakes" folder).
-- Prices start empty on purpose: the owner sets each price from the owner
-- dashboard. Until then the website shows "Price on request".
--
-- Anyone can read active cakes; only the owner can change anything
-- (is_owner(), same rule as the main products table).

create table if not exists public.premium_cakes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  images text[] not null default '{}',
  price numeric(10,2) check (price is null or price > 0),
  price_label text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.premium_cakes enable row level security;

drop policy if exists "premium_cakes_public_read" on public.premium_cakes;
create policy "premium_cakes_public_read" on public.premium_cakes for select
  using (is_active or public.is_owner());

drop policy if exists "premium_cakes_owner_write" on public.premium_cakes;
create policy "premium_cakes_owner_write" on public.premium_cakes for all
  using (public.is_owner())
  with check (public.is_owner());

grant select on public.premium_cakes to anon, authenticated;
grant insert, update, delete on public.premium_cakes to authenticated;

-- Seed the 30 cakes (no prices). Re-running keeps any prices already set.
insert into public.premium_cakes (slug, name, images, sort_order) values
  ('bento-cake', 'Bento Cake', array['/images/premium/bento-cake/1.jpg', '/images/premium/bento-cake/2.jpg', '/images/premium/bento-cake/3.jpg', '/images/premium/bento-cake/4.jpg']::text[], 10),
  ('black-forest-cake', 'Black Forest Cake', array['/images/premium/black-forest-cake/1.jpg', '/images/premium/black-forest-cake/2.jpg', '/images/premium/black-forest-cake/3.jpg', '/images/premium/black-forest-cake/4.jpg', '/images/premium/black-forest-cake/5.jpg']::text[], 20),
  ('butterscotch-cake', 'Butterscotch Cake', array['/images/premium/butterscotch-cake/1.jpg', '/images/premium/butterscotch-cake/2.jpg', '/images/premium/butterscotch-cake/3.jpg', '/images/premium/butterscotch-cake/4.jpg']::text[], 30),
  ('car-bike-cake', 'Car Bike Cake', array['/images/premium/car-bike-cake/1.jpg', '/images/premium/car-bike-cake/2.jpg', '/images/premium/car-bike-cake/3.jpg']::text[], 40),
  ('cartoon-cake', 'Cartoon Cake', array['/images/premium/cartoon-cake/1.jpg', '/images/premium/cartoon-cake/2.jpg']::text[], 50),
  ('cheesecake', 'Cheesecake', array['/images/premium/cheesecake/1.jpg']::text[], 60),
  ('choco-chip-cake', 'Choco Chip Cake', array['/images/premium/choco-chip-cake/1.jpg']::text[], 70),
  ('chocolate-cake', 'Chocolate Cake', array['/images/premium/chocolate-cake/1.jpg', '/images/premium/chocolate-cake/2.jpg', '/images/premium/chocolate-cake/3.jpg', '/images/premium/chocolate-cake/4.jpg', '/images/premium/chocolate-cake/5.jpg']::text[], 80),
  ('chocolate-truffle-cake', 'Chocolate Truffle Cake', array['/images/premium/chocolate-truffle-cake/1.jpg']::text[], 90),
  ('coffee-cake', 'Coffee Cake', array['/images/premium/coffee-cake/1.jpg']::text[], 100),
  ('dark-truffle-cake', 'Dark Truffle Cake', array['/images/premium/dark-truffle-cake/1.jpg']::text[], 110),
  ('doll-cake', 'Doll Cake', array['/images/premium/doll-cake/1.jpg', '/images/premium/doll-cake/2.jpg', '/images/premium/doll-cake/3.jpg']::text[], 120),
  ('doraemon-cake', 'Doraemon Cake', array['/images/premium/doraemon-cake/1.jpg']::text[], 130),
  ('dry-fruit-cake', 'Dry Fruit Cake', array['/images/premium/dry-fruit-cake/1.jpg']::text[], 140),
  ('ferrero-rocher-cake', 'Ferrero Rocher Cake', array['/images/premium/ferrero-rocher-cake/1.jpg']::text[], 150),
  ('kesar-pista-cake', 'Kesar Pista Cake', array['/images/premium/kesar-pista-cake/1.jpg']::text[], 160),
  ('kitkat-cake', 'KitKat Cake', array['/images/premium/kitkat-cake/1.jpg', '/images/premium/kitkat-cake/2.jpg']::text[], 170),
  ('mango-cake', 'Mango Cake', array['/images/premium/mango-cake/1.jpg']::text[], 180),
  ('mixed-fruit-cake', 'Mixed Fruit Cake', array['/images/premium/mixed-fruit-cake/1.jpg']::text[], 190),
  ('oreo-cake', 'Oreo Cake', array['/images/premium/oreo-cake/1.jpg']::text[], 200),
  ('photo-cake', 'Photo Cake', array['/images/premium/photo-cake/1.jpg', '/images/premium/photo-cake/2.jpg']::text[], 210),
  ('pineapple-cake', 'Pineapple Cake', array['/images/premium/pineapple-cake/1.jpg', '/images/premium/pineapple-cake/2.jpg', '/images/premium/pineapple-cake/3.jpg', '/images/premium/pineapple-cake/4.jpg']::text[], 220),
  ('princess-cake', 'Princess Cake', array['/images/premium/princess-cake/1.jpg']::text[], 230),
  ('rasmalai-cake', 'Rasmalai Cake', array['/images/premium/rasmalai-cake/1.jpg']::text[], 240),
  ('red-velvet-cake', 'Red Velvet Cake', array['/images/premium/red-velvet-cake/1.jpg']::text[], 250),
  ('spider-man-cake', 'Spider-Man Cake', array['/images/premium/spider-man-cake/1.jpg']::text[], 260),
  ('strawberry-cake', 'Strawberry Cake', array['/images/premium/strawberry-cake/1.jpg', '/images/premium/strawberry-cake/2.jpg', '/images/premium/strawberry-cake/3.jpg', '/images/premium/strawberry-cake/4.jpg']::text[], 270),
  ('tutti-frutti-cake', 'Tutti Frutti Cake', array['/images/premium/tutti-frutti-cake/1.jpg']::text[], 280),
  ('vanilla-cake', 'Vanilla Cake', array['/images/premium/vanilla-cake/1.jpg', '/images/premium/vanilla-cake/2.jpg', '/images/premium/vanilla-cake/3.jpg', '/images/premium/vanilla-cake/4.jpg']::text[], 290),
  ('white-forest-cake', 'White Forest Cake', array['/images/premium/white-forest-cake/1.jpg', '/images/premium/white-forest-cake/2.jpg', '/images/premium/white-forest-cake/3.jpg', '/images/premium/white-forest-cake/4.jpg']::text[], 300)
on conflict (slug) do update set name = excluded.name, images = excluded.images, sort_order = excluded.sort_order;
