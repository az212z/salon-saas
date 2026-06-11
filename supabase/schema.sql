-- ============================================================
-- منصة SaaS لحجوزات الصالونات والسبا — مخطط قاعدة البيانات الكامل
-- Multi-Tenant Architecture with Row Level Security
-- ============================================================

-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE public.user_role AS ENUM ('platform_owner', 'salon_owner', 'salon_manager', 'staff', 'customer');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'apple_pay', 'mada', 'wallet', 'gift_card');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'suspended');
CREATE TYPE public.gift_card_status AS ENUM ('active', 'redeemed', 'expired');
CREATE TYPE public.coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_service');
CREATE TYPE public.day_of_week AS ENUM ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday');
CREATE TYPE public.loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'vip');
CREATE TYPE public.staff_permission AS ENUM ('full_access', 'limited', 'view_only');
CREATE TYPE public.whatsapp_message_type AS ENUM (
  'booking_confirmation', 'booking_reminder_24h', 'booking_reminder_2h',
  'booking_completed_thankyou', 'review_request', 'missed_you',
  'birthday_greeting', 'custom_campaign', 'waitlist_notification',
  'no_show_warning', 'subscription_reminder'
);
CREATE TYPE public.booking_payment_type AS ENUM ('full', 'deposit', 'in_salon');

-- ==========================================
-- 2. PLANS (خطط الاشتراك)
-- ==========================================

CREATE TABLE public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL, -- {"ar": "أساسية", "en": "Basic"}
  slug TEXT NOT NULL UNIQUE, -- "basic", "professional", "advanced"
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  max_staff INTEGER NOT NULL DEFAULT 2,
  max_branches INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '{}', -- feature flags
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default plans
INSERT INTO public.plans (name, slug, price_monthly, price_yearly, max_staff, max_branches, features, sort_order) VALUES
  ('{"ar":"أساسية","en":"Basic"}', 'basic', 299, 2990, 2, 1,
   '{"bookings":true,"crm":true,"whatsapp_reminders":true,"loyalty":false,"gift_cards":false,"campaigns":false,"custom_domain":false,"advanced_reports":false,"priority_support":false}', 1),
  ('{"ar":"احترافية","en":"Professional"}', 'professional', 599, 5990, 999, 1,
   '{"bookings":true,"crm":true,"whatsapp_reminders":true,"loyalty":true,"gift_cards":true,"campaigns":true,"custom_domain":false,"advanced_reports":false,"priority_support":false}', 2),
  ('{"ar":"متقدمة","en":"Advanced"}', 'advanced', 999, 9990, 999, 5,
   '{"bookings":true,"crm":true,"whatsapp_reminders":true,"loyalty":true,"gift_cards":true,"campaigns":true,"custom_domain":true,"advanced_reports":true,"priority_support":true}', 3);

-- ==========================================
-- 3. TENANTS (الصالونات)
-- ==========================================

CREATE TABLE public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly: "luxe-beauty"
  name JSONB NOT NULL, -- {"ar": "لوكس بيوتي", "en": "Luxe Beauty"}
  description JSONB,
  owner_id UUID REFERENCES auth.users(id),
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#8B5CF6', -- لون رئيسي قابل للتخصيص
  secondary_color TEXT DEFAULT '#F3E8FF',
  phone TEXT,
  email TEXT,
  website TEXT,
  address JSONB, -- {street, city, district, lat, lng}
  social_links JSONB DEFAULT '{}', -- {instagram, twitter, snapchat, tiktok}
  business_hours JSONB DEFAULT '{}', -- global default hours per day
  currency TEXT DEFAULT 'SAR',
  locale TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}', -- salon-level feature toggles + policies
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. SUBSCRIPTIONS (اشتراكات الصالونات)
-- ==========================================

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status subscription_status DEFAULT 'trial',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_method_id TEXT, -- Moyasar/Tap payment method
  billing_cycle TEXT DEFAULT 'monthly', -- monthly / yearly
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_active_subscription UNIQUE (tenant_id, status)
);

