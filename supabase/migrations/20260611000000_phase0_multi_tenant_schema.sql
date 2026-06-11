-- Phase 0: multi-tenant foundation for the salon/spa booking SaaS.
-- Designed for Supabase Postgres. Tenant-owned tables carry tenant_id and RLS.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type public.user_role as enum (
  'platform_owner',
  'salon_admin',
  'supervisor',
  'receptionist',
  'staff',
  'customer'
);

create type public.tenant_status as enum (
  'trialing',
  'active',
  'past_due',
  'suspended',
  'cancelled'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'expired'
);

create type public.booking_status as enum (
  'draft',
  'held',
  'confirmed',
  'waiting',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

create type public.payment_status as enum (
  'unpaid',
  'deposit_paid',
  'paid',
  'refunded',
  'failed'
);

create type public.payment_policy as enum (
  'full',
  'deposit',
  'in_salon'
);

create type public.whatsapp_message_status as enum (
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
  'cancelled'
);

create type public.loyalty_tier as enum (
  'bronze',
  'silver',
  'gold',
  'vip'
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  status public.tenant_status not null default 'trialing',
  trial_ends_at timestamptz,
  default_locale text not null default 'ar',
  timezone text not null default 'Asia/Riyadh',
  brand jsonb not null default '{}'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  monthly_price_sar numeric(10,2) not null check (monthly_price_sar >= 0),
  yearly_price_sar numeric(10,2) check (yearly_price_sar is null or yearly_price_sar >= 0),
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  preferred_locale text not null default 'ar',
  platform_role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  role public.user_role not null,
  is_active boolean not null default true,
  invited_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id, role)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status public.subscription_status not null default 'trialing',
  billing_period text not null default 'monthly' check (billing_period in ('monthly', 'yearly')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  provider text check (provider in ('moyasar', 'tap', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  host text not null unique,
  is_primary boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text,
  whatsapp_phone text,
  address text,
  map_url text,
  timezone text not null default 'Asia/Riyadh',
  opening_hours jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_sar numeric(10,2) not null check (price_sar >= 0),
  image_url text,
  requires_deposit boolean not null default false,
  deposit_percent numeric(5,2) check (deposit_percent is null or deposit_percent between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  display_name text not null,
  title text,
  bio text,
  photo_url text,
  commission_percent numeric(5,2) not null default 0 check (commission_percent between 0 and 100),
  permissions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, staff_id, service_id)
);

create table public.staff_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  break_ranges jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.staff_time_off (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  birth_date date,
  avatar_url text,
  loyalty_tier public.loyalty_tier not null default 'bronze',
  wallet_balance_sar numeric(10,2) not null default 0 check (wallet_balance_sar >= 0),
  points_balance integer not null default 0 check (points_balance >= 0),
  referral_code text not null,
  beauty_profile jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{"whatsapp_marketing": true}'::jsonb,
  first_visit_at timestamptz,
  last_visit_at timestamptz,
  lifetime_value_sar numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, phone),
  unique (tenant_id, referral_code)
);

create table public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  color text not null default '#2f6f63',
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table public.customer_tag_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  tag_id uuid not null references public.customer_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, customer_id, tag_id)
);

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_user_id uuid references public.app_users(id) on delete set null,
  note text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status public.booking_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  payment_policy public.payment_policy not null default 'deposit',
  total_sar numeric(10,2) not null default 0 check (total_sar >= 0),
  deposit_sar numeric(10,2) not null default 0 check (deposit_sar >= 0),
  source text not null default 'client_portal' check (source in ('client_portal', 'salon_admin', 'staff', 'import')),
  cancellation_reason text,
  internal_notes text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  staff_id uuid not null references public.staff_profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_sar numeric(10,2) not null check (price_sar >= 0),
  status public.booking_status not null default 'confirmed',
  time_range tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  constraint booking_items_no_overlapping_staff_time
    exclude using gist (tenant_id with =, staff_id with =, time_range with &&)
    where (status in ('confirmed', 'in_progress'))
);

