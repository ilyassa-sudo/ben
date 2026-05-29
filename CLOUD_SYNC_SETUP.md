# Team Cloud Sync Setup

The CRM now includes a Netlify Function at:

`/.netlify/functions/crm-state`

This lets the phone and computer share the same CRM data, but it needs Supabase and Netlify environment variables.

## 1. Create Supabase Table

In Supabase SQL Editor, run:

```sql
create table if not exists public.crm_state (
  workspace_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

## 2. Add Netlify Environment Variables

In Netlify, open the site settings and add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRM_SYNC_SECRET`

Use a private code for `CRM_SYNC_SECRET`. This is the code you type in the CRM Sync page on your phone and computer.

## 3. Redeploy

Upload the updated deploy zip or redeploy the project.

## 4. Use It

On the computer:

1. Open the Netlify CRM link.
2. Go to **Sync**.
3. Enter workspace: `benabella-realty`.
4. Enter your private sync code.
5. Click **Connect & Pull**.
6. Click **Push This Device**.

On the phone:

1. Open the same Netlify CRM link.
2. Go to **Sync**.
3. Enter the same workspace and sync code.
4. Click **Connect & Pull**.

After that, changes save locally and sync to the shared database.
