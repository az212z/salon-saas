-- ============================================================
-- Seed Data — 3 صالونات تجريبية + بيانات كاملة
-- Trial period: 2 months from creation
-- ============================================================

-- ==========================================
-- 1. الصالونات (Tenants)
-- ==========================================

INSERT INTO public.tenants (id, slug, name, description, plan_id, primary_color, secondary_color, phone, email, address, social_links, business_hours, currency, locale, timezone, trial_ends_at, settings, logo_url, cover_image_url) VALUES
  -- لوكس بيوتي
  ('a1b2c3d4-1111-1111-1111-111111111111', 'luxe-beauty',
   '{"ar": "لوكس بيوتي", "en": "Luxe Beauty"}',
   '{"ar": "صالون لوكس بيوتي — حيث الجمال يلتقي الأناقة. نقدم أحدث خدمات الشعر والبشرة والأظافر مع فريق محترف.", "en": "Luxe Beauty Salon — Where beauty meets elegance."}',
   (SELECT id FROM public.plans WHERE slug = 'professional'),
   '#8B5CF6', '#F3E8FF',
   '0551234567', 'info@luxebeauty.sa',
   '{"street": "شارع الأمير سلطان", "city": "جدة", "district": "الحمراء", "lat": 21.5433, "lng": 39.1728}',
   '{"instagram": "@luxebeauty_jeddah", "twitter": "@luxebeauty_sa", "snapchat": "luxebeauty", "tiktok": "@luxebeauty_jed"}',
   '{"saturday": {"start": "10:00", "end": "22:00"}, "sunday": {"start": "10:00", "end": "22:00"}, "monday": {"start": "10:00", "end": "22:00"}, "tuesday": {"start": "10:00", "end": "22:00"}, "wednesday": {"start": "10:00", "end": "22:00"}, "thursday": {"start": "12:00", "end": "23:00"}, "friday": {"start": "14:00", "end": "23:00"}}',
   'SAR', 'ar', 'Asia/Riyadh',
   NOW() + INTERVAL '2 months',
   '{"cancellation_deadline_hours": 6, "deposit_percentage": 20, "deposit_required": true, "loyalty_points_per_riyal": 10, "booking_slot_interval_minutes": 30, "max_future_booking_days": 30, "review_auto_request": true, "whatsapp_enabled": true}',
   'https://ui-avatars.com/api/?name=LB&background=8B5CF6&color=fff&size=200',
   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop'
  ),

  -- صالون نورة
  ('a1b2c3d4-2222-2222-2222-222222222222', 'noura-salon',
   '{"ar": "صالون نورة", "en": "Noura Salon"}',
   '{"ar": "صالون نورة — لمسة أنثى في كل خدمة. متخصصون في العناية بالشعر والصبغات الحديثة.", "en": "Noura Salon — A feminine touch in every service."}',
   (SELECT id FROM public.plans WHERE slug = 'professional'),
   '#EC4899', '#FCE7F3',
   '0559876543', 'info@nourasalon.sa',
   '{"street": "شارع التحلية", "city": "جدة", "district": "التحلية", "lat": 21.5169, "lng": 39.1803}',
   '{"instagram": "@nourasalon_jed", "snapchat": "nourasalon"}',
   '{"saturday": {"start": "09:00", "end": "21:00"}, "sunday": {"start": "09:00", "end": "21:00"}, "monday": {"start": "09:00", "end": "21:00"}, "tuesday": {"start": "09:00", "end": "21:00"}, "wednesday": {"start": "09:00", "end": "21:00"}, "thursday": {"start": "10:00", "end": "22:00"}, "friday": {"start": "14:00", "end": "22:00"}}',
   'SAR', 'ar', 'Asia/Riyadh',
   NOW() + INTERVAL '2 months',
   '{"cancellation_deadline_hours": 4, "deposit_percentage": 15, "deposit_required": false, "loyalty_points_per_riyal": 15, "booking_slot_interval_minutes": 30, "max_future_booking_days": 21, "review_auto_request": true, "whatsapp_enabled": true}',
   'https://ui-avatars.com/api/?name=NS&background=EC4899&color=fff&size=200',
   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=400&fit=crop'
  ),

  -- غلام ستوديو
  ('a1b2c3d4-3333-3333-3333-333333333333', 'glam-studio',
   '{"ar": "غلام ستوديو", "en": "Glam Studio"}',
   '{"ar": "غلام ستوديو — جمالك يستحق الأفضل. أحدث تقنيات التجميل مع أجواء فخمة.", "en": "Glam Studio — You deserve the best."}',
   (SELECT id FROM public.plans WHERE slug = 'advanced'),
   '#F59E0B', '#FEF3C7',
   '0553456789', 'info@glamstudio.sa',
   '{"street": "شارع الملك فهد", "city": "الرياض", "district": "العليا", "lat": 24.7136, "lng": 46.6753}',
   '{"instagram": "@glamstudio_riyadh", "twitter": "@glamstudio_sa", "tiktok": "@glamstudio_ryd"}',
   '{"saturday": {"start": "09:00", "end": "23:00"}, "sunday": {"start": "09:00", "end": "23:00"}, "monday": {"start": "09:00", "end": "23:00"}, "tuesday": {"start": "09:00", "end": "23:00"}, "wednesday": {"start": "09:00", "end": "23:00"}, "thursday": {"start": "10:00", "end": "00:00"}, "friday": {"start": "14:00", "end": "00:00"}}',
   'SAR', 'ar', 'Asia/Riyadh',
   NOW() + INTERVAL '2 months',
   '{"cancellation_deadline_hours": 8, "deposit_percentage": 25, "deposit_required": true, "loyalty_points_per_riyal": 20, "booking_slot_interval_minutes": 15, "max_future_booking_days": 60, "review_auto_request": true, "whatsapp_enabled": true, "custom_domain": true}',
   'https://ui-avatars.com/api/?name=GS&background=F59E0B&color=fff&size=200',
   'https://images.unsplash.com/photo-1519699046748-f5180e4cc9e4?w=1200&h=400&fit=crop'
  );

