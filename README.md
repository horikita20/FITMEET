# FitMeet

**FitMeet – Discover. Connect. Move Together.**

FitMeet is a fitness community platform designed to help people discover fitness events, join meets, connect with fitness enthusiasts, and collaborate with organizers and communities.

## Features
- Discover and explore fitness meets.
- Join fitness events and activities.
- User authentication.
- User and organizer dashboards.
- Collaboration opportunities.
- Event registration and management.
- Responsive user interface.

## Tech Stack
- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- Node.js

## Run Locally

**Prerequisites:** Node.js and npm

1. Clone the repository:
   ```bash
   git clone https://github.com/horikita20/FITMEET.git
   ```

2. Navigate to the project directory:
   ```bash
   cd FITMEET
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure your environment variables using `.env.example`.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Admin Portal

The owner portal is available at `/admin/login`; the dashboard is at `/admin`.
Apply all SQL migrations in `supabase/migrations` before use. Configure the
Supabase URL and anon key for the frontend, and configure `SUPABASE_URL` plus
`SUPABASE_SERVICE_ROLE_KEY` only in the server environment. Never expose the
service-role key as a `VITE_` variable.

New accounts receive the `customer` role. The security migration resets any
previous `super_admin` assignments so they cannot inherit roles granted by the
old self-editable profile policy. To authorize the site owner, first create the
account through Supabase Auth, then run this once in the Supabase SQL editor
using the owner's actual sign-in email:

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'owner@example.com';
```

Admin authorization is checked against the database profile on every protected
API request. Configure `RAZORPAY_KEY_ID` (or `VITE_RAZORPAY_KEY_ID`),
`RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` on the server to accept and
verify payments. Revenue reports include captured transactions only.

## Project

FitMeet aims to bring fitness enthusiasts together through community-driven events and collaborations.

---

**FitMeet – Move Together. Grow Together.**
