# Phase 0 Architecture

## Product Slice

This repository starts the salon/spa SaaS as a reviewable Phase 0 scaffold:

- Arabic RTL Next.js App Router interface.
- shadcn/ui primitives configured for RTL expansion.
- Four product surfaces in one local prototype: platform owner, salon admin, client portal, and staff portal.
- Supabase migration for the multi-tenant data model, booking conflict protection, and RLS.

The visible UI uses local demo data only. Provider integrations such as Supabase Auth, WhatsApp Cloud API, Moyasar, Tap, and Vercel wildcard domains are represented in the schema and product flows, not connected to live credentials.

## Tenant Model

Tenant-owned data is keyed by `tenant_id`. Global platform catalog tables are intentionally limited to:

- `plans`
- `app_users`
- `tenants`

Memberships connect users to salons through `memberships(tenant_id, user_id, role)`. The RLS helpers are:

- `is_platform_owner()`
- `has_tenant_role(target_tenant_id, allowed_roles)`
- `is_customer_owner(target_customer_id)`
- `is_booking_customer_owner(target_booking_id)`
- `is_public_tenant(target_tenant_id)`

RLS policy rules:

- Platform owners can manage platform-level records.
- Salon admins/supervisors/receptionists/staff can read or manage tenant records based on role.
- Customers can read/update their own profile and create/read their booking path.
- Public salon pages can read active branches, categories, services, staff profiles, domains, and published reviews.

## Booking Engine Foundation

The migration already adds database-level conflict protection:

- `booking_items.time_range` is a generated `tstzrange`.
- `booking_items_no_overlapping_staff_time` prevents overlapping confirmed/in-progress appointments for the same staff member and tenant.
- `booking_locks.time_range` protects active checkout holds while a client completes payment.

The next phase should implement the availability query:

1. Load staff schedules for the chosen service and branch.
2. Subtract breaks and approved time off.
3. Subtract confirmed booking items and active booking locks.
4. Return slots that can fit the total selected service duration.
5. Insert a short-lived booking lock before moving to payment.

## Suggested Next Phase

Phase 1 should add the real booking engine module:

- Availability SQL/RPC function.
- Booking lock cleanup job.
- Server actions for hold, confirm, cancel, and no-show.
- Integration tests for overlap prevention and tenant isolation.
- Client portal booking wizard connected to Supabase.