-- ==========================================
-- 2. اشتراكات الصالونات
-- ==========================================

INSERT INTO public.subscriptions (tenant_id, plan_id, status, current_period_start, current_period_end, trial_start, trial_end, billing_cycle, auto_renew) VALUES
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.plans WHERE slug = 'professional'), 'trial', NOW(), NOW() + INTERVAL '2 months', NOW(), NOW() + INTERVAL '2 months', 'monthly', true),
  ('a1b2c3d4-2222-2222-2222-222222222222', (SELECT id FROM public.plans WHERE slug = 'professional'), 'trial', NOW(), NOW() + INTERVAL '2 months', NOW(), NOW() + INTERVAL '2 months', 'monthly', true),
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.plans WHERE slug = 'advanced'), 'trial', NOW(), NOW() + INTERVAL '2 months', NOW(), NOW() + INTERVAL '2 months', 'yearly', true);

-- ==========================================
-- 3. تصنيفات الخدمات
-- ==========================================

INSERT INTO public.categories (tenant_id, name, description, icon, sort_order) VALUES
  -- لوكس بيوتي
  ('a1b2c3d4-1111-1111-1111-111111111111', '{"ar": "عناية بالشعر", "en": "Hair Care"}', '{"ar": "قص وصبغة وتسريحات"}', '✂️', 1),
  ('a1b2c3d4-1111-1111-1111-111111111111', '{"ar": "عناية بالبشرة", "en": "Skin Care"}', '{"ar": "تنظيف وترطيب وعلاجات"}', '💆', 2),
  ('a1b2c3d4-1111-1111-1111-111111111111', '{"ar": "أظافر", "en": "Nails"}', '{"ar": "مناكير وبديكير"}', '💅', 3),
  ('a1b2c3d4-1111-1111-1111-111111111111', '{"ar": "مكياج", "en": "Makeup"}', '{"ar": "مكياج مناسبات وسهرة"}', '💄', 4),
  -- صالون نورة
  ('a1b2c3d4-2222-2222-2222-222222222222', '{"ar": "شعر", "en": "Hair"}', '{"ar": "كل خدمات الشعر"}', '✂️', 1),
  ('a1b2c3d4-2222-2222-2222-222222222222', '{"ar": "بشرة وجمال", "en": "Beauty"}', '{"ar": "عناية متكاملة"}', '✨', 2),
  -- غلام ستوديو
  ('a1b2c3d4-3333-3333-3333-333333333333', '{"ar": "صبغات متقدمة", "en": "Advanced Coloring"}', '{"ar": "أحدث تقنيات الصبغة"}', '🎨', 1),
  ('a1b2c3d4-3333-3333-3333-333333333333', '{"ar": "كيراتين وبوتوكس", "en": "Keratin & Botox"}', '{"ar": "علاجات الشعر المتقدمة"}', '💎', 2),
  ('a1b2c3d4-3333-3333-3333-333333333333', '{"ar": "سبا وعناية", "en": "Spa & Care"}', '{"ar": "استرخاء وعناية كاملة"}', '🧖', 3);

