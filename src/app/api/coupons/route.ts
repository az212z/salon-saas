import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const url = new URL(request.url);
    const is_active = url.searchParams.get('is_active');

    let query = supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('created_at', { ascending: false });

    if (is_active !== null) query = query.eq('is_active', is_active === 'true');

    const { data: coupons, error } = await query;
    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });

    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const body = await request.json();

    // Auto-generate code if not provided
    const code = body.code || generateCouponCode();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        tenant_id: userProfile?.tenant_id,
        code,
        name: body.name,
        description: body.description,
        type: body.type,
        value: body.value,
        min_order_amount: body.min_order_amount || 0,
        max_uses: body.max_uses || null,
        max_uses_per_customer: body.max_uses_per_customer || 1,
        valid_from: body.valid_from || new Date().toISOString(),
        valid_until: body.valid_until || null,
        applicable_services: body.applicable_services || [],
        applicable_categories: body.applicable_categories || [],
        is_auto_apply: body.is_auto_apply || false,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في إنشاء الكوبون' }, { status: 500 });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================
// POST /api/coupons/validate — Validate and apply coupon
// ============================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const body = await request.json();
    const { code, customer_id, subtotal } = body;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', userProfile?.tenant_id)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'الكوبون غير صالح' }, { status: 404 });
    }

    // Check validity
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ error: 'الكوبون لم يبدأ بعد' }, { status: 400 });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ error: 'الكوبون منتهي الصلاحية' }, { status: 400 });
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'الكوبون استُنفد' }, { status: 400 });
    }
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json({ error: `الحد الأدنى للطلب ${coupon.min_order_amount} ريال` }, { status: 400 });
    }

    // Check per-customer usage
    if (customer_id) {
      const { data: customerBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('tenant_id', userProfile!.tenant_id)
        .eq('customer_id', customer_id)
        .eq('coupon_id', coupon.id);
      if ((customerBookings || []).length >= coupon.max_uses_per_customer) {
        return NextResponse.json({ error: 'تم استخدام هذا الكوبون مسبقاً' }, { status: 400 });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round(subtotal * (coupon.value / 100));
    } else if (coupon.type === 'fixed_amount') {
      discount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon,
      discount_amount: discount,
      final_total: subtotal - discount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}