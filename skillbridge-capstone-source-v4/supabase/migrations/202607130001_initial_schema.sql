create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin');
create type public.listing_status as enum ('draft', 'published', 'rejected');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  city text,
  bio text,
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.service_categories(id),
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) >= 20),
  city text not null,
  price_per_hour numeric(10, 2) not null check (price_per_hour >= 0),
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_files (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  bucket_name text not null default 'listing-files',
  file_path text not null unique,
  file_name text not null,
  content_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_for timestamptz not null,
  status public.booking_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_customer_not_provider check (customer_id <> provider_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, reviewer_id)
);

create index listings_owner_idx on public.listings(owner_id);
create index listings_category_status_idx on public.listings(category_id, status);
create index listings_search_idx on public.listings using gin (to_tsvector('english', title || ' ' || description || ' ' || city));
create index listing_files_listing_idx on public.listing_files(listing_id);
create index booking_provider_idx on public.booking_requests(provider_id, scheduled_for);
create index booking_customer_idx on public.booking_requests(customer_id, scheduled_for);
create index reviews_listing_idx on public.reviews(listing_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create trigger set_booking_requests_updated_at
before update on public.booking_requests
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'New user'))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.service_categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_files enable row level security;
alter table public.booking_requests enable row level security;
alter table public.reviews enable row level security;

create policy "Profiles are visible to app users and visitors"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "Users can read their role"
on public.user_roles for select
using (user_id = auth.uid() or public.is_admin());

create policy "Admins can manage roles"
on public.user_roles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Active categories are public"
on public.service_categories for select
using (is_active = true or public.is_admin());

create policy "Admins can manage categories"
on public.service_categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Published listings are public"
on public.listings for select
using (status = 'published' or owner_id = auth.uid() or public.is_admin());

create policy "Users can create their own listings"
on public.listings for insert
with check (owner_id = auth.uid());

create policy "Owners and admins can update listings"
on public.listings for update
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

create policy "Owners and admins can delete listings"
on public.listings for delete
using (owner_id = auth.uid() or public.is_admin());

create policy "Allowed listing files are readable"
on public.listing_files for select
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and (l.status = 'published' or l.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners can register files for their listings"
on public.listing_files for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.owner_id = auth.uid()
  )
);

create policy "Owners and admins can remove files"
on public.listing_files for delete
using (owner_id = auth.uid() or public.is_admin());

create policy "Booking participants can read requests"
on public.booking_requests for select
using (provider_id = auth.uid() or customer_id = auth.uid() or public.is_admin());

create policy "Customers can request a published service"
on public.booking_requests for insert
with check (
  customer_id = auth.uid()
  and customer_id <> provider_id
  and exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.owner_id = provider_id
      and l.status = 'published'
  )
);

create policy "Booking participants can update requests"
on public.booking_requests for update
using (provider_id = auth.uid() or customer_id = auth.uid() or public.is_admin())
with check (provider_id = auth.uid() or customer_id = auth.uid() or public.is_admin());

create policy "Reviews for published listings are public"
on public.reviews for select
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and (l.status = 'published' or l.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "Authenticated users can review published listings"
on public.reviews for insert
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.status = 'published'
      and l.owner_id <> auth.uid()
  )
);

create policy "Review authors and admins can edit reviews"
on public.reviews for update
using (reviewer_id = auth.uid() or public.is_admin())
with check (reviewer_id = auth.uid() or public.is_admin());

create policy "Review authors and admins can delete reviews"
on public.reviews for delete
using (reviewer_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('listing-files', 'listing-files', false, 10485760),
  ('profile-avatars', 'profile-avatars', false, 3145728)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "Users can upload listing files in their folder"
on storage.objects for insert
with check (
  bucket_id = 'listing-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read allowed listing files"
on storage.objects for select
using (
  bucket_id = 'listing-files'
  and exists (
    select 1
    from public.listing_files f
    join public.listings l on l.id = f.listing_id
    where f.file_path = storage.objects.name
      and (l.status = 'published' or l.owner_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners and admins can delete listing files"
on storage.objects for delete
using (
  bucket_id = 'listing-files'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

create policy "Users can upload their avatar"
on storage.objects for insert
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their avatar"
on storage.objects for update
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Avatars are readable"
on storage.objects for select
using (bucket_id = 'profile-avatars');

insert into public.service_categories (name, slug)
values
  ('Home repair', 'home-repair'),
  ('Private lessons', 'private-lessons'),
  ('Design and media', 'design-media'),
  ('Events and catering', 'events-catering'),
  ('Tech support', 'tech-support')
on conflict (slug) do nothing;