create table public.booking_locks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  expires_at timestamptz not null,
  is_active boolean not null default true,
  time_range tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (expires_at > created_at),
  constraint booking_locks_no_overlapping_active_hold
    exclude using gist (tenant_id with =, staff_id with =, time_range with &&)
    where (is_active)
);

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  preferred_staff_id uuid references public.staff_profiles(id) on delete set null,
  preferred_date date,
  preferred_window text,
  status text not null default 'open' check (status in ('open', 'notified', 'booked', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.no_show_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  points integer not null,
  reason text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  purchaser_customer_id uuid references public.customers(id) on delete set null,
  recipient_customer_id uuid references public.customers(id) on delete set null,
  recipient_phone text,
  personal_message text,
  initial_value_sar numeric(10,2) not null check (initial_value_sar > 0),
  remaining_value_sar numeric(10,2) not null check (remaining_value_sar >= 0),
  expires_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  segment_filter jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  price_sar numeric(10,2) not null check (price_sar >= 0),
  visits_included integer not null default 1 check (visits_included > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.package_services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unique (tenant_id, package_id, service_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  title text not null,
  body text not null,
  trigger_rule jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  template_id uuid references public.whatsapp_templates(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  phone text not null,
  body text not null,
  status public.whatsapp_message_status not null default 'queued',
  provider_message_id text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  whatsapp_booking boolean not null default true,
  whatsapp_marketing boolean not null default true,
  email boolean not null default true,
  in_app boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (tenant_id, customer_id)
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  referrer_customer_id uuid not null references public.customers(id) on delete cascade,
  referred_customer_id uuid references public.customers(id) on delete set null,
  code text not null,
  reward_status text not null default 'pending' check (reward_status in ('pending', 'earned', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null check (provider in ('moyasar', 'tap', 'manual')),
  provider_payment_id text,
  amount_sar numeric(10,2) not null check (amount_sar >= 0),
  status public.payment_status not null default 'unpaid',
  payment_method text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references public.app_users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tenants', 'app_users', 'memberships', 'subscriptions', 'branches', 'settings',
    'categories', 'services', 'staff_profiles', 'staff_schedules', 'staff_time_off',
    'customers', 'customer_notes', 'bookings', 'booking_items', 'waitlist_entries',
    'gift_cards', 'coupons', 'packages', 'reviews', 'whatsapp_templates',
    'whatsapp_messages', 'notification_preferences', 'referrals', 'payments'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end $$;

create index memberships_tenant_id_idx on public.memberships (tenant_id);
create index memberships_user_id_idx on public.memberships (user_id);
create index subscriptions_tenant_id_idx on public.subscriptions (tenant_id);
create index tenant_domains_tenant_id_idx on public.tenant_domains (tenant_id);
create index branches_tenant_id_idx on public.branches (tenant_id);
create index settings_tenant_id_key_idx on public.settings (tenant_id, key);
create index categories_tenant_id_idx on public.categories (tenant_id);
create index services_tenant_id_category_id_idx on public.services (tenant_id, category_id);
create index staff_profiles_tenant_id_user_id_idx on public.staff_profiles (tenant_id, user_id);
create index staff_services_staff_id_idx on public.staff_services (staff_id);
create index staff_services_service_id_idx on public.staff_services (service_id);
create index staff_schedules_staff_id_idx on public.staff_schedules (staff_id);
create index staff_time_off_staff_time_idx on public.staff_time_off (staff_id, starts_at, ends_at);
create index customers_tenant_id_last_visit_idx on public.customers (tenant_id, last_visit_at desc);
create index customers_user_id_idx on public.customers (user_id);
create index customer_tag_links_customer_id_idx on public.customer_tag_links (customer_id);
create index customer_notes_customer_id_idx on public.customer_notes (customer_id);
create index bookings_tenant_status_idx on public.bookings (tenant_id, status, created_at desc);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index booking_items_booking_id_idx on public.booking_items (booking_id);
create index booking_items_staff_time_idx on public.booking_items using gist (tenant_id, staff_id, time_range);
create index booking_locks_expiry_idx on public.booking_locks (tenant_id, expires_at) where is_active;
create index waitlist_entries_tenant_status_idx on public.waitlist_entries (tenant_id, status, created_at desc);
create index loyalty_points_customer_id_idx on public.loyalty_points (customer_id);
create index gift_cards_recipient_idx on public.gift_cards (tenant_id, recipient_customer_id);
create index coupons_tenant_active_idx on public.coupons (tenant_id, is_active);
create index package_services_package_id_idx on public.package_services (package_id);
create index reviews_tenant_published_idx on public.reviews (tenant_id, is_published, created_at desc);
create index whatsapp_messages_tenant_status_idx on public.whatsapp_messages (tenant_id, status, scheduled_for);
create index referrals_referrer_idx on public.referrals (referrer_customer_id);
create index payments_tenant_status_idx on public.payments (tenant_id, status, created_at desc);
create index audit_events_tenant_created_idx on public.audit_events (tenant_id, created_at desc);

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where id = (select auth.uid())
      and platform_role = 'platform_owner'
  );
$$;

create or replace function public.has_tenant_role(
  target_tenant_id uuid,
  allowed_roles public.user_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_owner()
    or exists (
      select 1
      from public.memberships
      where tenant_id = target_tenant_id
        and user_id = (select auth.uid())
        and role = any (allowed_roles)
        and is_active
    );
$$;

create or replace function public.is_customer_owner(target_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.customers
    where id = target_customer_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_booking_customer_owner(target_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings b
    join public.customers c on c.id = b.customer_id
    where b.id = target_booking_id
      and c.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_public_tenant(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenants
    where id = target_tenant_id
      and status in ('trialing', 'active')
  );
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tenants', 'plans', 'app_users', 'memberships', 'subscriptions', 'tenant_domains',
    'branches', 'settings', 'categories', 'services', 'staff_profiles', 'staff_services',
    'staff_schedules', 'staff_time_off', 'customers', 'customer_tags',
    'customer_tag_links', 'customer_notes', 'bookings', 'booking_items', 'booking_locks',
    'waitlist_entries', 'no_show_flags', 'loyalty_points', 'gift_cards', 'coupons',
    'packages', 'package_services', 'reviews', 'whatsapp_templates', 'whatsapp_messages',
    'notification_preferences', 'referrals', 'payments', 'audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
  end loop;
end $$;

create policy plans_are_public_readable
  on public.plans for select
  to anon, authenticated
  using (is_active);

create policy platform_owners_manage_plans
  on public.plans for all
  to authenticated
  using ((select public.is_platform_owner()))
  with check ((select public.is_platform_owner()));

create policy users_can_read_own_profile
  on public.app_users for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_platform_owner()));

create policy users_can_update_own_profile
  on public.app_users for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_platform_owner()))
  with check (id = (select auth.uid()) or (select public.is_platform_owner()));

create policy users_can_insert_own_profile
  on public.app_users for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy tenants_public_or_member_read
  on public.tenants for select
  to anon, authenticated
  using (
    status in ('trialing', 'active')
    or (select public.is_platform_owner())
    or id in (
      select tenant_id from public.memberships
      where user_id = (select auth.uid()) and is_active
    )
  );

create policy platform_owners_manage_tenants
  on public.tenants for all
  to authenticated
  using ((select public.is_platform_owner()))
  with check ((select public.is_platform_owner()));

create policy memberships_member_or_admin_read
  on public.memberships for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor']::public.user_role[]))
  );

create policy memberships_admin_manage
  on public.memberships for all
  to authenticated
  using ((select public.has_tenant_role(tenant_id, array['salon_admin']::public.user_role[])))
  with check ((select public.has_tenant_role(tenant_id, array['salon_admin']::public.user_role[])));

create policy public_domains_select
  on public.tenant_domains for select
  to anon, authenticated
  using ((select public.is_public_tenant(tenant_id)));

create policy public_branches_select
  on public.branches for select
  to anon, authenticated
  using (is_active and (select public.is_public_tenant(tenant_id)));

create policy public_categories_select
  on public.categories for select
  to anon, authenticated
  using (is_active and (select public.is_public_tenant(tenant_id)));

create policy public_services_select
  on public.services for select
  to anon, authenticated
  using (is_active and (select public.is_public_tenant(tenant_id)));

create policy public_staff_select
  on public.staff_profiles for select
  to anon, authenticated
  using (is_active and (select public.is_public_tenant(tenant_id)));

create policy public_reviews_select
  on public.reviews for select
  to anon, authenticated
  using (is_published and (select public.is_public_tenant(tenant_id)));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'subscriptions', 'tenant_domains', 'branches', 'settings', 'categories', 'services',
    'staff_profiles', 'staff_services', 'staff_schedules', 'staff_time_off',
    'customer_tags', 'customer_tag_links', 'customer_notes', 'booking_items',
    'booking_locks', 'waitlist_entries', 'no_show_flags', 'loyalty_points',
    'gift_cards', 'coupons', 'packages', 'package_services', 'referrals',
    'whatsapp_templates', 'whatsapp_messages', 'payments', 'audit_events'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select public.has_tenant_role(tenant_id, array[''salon_admin'', ''supervisor'', ''receptionist'', ''staff'']::public.user_role[])))',
      table_name || '_operator_select',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select public.has_tenant_role(tenant_id, array[''salon_admin'', ''supervisor'', ''receptionist'']::public.user_role[])))',
      table_name || '_operator_insert',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select public.has_tenant_role(tenant_id, array[''salon_admin'', ''supervisor'', ''receptionist'']::public.user_role[]))) with check ((select public.has_tenant_role(tenant_id, array[''salon_admin'', ''supervisor'', ''receptionist'']::public.user_role[])))',
      table_name || '_operator_update',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select public.has_tenant_role(tenant_id, array[''salon_admin'', ''supervisor'']::public.user_role[])))',
      table_name || '_operator_delete',
      table_name
    );
  end loop;
