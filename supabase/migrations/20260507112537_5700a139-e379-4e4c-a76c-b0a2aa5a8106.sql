
-- Enums
create type public.material_category as enum (
  'plastics','metals','textiles','wood','paper','glass','chemicals','organic','construction','electronics','rubber','other'
);
create type public.listing_status as enum ('available','reserved','sold','archived');
create type public.unit_type as enum ('kg','tonnes','liters','cubic_meters','units','pallets');
create type public.inquiry_status as enum ('pending','accepted','declined','completed');

-- Profiles (company info)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text,
  industry text,
  location text,
  website text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category public.material_category not null,
  quantity numeric not null,
  unit public.unit_type not null,
  price_per_unit numeric,
  is_free boolean not null default false,
  location text not null,
  image_url text,
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_category_idx on public.listings(category);
create index listings_status_idx on public.listings(status);
create index listings_user_idx on public.listings(user_id);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
  on public.listings for select using (true);
create policy "Authenticated users can create listings"
  on public.listings for insert with check (auth.uid() = user_id);
create policy "Owners can update listings"
  on public.listings for update using (auth.uid() = user_id);
create policy "Owners can delete listings"
  on public.listings for delete using (auth.uid() = user_id);

-- Inquiries (messaging)
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  quantity_requested numeric,
  status public.inquiry_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_listing_idx on public.inquiries(listing_id);
create index inquiries_buyer_idx on public.inquiries(buyer_id);
create index inquiries_seller_idx on public.inquiries(seller_id);

alter table public.inquiries enable row level security;

create policy "Buyers and sellers can view their inquiries"
  on public.inquiries for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Authenticated users can create inquiries"
  on public.inquiries for insert
  with check (auth.uid() = buyer_id and auth.uid() <> seller_id);
create policy "Sellers can update inquiry status"
  on public.inquiries for update
  using (auth.uid() = seller_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();
create trigger inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, company_name, contact_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'My Company'),
    coalesce(new.raw_user_meta_data->>'contact_name', new.email)
  );
  return new;
end;$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