-- ==========================================
-- 4. الخدمات
-- ==========================================

INSERT INTO public.services (tenant_id, category_id, name, description, duration_minutes, price, original_price, is_active, gender, sort_order) VALUES
  -- لوكس بيوتي - شعر
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'عناية بالشعر' LIMIT 1),
   '{"ar": "قص نسائي", "en": "Women Haircut"}', '{"ar": "قص احترافي مع غسيل وتسريح"}', 60, 150, NULL, true, 'female', 1),
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'عناية بالشعر' LIMIT 1),
   '{"ar": "صبغة شعر", "en": "Hair Color"}', '{"ar": "صبغة كاملة مع استشارة لون"}', 120, 350, 450, true, 'female', 2),
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'عناية بالشعر' LIMIT 1),
   '{"ar": "كيراتين برازيلي", "en": "Brazilian Keratin"}', '{"ar": "علاج كيراتين 72 ساعة نتيجة"}', 180, 800, 1000, true, 'female', 3),
  -- لوكس بيوتي - بشرة
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'عناية بالبشرة' LIMIT 1),
   '{"ar": "تنظيف بشرة عميق", "en": "Deep Facial"}', '{"ar": "تنظيف + تقشير + ماسك + ترطيب"}', 90, 250, NULL, true, 'female', 1),
  -- لوكس بيوتي - أظافر
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'أظافر' LIMIT 1),
   '{"ar": "مناكير جل", "en": "Gel Manicure"}', '{"ar": "مناكير جل مع رسومات"}', 60, 120, NULL, true, 'female', 1),
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'أظافر' LIMIT 1),
   '{"ar": "بديكير + مناكير", "en": "Pedicure + Manicure"}', '{"ar": "بديكير كامل + مناكير جل"}', 90, 180, NULL, true, 'female', 2),
  -- لوكس بيوتي - مكياج
  ('a1b2c3d4-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-1111-1111-1111-111111111111' AND name->>'ar' = 'مكياج' LIMIT 1),
   '{"ar": "مكياج مناسبات", "en": "Event Makeup"}', '{"ar": "مكياج زفاف/خطوبة/سهرة"}', 90, 500, NULL, true, 'female', 1),

  -- صالون نورة - شعر
  ('a1b2c3d4-2222-2222-2222-222222222222', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-2222-2222-2222-222222222222' AND name->>'ar' = 'شعر' LIMIT 1),
   '{"ar": "قص وتسريح", "en": "Cut & Style"}', '{"ar": "قص مع تصميم تسريحة"}', 45, 120, NULL, true, 'female', 1),
  ('a1b2c3d4-2222-2222-2222-222222222222', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-2222-2222-2222-222222222222' AND name->>'ar' = 'شعر' LIMIT 1),
   '{"ar": "هايلایت", "en": "Highlights"}', '{"ar": "هايلایت جزئي أو كامل"}', 150, 400, 500, true, 'female', 2),
  ('a1b2c3d4-2222-2222-2222-222222222222', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-2222-2222-2222-222222222222' AND name->>'ar' = 'شعر' LIMIT 1),
   '{"ar": "بليج + تونر", "en": "Bleach + Toner"}', '{"ar": "تفتيح مع الحماية"}', 180, 550, NULL, true, 'female', 3),
  -- صالون نورة - بشرة
  ('a1b2c3d4-2222-2222-2222-222222222222', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-2222-2222-2222-222222222222' AND name->>'ar' = 'بشرة وجمال' LIMIT 1),
   '{"ar": "ماسك ذهب", "en": "Gold Mask"}', '{"ar": "ماسك الذهب الكوري"}', 75, 300, NULL, true, 'female', 1),

  -- غلام ستوديو - صبغات
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-3333-3333-3333-333333333333' AND name->>'ar' = 'صبغات متقدمة' LIMIT 1),
   '{"ar": "بالاج أشقر", "en": "Blonde Balayage"}', '{"ar": "بالاج أشقر فرنسي"}', 180, 900, 1100, true, 'female', 1),
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-3333-3333-3333-333333333333' AND name->>'ar' = 'صبغات متقدمة' LIMIT 1),
   '{"ar": "اومبري روز", "en": "Rose Ombré"}', '{"ar": "تدرج وردي طبيعي"}', 150, 750, NULL, true, 'female', 2),
  -- غلام ستوديو - كيراتين
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-3333-3333-3333-333333333333' AND name->>'ar' = 'كيراتين وبوتوكس' LIMIT 1),
   '{"ar": "كيراتين ياباني", "en": "Japanese Keratin"}', '{"ar": "نعومة يابانية 3 أشهر"}', 240, 1500, NULL, true, 'female', 1),
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-3333-3333-3333-333333333333' AND name->>'ar' = 'كيراتين وبوتوكس' LIMIT 1),
   '{"ar": "بوتوكس شعر", "en": "Hair Botox"}', '{"ar": "علاج بوتوكس للشعر التالف"}', 180, 1000, 1200, true, 'female', 2),
  -- غلام ستوديو - سبا
  ('a1b2c3d4-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE tenant_id = 'a1b2c3d4-3333-3333-3333-333333333333' AND name->>'ar' = 'سبا وعناية' LIMIT 1),
   '{"ar": "سبا كامل", "en": "Full Spa Package"}', '{"ar": "مساج + ساونا + بشرة + استرخاء"}', 180, 600, NULL, true, 'female', 1);

