
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users read own roles" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Buyer Needs
create table public.buyer_needs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  categories material_category[] not null default '{}',
  locations text[] not null default '{}',
  min_quantity numeric,
  max_quantity numeric,
  unit unit_type,
  notes text,
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.buyer_needs enable row level security;

create policy "Buyer needs visible to owner and admins" on public.buyer_needs
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users insert own needs" on public.buyer_needs
  for insert with check (auth.uid() = user_id);
create policy "Owner updates own needs (not verification)" on public.buyer_needs
  for update using (auth.uid() = user_id);
create policy "Admins update any needs" on public.buyer_needs
  for update using (public.has_role(auth.uid(), 'admin'));
create policy "Owner deletes own needs" on public.buyer_needs
  for delete using (auth.uid() = user_id);

create trigger trg_buyer_needs_updated before update on public.buyer_needs
  for each row execute function public.set_updated_at();

-- Listing expiry
alter table public.listings
  add column expires_at timestamptz not null default (now() + interval '90 days');

-- Matches
create type public.match_status as enum ('suggested','contacted','in_talks','closed_won','closed_lost');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_need_id uuid references public.buyer_needs(id) on delete set null,
  seller_id uuid not null,
  buyer_id uuid not null,
  status match_status not null default 'suggested',
  deal_value numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

alter table public.matches enable row level security;

create policy "Match visible to participants and admins" on public.matches
  for select using (
    auth.uid() = seller_id or auth.uid() = buyer_id or public.has_role(auth.uid(), 'admin')
  );
create policy "Participants update match" on public.matches
  for update using (auth.uid() = seller_id or auth.uid() = buyer_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert match" on public.matches
  for insert with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_matches_updated before update on public.matches
  for each row execute function public.set_updated_at();

-- Match engine: when a listing is created, auto-suggest matches to verified buyer_needs
create or replace function public.create_matches_for_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.matches (listing_id, buyer_need_id, seller_id, buyer_id, status)
  select new.id, bn.id, new.user_id, bn.user_id, 'suggested'
  from public.buyer_needs bn
  where bn.verified = true
    and bn.user_id <> new.user_id
    and new.category = any(bn.categories)
  on conflict (listing_id, buyer_id) do nothing;
  return new;
end;
$$;

create trigger trg_listing_match_engine
  after insert on public.listings
  for each row execute function public.create_matches_for_listing();

-- Invoices (2-3% fee)
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade unique,
  seller_id uuid not null,
  buyer_id uuid not null,
  deal_value numeric not null,
  fee_pct numeric not null default 2.5,
  fee_amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Invoice visible to participants and admins" on public.invoices
  for select using (
    auth.uid() = seller_id or auth.uid() = buyer_id or public.has_role(auth.uid(), 'admin')
  );
create policy "Admins manage invoices" on public.invoices
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_invoices_updated before update on public.invoices
  for each row execute function public.set_updated_at();

-- Auto-issue invoice when match closes won
create or replace function public.issue_invoice_on_close()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'closed_won' and (old.status is distinct from 'closed_won') and new.deal_value is not null then
    insert into public.invoices (match_id, seller_id, buyer_id, deal_value, fee_pct, fee_amount)
    values (new.id, new.seller_id, new.buyer_id, new.deal_value, 2.5, round(new.deal_value * 0.025, 2))
    on conflict (match_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_match_close_invoice
  after update on public.matches
  for each row execute function public.issue_invoice_on_close();
