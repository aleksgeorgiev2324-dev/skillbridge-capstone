# Supabase Setup

## 1. Create Project

1. Open https://supabase.com/dashboard
2. Click **New project**.
3. Choose your organization.
4. Use project name: `skillbridge-capstone`
5. Generate or enter a strong database password and save it somewhere safe.
6. Choose a nearby region.
7. Click **Create new project** and wait until the project is ready.

## 2. Apply Database Migration

1. Open the project in Supabase Dashboard.
2. Go to **SQL Editor**.
3. Open `supabase/migrations/202607130001_initial_schema.sql` from this repository.
4. Copy the whole SQL script.
5. Paste it into a new SQL query in Supabase.
6. Click **Run**.

This creates the database tables, relationships, indexes, RLS policies and Storage buckets.

## 3. Get Public Client Keys

1. In Supabase Dashboard, open **Project Settings**.
2. Open **API Keys** or the project **Connect** dialog.
3. Copy:
   - Project URL
   - Publishable key or legacy `anon` key

Use them in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Never use the `service_role` key or a secret key in this frontend project.

## 4. Create Demo Users

Create these users in **Authentication > Users**:

| Email | Password | Role |
| --- | --- | --- |
| demo@skillbridge.test | Demo123! | Regular user |
| admin@skillbridge.test | Admin123! | Admin user |

If Supabase asks, mark them as email-confirmed / auto-confirmed for easier testing.

## 5. Make Admin User Admin

After creating `admin@skillbridge.test`, open **SQL Editor** and run `supabase/seed.sql`.

That script updates the `user_roles` table and gives the admin account the `admin` role.

## 6. Local Test

Run:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Test login, listing creation, file upload, booking, review and admin moderation.
