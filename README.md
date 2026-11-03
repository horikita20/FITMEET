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

**Prerequisites:** Node.js `20.19+` or `22.12+` (see `.nvmrc`) and npm. Works the same on
macOS, Windows and Linux — all npm scripts are cross-platform.

Useful scripts:

- `npm run dev` – start the app at http://localhost:3000
- `npm run build` – production build into `dist/`
- `npm run lint` – TypeScript type-check
- `npm run format` / `npm run format:check` – format code with Prettier
- `npm run clean` – remove build output

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

The supported account roles are `user` and `admin`. Public registration and the
profile trigger assign `user`; only the configured owner account receives
`admin` through the forward-only two-role migration. Ensure the owner's
Supabase Auth account exists before applying that migration.

Admin authorization is checked against the database profile on every protected
API request. Configure `RAZORPAY_KEY_ID` (or `VITE_RAZORPAY_KEY_ID`),
`RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` on the server to accept and
verify payments. Revenue reports include captured transactions only.

### Gallery management

The Admin Portal Gallery section stores public images in the `fitmeet-gallery`
Supabase Storage bucket and image captions/metadata in `public.gallery_images`.
The required SQL is in
`supabase/migrations/20261103010000_gallery_management.sql`; review and apply it
to the intended Supabase project before using gallery uploads. Gallery writes
are handled by the server with the service-role key and require the authorized
admin session. The bucket allows JPEG, PNG and WebP files up to 10 MB.

## Project

FitMeet aims to bring fitness enthusiasts together through community-driven events and collaborations.

---

**FitMeet – Move Together. Grow Together.**
