# BlindBridge AI

AI accessibility platform for blind and deaf users — real-time vision, voice and captions on the device you already own.

## Features

- **Blind Mode** — AI-powered navigation and scene description
- **Deaf Mode** — Live captions with translation and type-to-speak
- **Instant Reader** — OCR for labels, menus, money, and documents
- **Emergency SOS** — One-tap location sharing with trusted contacts
- **Authentication** — Driver and Customer signup/login with Supabase
- **Super Admin Panel** — Manage all users, roles, and account status

## Tech Stack

- TanStack Start / React / TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase (Auth + Database)
- Vercel (Deployment)

## Setup

### 1. Clone and install

```sh
git clone https://github.com/ShauryaMhatre04/bridge-ai.git
cd bridge-ai
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from **Settings > API**
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set up the database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor. This creates:
- `profiles` table with role-based access (customer, driver, admin)
- Row Level Security policies
- Indexes for performance

### 4. Create the first admin

1. Sign up through the app as a regular user
2. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 5. Run locally

```sh
npm run dev
```

### 6. Deploy to Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Deploy

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account (Driver or Customer) |
| `/dashboard` | User dashboard (protected) |
| `/admin` | Super Admin panel (admin only) |
| `/vision` | Blind Mode |
| `/captions` | Deaf Mode |
| `/read` | Instant Reader |
| `/sos` | Emergency SOS |

## Authentication Roles

- **Customer** — Standard user with access to all accessibility features
- **Driver** — Driver account with phone number required
- **Admin** — Full access to Super Admin panel for user management

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase