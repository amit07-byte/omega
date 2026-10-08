# Omega

Omega is a marketplace that connects local businesses with creators. Businesses publish collaboration campaigns. Creators discover work nearby and apply.

This repository is the production foundation and public landing page. Accounts, campaigns, applications, and other marketplace features are not built yet.

## Technology stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com/)
- Supabase is planned for Auth, PostgreSQL, and Storage
- Vercel is the deployment target

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local` is gitignored. The example file contains no secrets. Supabase variables are reserved for later and are unused today.

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
  lib/                  Shared helpers and public environment access
.env.example            Documented public environment variables
```

## Planned V1 modules

These are not implemented:

- Supabase Auth for businesses and creators
- PostgreSQL models for profiles, campaigns, and applications
- Supabase Storage for creative assets
- Campaign publishing
- Creator discovery and applications
- Business and creator dashboards
- Messaging
- Payments
