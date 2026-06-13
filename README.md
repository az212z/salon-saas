# Salon SaaS Platform — منصة SaaS لحجوزات الصالونات والسبا

## روابط النشر

- التطبيق الكامل على Vercel: https://salon-saas-platform.vercel.app
- صفحة العرض على GitHub Pages: https://az212z.github.io/salon-saas/
- الكود الكامل على GitHub: https://github.com/az212z/salon-saas
- فحص جاهزية التشغيل: https://salon-saas-platform.vercel.app/api/system/readiness

## حالة التشغيل الحالية

- جاهز أونلاين كعرض SaaS وتجربة مبيعات.
- يعمل كواجهة Demo للعميل، المدير، الموظفة، ومالك المنصة.
- واتساب مستثنى من النشر الحالي ومضبوط كمعطل عبر `WHATSAPP_ENABLED=false`.
- ليس جاهزا كتسليم إنتاج يومي حقيقي حتى يتم ربط مفاتيح Supabase والدفع والدومين.
- راجع `docs/PRODUCTION_READINESS.md` قبل تسليم أي صالون فعلي.

## 🏗️ البنية

```
salon-saas-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (RTL, Arabic, Theme)
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Design system + RTL + animations
│   │   ├── (client)/                 # Client portal (tenant subdomain)
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx          # Salon homepage
│   │   │   │   ├── booking/page.tsx  # Booking flow
│   │   │   │   ├── profile/page.tsx  # Customer profile
│   │   │   │   └── ...
│   │   ├── (dashboard)/              # Salon admin dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Main dashboard
│   │   │   │   ├── bookings/         # Bookings management
│   │   │   │   ├── customers/         # CRM
│   │   │   │   ├── staff/            # Staff management
│   │   │   │   ├── services/         # Services management
│   │   │   │   ├── whatsapp/         # WhatsApp center
│   │   │   │   ├── reports/          # Reports & analytics
│   │   │   │   ├── loyalty/          # Loyalty & gifts
│   │   │   │   ├── settings/         # Salon settings
│   │   │   │   └── ...
│   │   │   └── layout.tsx
│   │   ├── (staff)/                  # Staff portal
│   │   │   └── staff/
│   │   │       ├── page.tsx          # Staff schedule
│   │   │       └── ...
│   │   ├── (platform)/              # Super admin (platform owner)
│   │   │   └── admin/
│   │   │       ├── page.tsx          # Platform dashboard
│   │   │       ├── tenants/          # Salon management
│   │   │       ├── plans/            # Subscription plans
│   │   │       ├── billing/          # Billing & payments
│   │   │       └── ...
│   │   ├── auth/                    # Authentication
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── otp/page.tsx
│   │   │   └── callback/page.tsx
│   │   └── api/                     # API routes
│   │       ├── bookings/            # Booking API
│   │       ├── webhooks/            # Payment & WhatsApp webhooks
│   │       └── ...
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── providers/               # Auth, Theme, Query providers
│   │   ├── booking/                 # Booking flow components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── layout/                  # Sidebar, Navbar, etc.
│   │   └── shared/                  # Shared components
│   ├── lib/
│   │   ├── supabase/                # Supabase clients (server + browser)
│   │   ├── bookings/                # Booking engine ⭐
│   │   │   └── engine.ts            # Core booking logic
│   │   ├── whatsapp/                # WhatsApp integration
│   │   ├── payments/                # Payment gateway (Moyasar/Tap)
│   │   ├── crm/                     # CRM utilities
│   │   ├── loyalty/                 # Loyalty & gifts engine
│   │   └── utils.ts                 # Shared utilities
│   └── types/
│       └── index.ts                 # TypeScript types
├── supabase/
│   └── schema.sql                   # Complete database schema
├── public/
│   └── ...
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🎯 المراحل

### ✅ المرحلة 0 — البنية متعددة المستأجرين
- [x] مخطط قاعدة البيانات الكامل (30 جدول + RLS + Triggers)
- [x] أنواع TypeScript الكاملة
- [x] Supabase server/client setup مع RLS
- [x] Middleware للـ subdomain resolution
- [x] Auth provider (OTP + Email)
- [x] Design system (RTL + Arabic fonts + Dark mode)
- [x] Tailwind config مع ألوان قابلة للتخصيص لكل صالون

### 🔄 المرحلة 1 — محرك الحجوزات ⭐
- [x] حساب الأوقات المتاحة (دوام − حجوزات − راحات − إجازات)
- [x] منع التعارض + قفل الموعد
- [x] واجهة حجز متعدد الخطوات (خدمات → موظفة → موعد → تأكيد)
- [ ] API routes للحجوزات
- [ ] Realtime للتقويم

### 🔄 المرحلة 2 — واجهة الزبائن
- [x] صفحة رئيسية للصالون بهويته
- [x] مسار الحجز متعدد الخطوات
- [ ] تسجيل OTP بالجوال
- [ ] صفحة العميلة الشخصية الكاملة
- [ ] نظام النقاط والهدايا

### 🔄 المرحلة 3 — لوحة إدارة الصالون + CRM
- [x] لوحة تحكم رئيسية (Stats + Quick Actions + Timeline)
- [ ] CRM كامل (قائمة عملاء + ملف تفصيلي + وسوم + تصنيف ذكي)
- [ ] تقويم تفاعلي (Timeline + سحب وإفلات)
- [ ] CRUD الخدمات والموظفات والإعدادات

### ⬜ المرحلة 4 — واجهة الموظفات
### ⬜ المرحلة 5 — واتساب والأتمتة
### ⬜ المرحلة 6 — الولاء والهدايا والعروض
### ⬜ المرحلة 7 — طبقة SaaS والدفع

## 🛠️ التقنيات
- **Next.js 14** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (RTL-ready)
- **Supabase** (PostgreSQL + Auth + Realtime + Storage + RLS)
- **WhatsApp Business Cloud API** (رسائل تلقائية + حملات)
- **Moyasar / Tap Payments** (مدى + Apple Pay)
- **Vercel** (Subdomains ديناميكية لكل صالون)

## 💡 مميزات إضافية مقترحة
1. قائمة انتظار ذكية
2. نظام مكافحة عدم الحضور
3. حجز جماعي
4. اشتراكات شهرية للعميلات
5. متجر منتجات مصغر
6. ذكاء اصطناعي لاقتراح الخدمات
7. تقرير أسبوعي واتساب تلقائي
8. صفحة تسويقية للمنصة