end $$;

create policy customers_operator_select
  on public.customers for select
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist', 'staff']::public.user_role[]))
    or user_id = (select auth.uid())
  );

create policy customers_operator_insert
  on public.customers for insert
  to authenticated
  with check (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or user_id = (select auth.uid())
  );

create policy customers_operator_update
  on public.customers for update
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or user_id = (select auth.uid())
  )
  with check (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or user_id = (select auth.uid())
  );

create policy bookings_operator_or_customer_select
  on public.bookings for select
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist', 'staff']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  );

create policy bookings_operator_or_customer_insert
  on public.bookings for insert
  to authenticated
  with check (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  );

create policy bookings_operator_or_customer_update
  on public.bookings for update
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  )
  with check (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  );

create policy booking_items_customer_select
  on public.booking_items for select
  to authenticated
  using ((select public.is_booking_customer_owner(booking_id)));

create policy booking_items_customer_insert
  on public.booking_items for insert
  to authenticated
  with check ((select public.is_booking_customer_owner(booking_id)));

create policy booking_locks_customer_manage
  on public.booking_locks for all
  to authenticated
  using (
    customer_id is not null
    and (select public.is_customer_owner(customer_id))
  )
  with check (
    customer_id is not null
    and (select public.is_customer_owner(customer_id))
  );

