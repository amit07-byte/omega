# Omega

Omega is a marketplace that connects local businesses with creators. Businesses publish collaboration campaigns. Creators discover work nearby and apply.

Businesses create a profile, publish collaboration campaigns, and accept or reject applications. Creators create a profile, browse published campaigns, and track application status. The first business campaign is free. Another campaign requires a paid plan, and checkout is not connected yet. Creators use Omega for free.

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
supabase/migrations/    SQL for profiles, campaigns, applications, and row level security
.env.example            Documented public environment variables
```

## Planned V1 modules

Apply both files in `supabase/migrations/` in the Supabase SQL editor before using campaigns. The app does not use a service-role key and cannot create the tables itself.

Signup, login, profiles, campaign publishing, applications, and the business pricing screen are implemented. These are not implemented:

- Payment checkout. The pricing screen does not mark a plan as paid.
- Messaging
- Escrow and analytics