-- ==========================================
-- 5. الموظفات
-- ==========================================

INSERT INTO public.staff (tenant_id, name, name_en, phone, specializations, commission_percentage, is_active, bio) VALUES
  -- لوكس بيوتي
  ('a1b2c3d4-1111-1111-1111-111111111111', 'منال الشمري', 'Manal Alshamri', '0551111111', '{"قص", "صبغة", "تسريحات"}', 25, true, '{"ar": "خبيرة قص وصبغة بخبرة 8 سنوات", "en": "Hair cutting & coloring expert, 8 years experience"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'هند القحطاني', 'Hind Alqahtani', '0551111112', '{"بشرة", "مكياج", "تنظيف"}', 20, true, '{"ar": "أخصائية بشرة ومكياج محترفة", "en": "Skin care & makeup specialist"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'سارة الغامدي', 'Sara Alghamdi', '0551111113', '{"مناكير", "بديكير", "أظافر"}', 15, true, '{"ar": "فنانة أظافر متخصصة في Nail Art", "en": "Nail art specialist"}'),

  -- صالون نورة
  ('a1b2c3d4-2222-2222-2222-222222222222', 'نورة العتيبي', 'Noura Alotaibi', '0552222221', '{"قص", "صبغة", "هايلایت"}', 30, true, '{"ar": "صاحبة الصالون وخبيرة الصبغات", "en": "Salon owner & color expert"}'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'ريم الدوسري', 'Reem Aldosari', '0552222222', '{"بشرة", "ماسكات", "علاجات"}', 20, true, '{"ar": "متخصصة في العناية بالبشرة الكورية", "en": "Korean skincare specialist"}'),

  -- غلام ستوديو
  ('a1b2c3d4-3333-3333-3333-333333333333', 'لمياء الحربي', 'Lamia Alharbi', '0553333331', '{"بالاج", "اومبري", "صبغات متقدمة"}', 30, true, '{"ar": "فنانة ألوان — خبيرة في البالاج والأومبري", "en": "Color artist — balayage & ombré expert"}'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'فاطمة الزهراني', 'Fatimah Alzahrani', '0553333332', '{"كيراتين", "بوتوكس", "علاجات"}', 25, true, '{"ar": "أخصائية علاجات الشعر المتقدمة", "en": "Advanced hair treatment specialist"}'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'دانة السبيعي', 'Dana Alsubaie', '0553333333', '{"سبا", "مساج", "بشرة"}', 20, true, '{"ar": "خبيرة سبا ومساج علاجي", "en": "Spa & massage therapist"}');

-- ==========================================
-- 6. عملاء تجريبيين
-- ==========================================

INSERT INTO public.customers (tenant_id, full_name, phone, email, birth_date, gender, loyalty_points, loyalty_tier, lifetime_value, total_visits, average_spend, tags, acquired_source, marketing_consent) VALUES
  -- لوكس بيوتي
  ('a1b2c3d4-1111-1111-1111-111111111111', 'أمل محمد', '0559001111', 'aml@email.com', '1990-03-15', 'female', 2500, 'gold', 8500, 18, 472, '{"VIP", "صبغة منتظمة"}', 'referral', true),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'سمية أحمد', '0559001112', 'sumaya@email.com', '1985-07-22', 'female', 800, 'silver', 3200, 8, 400, '{"مكياج مناسبات"}', 'instagram', true),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'خولة سعيد', '0559001113', NULL, '1995-11-10', 'female', 150, 'bronze', 450, 2, 225, '{}', 'walk_in', true),

  -- صالون نورة
  ('a1b2c3d4-2222-2222-2222-222222222222', 'هيفاء ناصر', '0559002221', 'haifa@email.com', '1988-05-03', 'female', 1800, 'gold', 6200, 15, 413, '{"هايلایت", "منتظمة"}', 'website', true),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'نوف خالد', '0559002222', NULL, '1992-12-18', 'female', 400, 'silver', 1500, 4, 375, '{}', 'walk_in', true),

  -- غلام ستوديو
  ('a1b2c3d4-3333-3333-3333-333333333333', 'رنا عبدالله', '0559003331', 'ranna@email.com', '1983-09-07', 'female', 5000, 'vip', 18000, 30, 600, '{"VIP", "كيراتين", "بالاج"}', 'referral', true),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'مشاعل فهد', '0559003332', 'mishael@email.com', '1997-01-25', 'female', 1200, 'silver', 4500, 10, 450, '{"صبغات"}', 'instagram', true);

