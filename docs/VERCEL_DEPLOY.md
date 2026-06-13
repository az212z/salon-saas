# 🚀 دليل نشر سالوني على Vercel — مع Wildcard Subdomains

## المتطلبات
- حساب Vercel (Pro/Enterprise للمجالات المخصصة)
- نطاق `saloni.sa` (أو أي نطاق)
- حساب Supabase Cloud (للإنتاج)

## الخطوة 1: إنشاء مشروع Supabase Cloud

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
supabase login

# Create cloud project
supabase projects create salon-saas-platform --region ap-southeast-1

# Link local project
supabase link --project-ref <your-project-ref>

# Push schema to cloud
supabase db push
```

## الخطوة 2: نشر على Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd salon-saas-platform
vercel

# Deploy to production
vercel --prod
```

## الخطوة 3: إعداد Wildcard Subdomains

### 3.1 DNS Configuration

في مزود DNS (مثل Cloudflare أو GoDaddy):

```
# A Record (main domain)
saloni.sa        →  76.76.21.21  (Vercel IP)

# CNAME Wildcard
*.saloni.sa      →  cname.vercel-dns.com

# CNAME www
www.saloni.sa    →  cname.vercel-dns.com
```

### 3.2 Vercel Domain Configuration

من Vercel Dashboard → Settings → Domains:

1. أضف `saloni.sa` (النطاق الرئيسي)
2. أضف `*.saloni.sa` (Wildcard)
3. أضف `www.saloni.sa`

⚠️ **مهم**: Wildcard subdomains تحتاج خطة Vercel Pro

### 3.3 Next.js Vercel Config

الملف `vercel.json` موجود في المشروع ويدعم wildcard rewrites.

## الخطوة 4: Environment Variables في Vercel

من Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ROOT_DOMAIN=saloni.sa
WHATSAPP_ENABLED=false
WHATSAPP_BUSINESS_TOKEN=EAA...
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_BUSINESS_ACCOUNT_ID=123...
WHATSAPP_VERIFY_TOKEN=saloni-whatsapp-verify-2026
MOYASAR_SECRET_KEY=sk_live_...
MOYASAR_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_APP_NAME=سالوني
NEXT_PUBLIC_APP_URL=https://saloni.sa
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_DEFAULT_CURRENCY=SAR
```

## الخطوة 5: SSL Certificate

Vercel يوفر SSL تلقائياً لكل النطاقات الفرعية ✅

## 🔄 سير Subdomains

| النطاق | الواجهة |
|--------|---------|
| `saloni.sa` | الصفحة التسويقية |
| `app.saloni.sa` | لوحة الإدارة العامة (Super Admin) |
| `luxe.saloni.sa` | صفحة صالون لوكس بيوتي |
| `noura.saloni.sa` | صفحة صالون نورة |
| `glam.saloni.sa` | صفحة صالون غلام |

## 💡 بديل: Vercel Pro بدون Wildcard

لو ما عندك Pro، استخدم path-based multi-tenancy:

```
saloni.sa/salon/luxe     → صفحة صالون لوكس
saloni.sa/salon/noura    → صفحة صالون نورة
saloni.sa/admin          → لوحة الإدارة
```

الـ middleware يدعم الطريقتين بالفعل!
