# Setting up accounts with Supabase

Without these steps the site still works in demo mode, saving progress in each browser.

## 1. Create the tables

In your Supabase project, open **SQL Editor**, paste all of [`schema.sql`](schema.sql), and press **Run**.
It creates two tables, `profiles` and `completed_steps`, and turns on row level security so each student can only read and change their own rows.
It is safe to run again.

## 2. Add the keys

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`: the project URL, such as `https://abcd1234.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the publishable key (`sb_publishable_...`), or the legacy `anon` key.

Never use the secret or `service_role` key. The site doesn't need it.
Restart `npm run dev` after changing `.env.local`.
When you deploy, add the same two values to your host's environment variables.

## 3. Choose how sign-up works

In **Authentication > Sign In / Providers > Email**:

- **Confirm email on (the default).** New students must click a link in an email before they can log in. Supabase's built-in email service sends only a few emails an hour, and only to your project's team members, so for real students you need your own email service under **Authentication > Emails > SMTP Settings** (Resend, Brevo or similar have free plans).
- **Confirm email off.** Students can log in straight away. This is simplest for a club, but anyone could sign up using someone else's email address.

## 4. Set the site address

In **Authentication > URL Configuration**, set **Site URL** to where the site lives, such as `http://localhost:3000` while testing, then your real address once it's online.
Add the same addresses under **Redirect URLs**, each followed by `/**`. Confirmation links can only send students back to these addresses.

## What is stored

| Table | Columns |
|---|---|
| `profiles` | `id` (the student's user id), `name`, `selected_domain`, `updated_at` |
| `completed_steps` | `user_id`, `step_id`, `completed_at` |

Step ids come from each project's `checklist` in `content/projects/`. They never change, so editing the content doesn't lose anyone's ticks.
