# Salon SaaS Implementation Map

This document maps the Arabic SaaS salon prompt to the current repository so the product can be reviewed without guessing what is real, demo-only, or provider-blocked.

## Canonical Scope

The product is a multi-tenant SaaS platform for salons and spas with four surfaces:

- Platform owner: `/admin`
- Salon admin: `/dashboard` and `/manager`
- Client portal: `/client` and `/[slug]`
- Staff portal: `/staff`

The app is Arabic-first, RTL, mobile responsive, and built with Next.js App Router, React, Tailwind, Supabase-oriented data structures, optional WhatsApp Cloud API placeholders, and Moyasar payment helpers.

## Database And Tenancy

The most complete multi-tenant schema is:

- `supabase/migrations/20260611000000_phase0_multi_tenant_schema.sql`

It includes:

- `tenants`, `plans`, `subscriptions`, `tenant_domains`
- `app_users`, `memberships`, role helpers, and RLS policies
- `branches`, `services`, `staff`, `staff_schedules`, `staff_time_off`
- `customers`, `customer_tags`, `customer_notes`, beauty profile fields
- `bookings`, `booking_items`, `booking_locks`, waitlist, no-show flags
- `loyalty_points`, `gift_cards`, `coupons`, packages, referrals
- `whatsapp_templates`, `whatsapp_messages`, `whatsapp_campaigns`
- `payments`, invoices, notifications, audit log
- PostgreSQL `btree_gist` overlap protection for staff booking conflicts

`tenant_id` is the isolation key for tenant-owned records. RLS helpers distinguish platform owners, salon roles, staff, and customer-owned records.

## Implemented UI Status

| Phase | Status | Where |
| --- | --- | --- |
| Phase 0 multi-tenant SaaS structure | Implemented as schema + UI model | `supabase/migrations/*phase0*`, `/admin` |
| Client booking flow | Demo working | `/client` |
| Client profile | Demo working | `/[slug]/profile` |
| Salon admin dashboard | Demo working | `/dashboard`, `/manager` |
| CRM | Demo working | `/dashboard/customers` |
| Services/staff/settings | Demo working | `/dashboard/services`, `/dashboard/staff`, `/dashboard/settings` |
| WhatsApp center | Optional, disabled in the current deployment | `/dashboard/whatsapp` |
| Staff portal | MVP demo | `/staff` |
| Platform owner control plane | Demo working | `/admin` |
| Salon onboarding | Demo working | `/auth/register` |

## Provider Reality

These are intentionally not claimed as live until real credentials are present:

- WhatsApp is disabled for the current live deployment with `WHATSAPP_ENABLED=false`. Enabling it later requires a Meta WhatsApp Cloud API token, phone number ID, verify token, app secret, and approved templates.
- Moyasar/Tap payments require production/test keys and webhook secrets.
- Supabase production auth/RLS requires a real project and seed data.
- Custom domains and wildcard subdomains require final DNS/Vercel domain configuration.

## Review Account

- Email: `ali212@icloud.com`
- Password: `123123`
- Demo OTP: `123123`