-- ==========================================
-- 5. USERS (المستخدمون — موحد مع Auth)
-- ==========================================

CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL for platform_owner
  role user_role NOT NULL DEFAULT 'customer',
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'ar',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 6. CATEGORIES (تصنيفات الخدمات)
-- ==========================================

CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 7. SERVICES (الخدمات)
-- ==========================================

CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name JSONB NOT NULL,
  description JSONB,
  duration_minutes INTEGER NOT NULL, -- المدة بالدقائق
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- السعر قبل الخصم
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_consultation BOOLEAN DEFAULT false, -- يحتاج استشارة أولية
  gender TEXT DEFAULT 'female', -- female / male / both
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. STAFF (الموظفات)
-- ==========================================

CREATE TABLE public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id), -- may be NULL if not yet claimed
  name TEXT NOT NULL,
  name_en TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  bio JSONB,
  specializations TEXT[] DEFAULT '{}',
  commission_percentage DECIMAL(5,2) DEFAULT 0, -- نسبة العمولة
  permission_level staff_permission DEFAULT 'limited',
  is_active BOOLEAN DEFAULT true,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 9. STAFF_SERVICES (خدمات كل موظفة)
-- ==========================================

CREATE TABLE public.staff_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_duration_minutes INTEGER, -- مدة مخصصة لهذه الموظفة
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_staff_service UNIQUE (staff_id, service_id)
);

-- ==========================================
-- 10. STAFF_SCHEDULES (جداول دوام الموظفات)
-- ==========================================

CREATE TABLE public.staff_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  is_working BOOLEAN DEFAULT true,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  break_start TIME, -- بداية الاستراحة
  break_end TIME, -- نهاية الاستراحة
  CONSTRAINT unique_staff_day UNIQUE (staff_id, day_of_week)
);

-- ==========================================
-- 11. STAFF_TIME_OFF (إجازات الموظفات)
-- ==========================================

CREATE TABLE public.staff_time_off (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending / approved / rejected
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 12. CUSTOMERS (قاعدة العملاء)
-- ==========================================

CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id), -- link to auth user if exists
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birth_date DATE,
  avatar_url TEXT,
  gender TEXT DEFAULT 'female',
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier loyalty_tier DEFAULT 'bronze',
  lifetime_value DECIMAL(10,2) DEFAULT 0, -- إجمالي الإنفاق
  total_visits INTEGER DEFAULT 0,
  average_spend DECIMAL(10,2) DEFAULT 0,
  wallet_balance DECIMAL(10,2) DEFAULT 0, -- رصيد المحفظة
  referral_code TEXT UNIQUE, -- كود الإحالة
  referred_by UUID REFERENCES public.customers(id), -- من أحالتها
  referral_rewards_earned INTEGER DEFAULT 0,
  -- ملف الجمال
  skin_type TEXT, -- نوع البشرة
  hair_color TEXT, -- لون الشعر
  preferred_color TEXT, -- اللون المفضل للصبغة
  allergies TEXT[], -- حساسيات من منتجات
  preferred_services UUID[] DEFAULT '{}', -- IDs of preferred services
  beauty_notes TEXT, -- ملاحظات جمالية عامة
  --
  tags TEXT[] DEFAULT '{}', -- وسوم قابلة للتخصيص
  notes TEXT, -- ملاحظات الإدارة (لا تراها العميلة)
  is_active BOOLEAN DEFAULT true,
  last_visit_at TIMESTAMPTZ,
  acquired_source TEXT DEFAULT 'walk_in', -- walk_in / referral / website / instagram / phone
  marketing_consent BOOLEAN DEFAULT true, -- الموافقة على الرسائل التسويقية
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX idx_customers_phone ON public.customers(tenant_id, phone);
CREATE INDEX idx_customers_tier ON public.customers(tenant_id, loyalty_tier);