create policy loyalty_points_customer_read
  on public.loyalty_points for select
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  );

create policy gift_cards_customer_read
  on public.gift_cards for select
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (purchaser_customer_id is not null and (select public.is_customer_owner(purchaser_customer_id)))
    or (recipient_customer_id is not null and (select public.is_customer_owner(recipient_customer_id)))
  );

create policy notification_preferences_customer_manage
  on public.notification_preferences for all
  to authenticated
  using (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  )
  with check (
    (select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[]))
    or (select public.is_customer_owner(customer_id))
  );

create policy referrals_customer_select
  on public.referrals for select
  to authenticated
  using (
    (select public.is_customer_owner(referrer_customer_id))
    or (referred_customer_id is not null and (select public.is_customer_owner(referred_customer_id)))
  );

create policy referrals_customer_insert
  on public.referrals for insert
  to authenticated
  with check ((select public.is_customer_owner(referrer_customer_id)));

create policy reviews_customer_insert
  on public.reviews for insert
  to authenticated
  with check (
    customer_id is not null
    and (select public.is_customer_owner(customer_id))
  );

create policy reviews_operator_manage
  on public.reviews for all
  to authenticated
  using ((select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[])))
  with check ((select public.has_tenant_role(tenant_id, array['salon_admin', 'supervisor', 'receptionist']::public.user_role[])));

insert into public.plans (code, name_ar, monthly_price_sar, yearly_price_sar, limits, features)
values
  ('basic', 'أساسية', 299, 2990, '{"staff": 2, "branches": 1}', '{"bookings": true, "crm": true, "whatsapp_reminders": true}'),
  ('pro', 'احترافية', 599, 5990, '{"staff": null, "branches": 1}', '{"loyalty": true, "gift_cards": true, "campaigns": true}'),
  ('advanced', 'متقدمة', 999, 9990, '{"staff": null, "branches": null}', '{"custom_domain": true, "advanced_reports": true, "priority_support": true}');
