-- Optional local seed helpers after creating demo users through Supabase Auth.
-- 1. Register demo@skillbridge.test and admin@skillbridge.test from the app or Supabase Dashboard.
-- 2. Run the statements below in the SQL editor, replacing emails if needed.

update public.user_roles
set role = 'admin'
where user_id = (
  select id
  from auth.users
  where email = 'admin@skillbridge.test'
  limit 1
);

insert into public.service_categories (name, slug)
values
  ('Cleaning', 'cleaning'),
  ('Pet care', 'pet-care'),
  ('Accounting help', 'accounting-help')
on conflict (slug) do nothing;
