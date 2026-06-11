import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/admin/tenants — List all salons (Super Admin only)
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // Verify platform_owner role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'platform_owner') {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const per_page = parseInt(url.searchParams.get('per_page') || '20');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status'); // active, inactive, trial
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let query = supabase
      .from('tenants')
      .select('*, subscriptions(*, plans(name, slug, price_monthly)), owner:users!owner_id(full_name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`slug.ilike.%${search}%,name->>ar.ilike.%${search}%`);
    }
    if (status === 'active') query = query.eq('is_active', true);
    if (status === 'inactive') query = query.eq('is_active', false);

    query = query.range(from, to);

    const { data: tenants, count, error } = await query;
    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all((tenants || []).map(async (tenant: any) => {
      const [customers, bookings, revenue] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).gte('booking_date', new Date(new Date().setDate(1)).toISOString()),
        supabase.from('bookings').select('total_amount').eq('tenant_id', tenant.id).eq('payment_status', 'paid').gte('created_at', new Date(new Date().setDate(1)).toISOString()),
      ]);

      const totalRevenue = (revenue.data || []).reduce((sum: number, b: any) => sum + b.total_amount, 0);

      return {
        ...tenant,
        stats: {
          total_customers: customers.count || 0,
          monthly_bookings: bookings.count || 0,
          monthly_revenue: totalRevenue,
        },
      };
    }));

    return NextResponse.json({
      tenants: tenantsWithStats,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });
  } catch (error) {
    console.error('Admin tenants error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/admin/tenants — Create new salon (Super Admin)
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'platform_owner') {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, plan_id, owner_email, owner_name, owner_phone, primary_color, settings } = body;

    if (!name || !slug || !plan_id || !owner_email) {
      return NextResponse.json({ error: 'الاسم والرابط والخطة والبريد مطلوبون' }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json({ error: 'هذا الرابط مستخدم مسبقاً' }, { status: 409 });
    }

    // Create auth user for the salon owner
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: owner_email,
      password: body.owner_password || Math.random().toString(36).slice(-12),
      options: {
        data: { full_name: owner_name, role: 'salon_owner' },
      },
    });

    if (authError || !authUser.user) {
      return NextResponse.json({ error: 'خطأ في إنشاء حساب المالك' }, { status: 500 });
    }

    // Create tenant
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug,
        name: typeof name === 'string' ? { ar: name } : name,
        owner_id: authUser.user.id,
        plan_id,
        primary_color: primary_color || '#8B5CF6',
        secondary_color: body.secondary_color || '#F3E8FF',
        phone: owner_phone,
        settings: settings || {},
        is_active: true,
        trial_ends_at: trialEnd.toISOString(),
      })
      .select()
      .single();

    if (tenantError) {
      return NextResponse.json({ error: 'خطأ في إنشاء الصالون' }, { status: 500 });
    }

    // Create user record
    await supabase.from('users').insert({
      id: authUser.user.id,
      tenant_id: tenant.id,
      role: 'salon_owner',
      email: owner_email,
      full_name: owner_name,
      phone: owner_phone,
    });

    // Create subscription
    await supabase.from('subscriptions').insert({
      tenant_id: tenant.id,
      plan_id,
      status: 'trial',
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
      trial_start: new Date().toISOString(),
      trial_end: trialEnd.toISOString(),
    });

    // Create default WhatsApp templates
    const defaultTemplates = [
      { type: 'booking_confirmation', name: 'تأكيد الحجز', content_ar: 'مرحباً {customer_name}! تم تأكيد حجزك في {salon_name} يوم {date} الساعة {time}. رقم الحجز: {booking_number}', variables: ['customer_name', 'salon_name', 'date', 'time', 'booking_number'] },
      { type: 'booking_reminder_24h', name: 'تذكير ٢٤ ساعة', content_ar: 'تذكير: حجزك في {salon_name} يوم غد {date} الساعة {time}. نتطلع لرؤيتك! ✨', variables: ['customer_name', 'salon_name', 'date', 'time'] },
      { type: 'booking_reminder_2h', name: 'تذكير ساعتين', content_ar: 'حجزك في {salon_name} بعد ساعتين! 🕐 الساعة {time}', variables: ['customer_name', 'salon_name', 'time'] },
      { type: 'booking_completed_thankyou', name: 'شكراً بعد الزيارة', content_ar: 'شكراً لزيارتك {salon_name}! 💜 كيف كانت تجربتك؟ شاركينا رأيك: {review_link}', variables: ['customer_name', 'salon_name', 'review_link'] },
      { type: 'review_request', name: 'طلب تقييم', content_ar: 'رأيك يهمنا! قيمي تجربتك في {salon_name} وأحصلي على {points} نقطة ولاء 💫 {review_link}', variables: ['customer_name', 'salon_name', 'points', 'review_link'] },
      { type: 'missed_you', name: 'اشتقنا لك', content_ar: 'اشتقنا لك {customer_name}! 💜 مر زمان بدون زيارتك. خصم {discount}% على حجزك القادم بكود: {coupon_code}', variables: ['customer_name', 'discount', 'coupon_code'] },
      { type: 'birthday_greeting', name: 'تهنئة عيد ميلاد', content_ar: 'عيد ميلاد سعيد {customer_name}! 🎂 من {salon_name} هديتك: خصم {discount}% على كل الخدمات هذا الشهر! 💜', variables: ['customer_name', 'salon_name', 'discount'] },
      { type: 'no_show_warning', name: 'تنبيه عدم الحضور', content_ar: 'مرحباً {customer_name}، نلاحظ عدم حضورك للحجز. للحفاظ على جودة الخدمة، الحجوزات القادمة ستتطلب عربون. نتطلع لرؤيتك! 🙏', variables: ['customer_name'] },
    ];

    for (const template of defaultTemplates) {
      await supabase.from('whatsapp_templates').insert({
        tenant_id: tenant.id,
        ...template,
        is_active: true,
      });
    }

    // Create default settings
    const defaultSettings = [
      { key: 'cancellation_deadline_hours', value: 2 },
      { key: 'deposit_percentage', value: 0 },
      { key: 'deposit_required', value: false },
      { key: 'loyalty_points_per_riyal', value: 1 },
      { key: 'loyalty_tier_thresholds', value: { bronze: 0, silver: 500, gold: 2000, vip: 5000 } },
      { key: 'review_auto_request', value: true },
      { key: 'whatsapp_enabled', value: true },
      { key: 'booking_slot_interval_minutes', value: 30 },
      { key: 'max_future_booking_days', value: 30 },
      { key: 'no_show_limit', value: 2 },
      { key: 'no_show_deposit_required', value: true },
      { key: 'payment_methods', value: ['cash', 'card', 'mada', 'apple_pay'] },
    ];

    for (const setting of defaultSettings) {
      await supabase.from('settings').insert({
        tenant_id: tenant.id,
        key: setting.key,
        value: setting.value,
      });
    }

    return NextResponse.json({
      tenant,
      owner: { email: owner_email, name: owner_name },
      message: 'تم إنشاء الصالون بنجاح مع ١٤ يوم تجربة مجانية',
    }, { status: 201 });
  } catch (error) {
    console.error('Tenant creation error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}