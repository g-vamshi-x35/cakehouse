-- Cake House — Phase 2 schema
-- Enums

create type user_role as enum ('customer', 'employee', 'owner');
create type order_status as enum ('pending', 'confirmed', 'baking', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
create type payment_status as enum ('unpaid', 'advance_pending', 'advance_paid', 'paid_full', 'refunded');
create type payment_method as enum ('razorpay', 'qr_manual', 'cod');
create type request_status as enum ('pending', 'quoted', 'approved', 'rejected', 'converted');

-- profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  birthday date,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid references categories(id),
  description text,
  ingredients text,
  price_500 numeric(10,2),
  price_1000 numeric(10,2),
  base_price numeric(10,2),
  note text,
  is_customizable boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  avg_rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  alt text
);

create table product_flavours (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  extra_price numeric(10,2) not null default 0
);

create table product_weight_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  price numeric(10,2) not null
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  label text,
  full_address text not null,
  city text,
  pincode text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references profiles(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  delivery_instructions text,
  event_date date,
  event_time time,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  coupon_id uuid references coupons(id),
  total numeric(10,2) not null,
  advance_amount numeric(10,2) not null default 0,
  payment_method payment_method not null default 'cod',
  payment_status payment_status not null default 'unpaid',
  order_status order_status not null default 'pending',
  assigned_employee_id uuid references profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  weight_label text,
  flavour text,
  custom_message text,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(10,2) not null,
  method payment_method not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid references profiles(id),
  order_id uuid references orders(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'kg',
  quantity numeric(10,2) not null default 0,
  low_stock_threshold numeric(10,2) default 5,
  updated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'general',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table custom_cake_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  customer_name text not null,
  customer_phone text not null,
  shape text,
  size text,
  layers int,
  flavour text,
  cream_type text,
  theme text,
  inspiration_image_url text,
  instructions text,
  event_date date,
  status request_status not null default 'pending',
  quoted_price numeric(10,2),
  owner_notes text,
  converted_order_id uuid references orders(id),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table site_settings (
  key text primary key,
  value jsonb
);

-- Helper: current user's role (security definer so RLS on profiles doesn't recurse)
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('owner','employee'), false);
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'owner', false);
$$;

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- order_number generator
create sequence if not exists order_number_seq start 1001;
create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'CH' || nextval('order_number_seq');
  end if;
  return new;
end;
$$;

create trigger set_order_number
  before insert on orders
  for each row execute function public.generate_order_number();

create or replace function public.increment_coupon_usage(coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update coupons set used_count = used_count + 1 where id = coupon_id;
$$;

-- Row Level Security
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_flavours enable row level security;
alter table product_weight_options enable row level security;
alter table addresses enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table inventory_items enable row level security;
alter table notifications enable row level security;
alter table custom_cake_requests enable row level security;
alter table contact_messages enable row level security;
alter table activity_log enable row level security;
alter table banners enable row level security;
alter table site_settings enable row level security;

-- profiles
create policy "profiles_select_own_or_staff" on profiles for select
  using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_update_staff" on profiles for update
  using (public.is_owner());

-- public catalog read
create policy "categories_public_read" on categories for select using (true);
create policy "categories_owner_write" on categories for all
  using (public.is_owner()) with check (public.is_owner());

create policy "products_public_read" on products for select using (is_active = true or public.is_staff());
create policy "products_owner_write" on products for all
  using (public.is_owner()) with check (public.is_owner());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_owner_write" on product_images for all
  using (public.is_owner()) with check (public.is_owner());

create policy "product_flavours_public_read" on product_flavours for select using (true);
create policy "product_flavours_owner_write" on product_flavours for all
  using (public.is_owner()) with check (public.is_owner());

create policy "product_weight_options_public_read" on product_weight_options for select using (true);
create policy "product_weight_options_owner_write" on product_weight_options for all
  using (public.is_owner()) with check (public.is_owner());

create policy "banners_public_read" on banners for select using (is_active = true or public.is_staff());
create policy "banners_owner_write" on banners for all
  using (public.is_owner()) with check (public.is_owner());

create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_owner_write" on site_settings for all
  using (public.is_owner()) with check (public.is_owner());

-- addresses: customer-owned
create policy "addresses_own" on addresses for all
  using (customer_id = auth.uid() or public.is_staff())
  with check (customer_id = auth.uid() or public.is_staff());

-- coupons: public can read active ones (to validate at checkout), owner manages
create policy "coupons_public_read_active" on coupons for select using (active = true or public.is_staff());
create policy "coupons_owner_write" on coupons for all
  using (public.is_owner()) with check (public.is_owner());

-- orders: customer sees own, staff sees all
create policy "orders_select" on orders for select
  using (customer_id = auth.uid() or public.is_staff());
create policy "orders_insert" on orders for insert
  with check (customer_id = auth.uid() or customer_id is null);
create policy "orders_update_staff" on orders for update
  using (public.is_staff());
create policy "orders_update_own_pending" on orders for update
  using (customer_id = auth.uid() and order_status = 'pending');

-- order_items: follow parent order visibility
create policy "order_items_select" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff())));
create policy "order_items_insert" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff())));

-- payments: staff full, customer read own
create policy "payments_select" on payments for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff())));
create policy "payments_staff_write" on payments for all
  using (public.is_staff()) with check (public.is_staff());

-- reviews: public read, authenticated customer writes own
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_insert_own" on reviews for insert
  with check (customer_id = auth.uid());
create policy "reviews_update_own" on reviews for update using (customer_id = auth.uid());
create policy "reviews_staff_manage" on reviews for all
  using (public.is_staff()) with check (public.is_staff());

-- wishlists: own only
create policy "wishlists_own" on wishlists for all
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- inventory: staff only
create policy "inventory_staff" on inventory_items for all
  using (public.is_staff()) with check (public.is_staff());

-- notifications: own only, system/staff can insert
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update using (user_id = auth.uid());
create policy "notifications_staff_insert" on notifications for insert with check (public.is_staff());

-- custom cake requests: customer creates/reads own, staff manages all
create policy "custom_cake_select" on custom_cake_requests for select
  using (customer_id = auth.uid() or public.is_staff());
create policy "custom_cake_insert" on custom_cake_requests for insert
  with check (customer_id = auth.uid() or customer_id is null);
create policy "custom_cake_staff_update" on custom_cake_requests for update
  using (public.is_staff());

-- contact messages: anyone can insert, staff reads
create policy "contact_insert_public" on contact_messages for insert with check (true);
create policy "contact_staff_read" on contact_messages for select using (public.is_staff());
create policy "contact_staff_update" on contact_messages for update using (public.is_staff());

-- activity log: staff only
create policy "activity_log_staff" on activity_log for all
  using (public.is_staff()) with check (public.is_staff());