-- ==========================================
-- 13. CUSTOMER_NOTES (ملاحظات داخلية على العملاء)
-- ==========================================

CREATE TABLE public.customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  note TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 14. BOOKINGS (الحجوزات)
-- ==========================================

CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL, -- رقم الحجز المرجعي
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  staff_id UUID REFERENCES public.staff(id), -- NULL = أي موظفة متاحة
  status booking_status DEFAULT 'pending',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_duration INTEGER NOT NULL, -- بالدقائق
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_type booking_payment_type DEFAULT 'in_salon',
  payment_status payment_status DEFAULT 'unpaid',
  payment_method payment_method,
  deposit_amount DECIMAL(10,2), -- مبلغ العربون
  coupon_id UUID,
  gift_card_id UUID,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  notes TEXT, -- ملاحظات من العميلة
  internal_notes TEXT, -- ملاحظات الإدارة
  is_group_booking BOOLEAN DEFAULT false, -- حجز جماعي
  group_booking_id UUID, -- ربط الحجوزات الجماعية
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  reminder_sent_24h BOOLEAN DEFAULT false,
  reminder_sent_2h BOOLEAN DEFAULT false,
  review_request_sent BOOLEAN DEFAULT false,
  no_show_warning_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_booking_number UNIQUE (tenant_id, booking_number)
);

CREATE INDEX idx_bookings_tenant_date ON public.bookings(tenant_id, booking_date);
CREATE INDEX idx_bookings_staff_date ON public.bookings(tenant_id, staff_id, booking_date);
CREATE INDEX idx_bookings_customer ON public.bookings(tenant_id, customer_id);
CREATE INDEX idx_bookings_status ON public.bookings(tenant_id, status);

-- ==========================================
-- 15. BOOKING_ITEMS (خدمات الحجز الواحد)
-- ==========================================

CREATE TABLE public.booking_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  staff_id UUID REFERENCES public.staff(id), -- can differ per item
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ==========================================
-- 16. LOYALTY_TRANSACTIONS (حركات النقاط)
-- ==========================================

CREATE TABLE public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  points INTEGER NOT NULL, -- positive = earned, negative = redeemed
  type TEXT NOT NULL, -- 'earn', 'redeem', 'bonus', 'referral', 'expire', 'admin_adjust'
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 17. GIFT_CARDS (بطاقات الهدايا)
-- ==========================================

CREATE TABLE public.gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- كود البطاقة
  amount DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  purchased_by UUID REFERENCES public.customers(id), -- من اشتراها
  gifted_to_name TEXT,
  gifted_to_phone TEXT, -- رقم المُهداة
  gift_message TEXT, -- الرسالة الشخصية
  gift_design TEXT DEFAULT 'default', -- تصميم البطاقة
  status gift_card_status DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_gift_card_code UNIQUE (tenant_id, code)
);

-- ==========================================
-- 18. COUPONS (الكوبونات والعروض)
-- ==========================================

CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  type coupon_type NOT NULL,
  value DECIMAL(10,2) NOT NULL, -- النسبة أو المبلغ
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  applicable_services UUID[] DEFAULT '{}', -- empty = all services
  applicable_categories UUID[] DEFAULT '{}', -- empty = all categories
  is_auto_apply BOOLEAN DEFAULT false, -- تطبيق تلقائي للعميلات المستهدفين
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_coupon_code UNIQUE (tenant_id, code)
);

-- ==========================================
-- 19. PACKAGES (الباقات)
-- ==========================================

CREATE TABLE public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- السعر قبل الباقة
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  total_sessions INTEGER, -- عدد الجلسات (للاشتراكات الشهرية)
  validity_days INTEGER, -- صلاحية الباقة بالأيام
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.package_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  quantity INTEGER DEFAULT 1,
  CONSTRAINT unique_package_service UNIQUE (package_id, service_id)
);

-- ==========================================
-- 20. REVIEWS (التقييمات)
-- ==========================================

CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 21. WAITLIST (قائمة الانتظار)
-- ==========================================

CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  staff_id UUID, -- NULL = any staff
  preferred_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  status TEXT DEFAULT 'waiting', -- waiting / notified / booked / cancelled
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 22. WHATSAPP_MESSAGES (سجل الرسائل)
-- ==========================================

CREATE TABLE public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type whatsapp_message_type NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending / sent / delivered / read / failed
  external_message_id TEXT, -- WhatsApp message ID
  campaign_id UUID, -- NULL for automated messages
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 23. WHATSAPP_CAMPAIGNS (حملات واتساب)
-- ==========================================

CREATE TABLE public.whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  target_filters JSONB DEFAULT '{}', -- {tiers: [], tags: [], last_visit_days: 30, ...}
  status TEXT DEFAULT 'draft', -- draft / scheduled / sending / completed / failed
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  responded_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 24. WHATSAPP_TEMPLATES (قوالب الرسائل)
-- ==========================================

CREATE TABLE public.whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type whatsapp_message_type NOT NULL,
  name TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  content_en TEXT,
  is_active BOOLEAN DEFAULT true,
  variables TEXT[] DEFAULT '{}', -- المتغيرات في النص مثل {customer_name}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_template_type UNIQUE (tenant_id, type)
);

-- ==========================================
-- 25. SETTINGS (إعدادات الصالون — مفاتيح/قيم)
-- ==========================================

CREATE TABLE public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_setting UNIQUE (tenant_id, key)
);

-- Insert default settings template per tenant (handled via trigger or app logic)
-- Keys: cancellation_deadline_hours, deposit_percentage, deposit_required, payment_methods,
--       loyalty_points_per_riyal, loyalty_tier_thresholds, review_auto_request,
--       whatsapp_enabled, booking_slot_interval_minutes, max_future_booking_days, etc.

-- ==========================================
-- 26. BRANCHES (الفروع)
-- ==========================================

CREATE TABLE public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  phone TEXT,
  email TEXT,
  address JSONB,
  business_hours JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 27. NOTIFICATIONS (الإشعارات داخل التطبيق)
-- ==========================================

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  body JSONB NOT NULL,
  type TEXT NOT NULL, -- booking / system / marketing / reminder
  reference_id UUID, -- booking_id / campaign_id etc
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(tenant_id, user_id, is_read);

-- ==========================================
-- 28. SALON_IMAGES (معرض صور الصالون)
-- ==========================================

CREATE TABLE public.salon_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption JSONB,
  category TEXT DEFAULT 'gallery', -- gallery / before_after / staff / salon
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 29. PAYMENTS (المدفوعات)
-- ==========================================

CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  payment_method payment_method NOT NULL,
  payment_type TEXT NOT NULL, -- 'booking' / 'deposit' / 'gift_card' / 'subscription' / 'wallet_topup'
  status payment_status DEFAULT 'unpaid',
  gateway TEXT, -- 'moyasar' / 'tap'
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 30. AUDIT_LOG (سجل التدقيق)
-- ==========================================

CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'booking' / 'customer' / 'staff' etc
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_users_tenant ON public.users(tenant_id);
CREATE INDEX idx_staff_tenant ON public.staff(tenant_id);
CREATE INDEX idx_services_tenant ON public.services(tenant_id, is_active);
CREATE INDEX idx_bookings_date_status ON public.bookings(tenant_id, booking_date, status);
CREATE INDEX idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX idx_loyalty_customer ON public.loyalty_transactions(tenant_id, customer_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Platform owner can see all tenants
CREATE POLICY "Platform owner sees all tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_owner')
  );

