-- ============================================================
-- StickyPAY Database Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text unique not null,
  email text,
  address text,
  created_at timestamptz default now()
);

-- 2. STORES
create table if not exists public.stores (
  store_id uuid primary key default gen_random_uuid(),
  store_name text not null,
  store_qr_code text unique,
  address text,
  created_at timestamptz default now()
);

-- 3. PRODUCTS
create table if not exists public.products (
  product_id uuid primary key default gen_random_uuid(),
  barcode text unique not null,
  name text not null,
  brand text,
  category text,
  price numeric(10,2) not null default 0,
  image_url text,
  created_at timestamptz default now()
);

-- 4. STORE_PRODUCTS (junction: which products belong to which store)
create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(store_id) on delete cascade,
  product_id uuid references public.products(product_id) on delete cascade,
  stock integer default 0,
  unique(store_id, product_id)
);

-- 5. CART
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(product_id) on delete cascade,
  store_id uuid references public.stores(store_id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id, store_id)
);

-- 6. ORDERS
create table if not exists public.orders (
  order_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(store_id) on delete set null,
  store_name text,
  total_amount numeric(10,2) not null default 0,
  payment_status text default 'pending',
  payment_method text default 'UPI',
  qr_code text,
  transaction_id text unique,
  verified boolean default false,
  created_at timestamptz default now()
);

-- 7. ORDER_ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(order_id) on delete cascade,
  product_id uuid references public.products(product_id) on delete set null,
  quantity integer not null default 1,
  price numeric(10,2) not null default 0
);

-- 8. PAYMENTS
create table if not exists public.payments (
  payment_id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(order_id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(store_id) on delete set null,
  total_amount numeric(10,2),
  payment_method text default 'UPI',
  status text default 'pending',
  created_at timestamptz default now()
);

-- 9. PAYMENT_ITEMS
create table if not exists public.payment_items (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(payment_id) on delete cascade,
  product_id uuid references public.products(product_id) on delete set null,
  quantity integer not null default 1,
  price numeric(10,2) not null default 0
);

-- ============================================================
-- ROW LEVEL SECURITY (disable for development, enable for prod)
-- ============================================================
alter table public.profiles disable row level security;
alter table public.stores disable row level security;
alter table public.products disable row level security;
alter table public.store_products disable row level security;
alter table public.cart disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
alter table public.payments disable row level security;
alter table public.payment_items disable row level security;

-- ============================================================
-- SAMPLE STORE DATA (optional — helps test the app)
-- ============================================================
insert into public.stores (store_name, store_qr_code, address)
values ('Demo Store', 'demo-store', '123 Main Street')
on conflict do nothing;
