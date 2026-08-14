-- MSL Pizzeria: execute this complete file once in Supabase Dashboard → SQL Editor.
-- It is safe to execute again: all objects use IF NOT EXISTS / CREATE OR REPLACE.
create extension if not exists pgcrypto;

-- Profiles table (shares auth user, handles roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Dishes (Menu items)
create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null, -- 'pizza', 'sushi_wok', 'drinks', 'desserts'
  price integer not null check (price >= 0),
  weight integer check (weight >= 0), -- grams
  size text, -- e.g. "30 см" or "40 см"
  is_available boolean not null default true,
  is_popular boolean not null default false,
  is_spicy boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dishes_catalog_sort on public.dishes (is_available, is_popular desc, created_at desc);

-- Dish Images (multi-image support like cars)
create table if not exists public.dish_images (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  url text not null,
  position integer not null check (position between 0 and 49),
  alt text,
  unique(dish_id, position)
);
create index if not exists dish_images_position on public.dish_images(dish_id, position);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  delivery_method text not null check (delivery_method in ('delivery', 'pickup')),
  delivery_address text,
  payment_method text not null check (payment_method in ('cash', 'card_on_delivery', 'card_online')),
  comment text,
  status text not null default 'new' check (status in ('new', 'preparing', 'delivering', 'completed', 'cancelled')),
  total_price integer not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_sort on public.orders (created_at desc);

-- Order Items (holds items inside orders)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid references public.dishes(id) on delete set null,
  dish_name text not null,
  quantity integer not null check (quantity > 0),
  price_at_order integer not null check (price_at_order >= 0),
  size_at_order text
);

-- Automated update_at timestamp functions & triggers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dishes_set_updated_at on public.dishes;
create trigger dishes_set_updated_at before update on public.dishes for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- Trigger for profile creation on new user signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id) values(new.id) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Helper function to check if user is admin
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and is_admin)
$$;

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.dishes enable row level security;
alter table public.dish_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for Profiles
drop policy if exists "profile owner reads profile" on public.profiles;
create policy "profile owner reads profile" on public.profiles for select using (id=auth.uid());

-- Policies for Dishes
drop policy if exists "public reads available dishes" on public.dishes;
drop policy if exists "admins manage dishes" on public.dishes;
create policy "public reads available dishes" on public.dishes for select using (is_available or public.is_admin());
create policy "admins manage dishes" on public.dishes for all using (public.is_admin()) with check (public.is_admin());

-- Policies for Dish Images
drop policy if exists "public reads dish images" on public.dish_images;
drop policy if exists "admins manage dish images" on public.dish_images;
create policy "public reads dish images" on public.dish_images for select using (true);
create policy "admins manage dish images" on public.dish_images for all using (public.is_admin()) with check (public.is_admin());

-- Policies for Orders (anyone can place, only admins manage)
drop policy if exists "public places orders" on public.orders;
drop policy if exists "admins manage orders" on public.orders;
create policy "public places orders" on public.orders for insert with check (true);
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- Policies for Order Items (anyone can place, only admins manage)
drop policy if exists "public places order items" on public.order_items;
drop policy if exists "admins manage order items" on public.order_items;
create policy "public places order items" on public.order_items for insert with check (true);
create policy "admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- Configure Storage Bucket for Dish Images
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('dish-images','dish-images',true,10485760,array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "admins upload dish photos" on storage.objects;
drop policy if exists "admins update dish photos" on storage.objects;
drop policy if exists "admins delete dish photos" on storage.objects;
create policy "admins upload dish photos" on storage.objects for insert to authenticated with check (bucket_id='dish-images' and public.is_admin());
create policy "admins update dish photos" on storage.objects for update to authenticated using (bucket_id='dish-images' and public.is_admin()) with check (bucket_id='dish-images' and public.is_admin());
create policy "admins delete dish photos" on storage.objects for delete to authenticated using (bucket_id='dish-images' and public.is_admin());