-- ==========================================
-- 7. إعدادات الصالونات
-- ==========================================

INSERT INTO public.settings (tenant_id, key, value) VALUES
  ('a1b2c3d4-1111-1111-1111-111111111111', 'loyalty_tier_thresholds', '{"bronze": 0, "silver": 500, "gold": 2000, "vip": 5000}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'cancellation_policy', '{"deadline_hours": 6, "penalty_percentage": 50}'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'loyalty_tier_thresholds', '{"bronze": 0, "silver": 500, "gold": 2000, "vip": 5000}'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'cancellation_policy', '{"deadline_hours": 4, "penalty_percentage": 30}'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'loyalty_tier_thresholds', '{"bronze": 0, "silver": 500, "gold": 2000, "vip": 5000}'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'cancellation_policy', '{"deadline_hours": 8, "penalty_percentage": 100}');

-- ==========================================
-- 8. قوالب واتساب افتراضية
-- ==========================================

INSERT INTO public.whatsapp_templates (tenant_id, type, name, content_ar, content_en, is_active, variables) VALUES
  ('a1b2c3d4-1111-1111-1111-111111111111', 'booking_confirmation', 'تأكيد حجز', '✅ تأكيد حجزك في لوكس بيوتي\n\n📋 رقم الحجز: {booking_number}\n💆 الخدمة: {service_name}\n📅 التاريخ: {date}\n🕐 الوقت: {time}\n👩‍🎨 الموظفة: {staff_name}\n\nنستقبلك بإذن الله! 🌟', '✅ Booking confirmed at Luxe Beauty\n\n📋 Booking: {booking_number}\n💆 Service: {service_name}\n📅 Date: {date}\n🕐 Time: {time}\n👩‍🎨 Staff: {staff_name}', true, '{"booking_number", "service_name", "date", "time", "staff_name"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'booking_reminder_24h', 'تذكير 24 ساعة', '⏰ تذكير: عندك حجز بكرة في لوكس بيوتي!\n\n📋 رقم الحجز: {booking_number}\n💆 الخدمة: {service_name}\n🕐 الوقت: {time}\n\nعندك استفسار؟ ردي على هالرسالة 😊', '⏰ Reminder: You have a booking tomorrow!', true, '{"booking_number", "service_name", "time"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'booking_reminder_2h', 'تذكير ساعتين', '🔔 حجزك بعد ساعتين!\n\n💆 {service_name}\n🕐 {time}\n\nلا تنسين موعدك 💕', '🔔 Your booking is in 2 hours!', true, '{"service_name", "time"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'booking_completed_thankyou', 'شكراً لزيارتك', '🌟 شكراً لزيارتك لوكس بيوتي!\n\nأتمنى عجبتك الخدمة 💕\n\n⭐ تبي تقيمنا؟\nردي برقم من 1-5', '🌟 Thanks for visiting Luxe Beauty!', true, '{}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'missed_you', 'اشتقنالك', '💜 اشتقنالك!\n\nصار {days} يوم ما زرتينا 💔\n\nعندنا عروض حلوة تنتظرك 🎁\nحجزي موعدك الآن!', '💜 We miss you!', true, '{"days"}'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 'birthday_greeting', 'عيد ميلاد سعيد', '🎂 عيد ميلاد سعيد {customer_name}!\n\nكل سنة وأنتِ بخير 🎉\n\n🎁 كود خصم خاص:\n{discount_code}\n\nصالح لمدة 7 أيام!', '🎂 Happy Birthday!', true, '{"customer_name", "discount_code"}');