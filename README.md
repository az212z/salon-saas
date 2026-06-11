# Luma SalonOS

Arabic RTL SaaS scaffold for salon and spa bookings.

## What Is Included

- Next.js 14 App Router + TypeScript + Tailwind CSS.
- shadcn/ui configuration and generated local UI primitives.
- Interactive Arabic prototype for:
  - platform owner dashboard,
  - salon admin dashboard,
  - client booking/profile portal,
  - staff portal.
- Supabase Phase 0 migration with tenant tables, indexed foreign keys, booking overlap constraints, booking locks, and RLS helper policies.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Online Pages

- `/client` - public-facing client booking and profile portal.
- `/manager` - salon manager dashboard for bookings, CRM, revenue, and staff.
- `/admin` - alias for the manager dashboard.

## Key Files

- `src/components/salon-saas-app.tsx` - the main RTL SaaS interface.
- `src/app/client/page.tsx` - dedicated client page.
- `src/app/manager/page.tsx` - dedicated manager page.
- `src/lib/demo-data.ts` - typed local demo data for the prototype.
- `supabase/migrations/20260611000000_phase0_multi_tenant_schema.sql` - Phase 0 schema and RLS.
- `docs/phase-0-architecture.md` - phase summary and suggested next steps.

## Phase Boundary

This phase is a reviewable product and database foundation. It does not connect live Supabase, WhatsApp, Moyasar, Tap, or Vercel wildcard domains yet. The next phase should implement the booking availability RPC, short-lived booking holds, and server actions that connect the UI to Supabase.
