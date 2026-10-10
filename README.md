# Omega

Omega is a marketplace that connects local businesses with creators. Businesses publish collaboration campaigns. Creators discover work nearby and apply.

This repository is the production foundation, public landing page, and email/password accounts. Campaigns, applications, and other marketplace features are not built yet.

## Technology stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com/)
- Supabase Auth and PostgreSQL, with a profiles table protected by row level security
- Vercel is the deployment target

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local` is gitignored. The example file contains no secrets. Signup and login read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Apply `supabase/migrations/20261009160000_auth_profiles.sql` in the Supabase SQL editor before expecting a profile row. The app does not ship a service role key, so it cannot create that table itself. If the project requires email confirmation, a new account can log in after the confirmation link is opened.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Project structure

```text
src/
  app/                  App Router pages, metadata, and global styles
  components/
    brand/              Omega mark
    landing/            Landing page sections
    layout/             Header, footer, and page chrome
    ui/                 Reusable interface primitives
  config/               Site copy and navigation
  lib/                  Shared helpers, Supabase clients, and auth actions
supabase/migrations/    SQL for the profiles table, trigger, and row level security
.env.example            Documented public environment variables
```

## Planned V1 modules

Authentication is implemented for signup, login, logout, and a private account page. These are not implemented:

- PostgreSQL models for campaigns and applications
- Supabase Storage for creative assets
- Campaign publishing
- Creator discovery and applications
- Business and creator dashboards
- Messaging
- Payments