-- Salon users can only see their own tenant
CREATE POLICY "Tenant isolation for tenants" ON public.tenants
  FOR ALL USING (
    id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Generic tenant isolation policy for all tenant-scoped tables
-- (Applied to each table below)

-- Helper function to get current user's tenant
CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if current user is platform owner
CREATE OR REPLACE FUNCTION public.is_platform_owner() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_owner');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Generic RLS policies for tenant-scoped tables
-- (Apply same pattern to each table)

-- users
CREATE POLICY "Users see own tenant" ON public.users
  FOR SELECT USING (
    tenant_id = current_tenant_id() OR is_platform_owner()
  );
CREATE POLICY "Users modify own tenant" ON public.users
  FOR ALL USING (
    tenant_id = current_tenant_id() OR is_platform_owner()
  );

-- categories
CREATE POLICY "Categories tenant isolation" ON public.categories
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- services
CREATE POLICY "Services tenant isolation" ON public.services
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- staff
CREATE POLICY "Staff tenant isolation" ON public.staff
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- staff_services
CREATE POLICY "Staff services tenant isolation" ON public.staff_services
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- staff_schedules
CREATE POLICY "Staff schedules tenant isolation" ON public.staff_schedules
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- staff_time_off
CREATE POLICY "Staff time off tenant isolation" ON public.staff_time_off
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- customers
CREATE POLICY "Customers tenant isolation" ON public.customers
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- customer_notes
CREATE POLICY "Customer notes tenant isolation" ON public.customer_notes
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- bookings
CREATE POLICY "Bookings tenant isolation" ON public.bookings
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- booking_items
CREATE POLICY "Booking items tenant isolation" ON public.booking_items
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- loyalty_transactions
CREATE POLICY "Loyalty transactions tenant isolation" ON public.loyalty_transactions
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- gift_cards
CREATE POLICY "Gift cards tenant isolation" ON public.gift_cards
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- coupons
CREATE POLICY "Coupons tenant isolation" ON public.coupons
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- packages
CREATE POLICY "Packages tenant isolation" ON public.packages
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- package_items
CREATE POLICY "Package items tenant isolation" ON public.package_items
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- reviews
CREATE POLICY "Reviews tenant isolation" ON public.reviews
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- waitlist
CREATE POLICY "Waitlist tenant isolation" ON public.waitlist
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- whatsapp_messages
CREATE POLICY "WhatsApp messages tenant isolation" ON public.whatsapp_messages
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- whatsapp_campaigns
CREATE POLICY "WhatsApp campaigns tenant isolation" ON public.whatsapp_campaigns
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- whatsapp_templates
CREATE POLICY "WhatsApp templates tenant isolation" ON public.whatsapp_templates
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- settings
CREATE POLICY "Settings tenant isolation" ON public.settings
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- branches
CREATE POLICY "Branches tenant isolation" ON public.branches
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- notifications
CREATE POLICY "Notifications tenant isolation" ON public.notifications
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- salon_images
CREATE POLICY "Salon images tenant isolation" ON public.salon_images
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- payments
CREATE POLICY "Payments tenant isolation" ON public.payments
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- audit_log
CREATE POLICY "Audit log tenant isolation" ON public.audit_log
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- subscriptions
CREATE POLICY "Subscriptions tenant isolation" ON public.subscriptions
  FOR ALL USING (tenant_id = current_tenant_id() OR is_platform_owner());

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'BK-' || to_char(now(), 'YYYYMMDD') || '-' || 
      lpad(nextval('public.booking_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE public.booking_seq;
CREATE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_booking_number();

-- Auto-generate referral code for customers
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Auto-generate gift card code
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := 'GC-' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_gift_card_code
  BEFORE INSERT ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION public.generate_gift_card_code();

-- Update customer stats when booking is completed
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.customers SET
      total_visits = total_visits + 1,
      lifetime_value = lifetime_value + NEW.total_amount,
      average_spend = CASE WHEN total_visits + 1 > 0 
        THEN (lifetime_value + NEW.total_amount) / (total_visits + 1)
        ELSE NEW.total_amount END,
      last_visit_at = now()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable realtime for bookings (calendar live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;