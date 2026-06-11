import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/customers — List customers with search, filter, sort
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile?.tenant_id) {
      return NextResponse.json({ error: 'لا يوجد صالون مرتبط' }, { status: 404 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const tier = url.searchParams.get('tier');
    const tag = url.searchParams.get('tag');
    const status_filter = url.searchParams.get('status'); // 'active', 'inactive', 'at_risk', 'new'
    const sort_by = url.searchParams.get('sort_by') || 'created_at';
    const sort_order = url.searchParams.get('sort_order') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const per_page = parseInt(url.searchParams.get('per_page') || '25');
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', userProfile.tenant_id)
      .eq('is_active', status_filter !== 'inactive');

    // Search by name or phone
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filter by tier
    if (tier) {
      query = query.eq('loyalty_tier', tier);
    }

    // Filter by tag
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Smart segments
    if (status_filter === 'at_risk') {
      // Customers who haven't visited in 30+ days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.lt('last_visit_at', thirtyDaysAgo.toISOString());
    } else if (status_filter === 'new') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    }

    // Sort
    const ascending = sort_order === 'asc';
    if (sort_by === 'name') {
      query = query.order('full_name', { ascending });
    } else if (sort_by === 'lifetime_value') {
      query = query.order('lifetime_value', { ascending });
    } else if (sort_by === 'last_visit') {
      query = query.order('last_visit_at', { ascending: false, nullsFirst: false });
    } else if (sort_by === 'total_visits') {
      query = query.order('total_visits', { ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data: customers, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'خطأ في استعلام العملاء' }, { status: 500 });
    }

    return NextResponse.json({
      customers,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/customers — Create or import customer
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile?.tenant_id) {
      return NextResponse.json({ error: 'لا يوجد صالون مرتبط' }, { status: 404 });
    }

    const body = await request.json();

    // Check for duplicate phone
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', userProfile.tenant_id)
      .eq('phone', body.phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'رقم الجوال مسجل مسبقاً', customer_id: existing.id }, { status: 409 });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: userProfile.tenant_id,
        full_name: body.full_name,
        phone: body.phone,
        email: body.email,
        birth_date: body.birth_date,
        gender: body.gender || 'female',
        skin_type: body.skin_type,
        hair_color: body.hair_color,
        preferred_color: body.preferred_color,
        allergies: body.allergies,
        preferred_services: body.preferred_services,
        beauty_notes: body.beauty_notes,
        tags: body.tags || [],
        notes: body.notes,
        acquired_source: body.acquired_source || 'manual',
        marketing_consent: body.marketing_consent ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'خطأ في إنشاء العميل' }, { status: 500 });
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}