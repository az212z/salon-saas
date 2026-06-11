import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/customers/[id] — Full customer profile (CRM detail)
// ============================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    // Get full customer profile
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', userProfile?.tenant_id)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: 'العميلة غير موجودة' }, { status: 404 });
    }

    // Get customer's bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_number, booking_date, start_time, end_time, status, total_amount, created_at, staff:staff(name), booking_items(service:services(id, name))')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('customer_id', params.id)
      .order('booking_date', { ascending: false })
      .limit(20);

    // Get customer's loyalty transactions
    const { data: loyaltyTransactions } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get customer's gift cards
    const { data: giftCards } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('purchased_by', params.id)
      .order('created_at', { ascending: false });

    // Get customer's reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false });

    // Get internal notes
    const { data: notes } = await supabase
      .from('customer_notes')
      .select('*, created_by_user:users(full_name)')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false });

    // Get WhatsApp messages sent to this customer
    const { data: messages } = await supabase
      .from('whatsapp_messages')
      .select('id, type, content, status, sent_at, created_at')
      .eq('tenant_id', userProfile!.tenant_id)
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Compute smart segment
    let segment = 'active';
    if (!customer.last_visit_at) {
      segment = 'new';
    } else {
      const daysSinceLastVisit = Math.floor((Date.now() - new Date(customer.last_visit_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastVisit > 60) segment = 'lost';
      else if (daysSinceLastVisit > 30) segment = 'at_risk';
    }

    // Compute next tier progress
    const tierThresholds = { bronze: 0, silver: 500, gold: 2000, vip: 5000 };
    let nextTier = 'silver';
    let pointsNeeded = 0;
    if (customer.loyalty_tier === 'bronze') {
      nextTier = 'silver';
      pointsNeeded = tierThresholds.silver - customer.loyalty_points;
    } else if (customer.loyalty_tier === 'silver') {
      nextTier = 'gold';
      pointsNeeded = tierThresholds.gold - customer.loyalty_points;
    } else if (customer.loyalty_tier === 'gold') {
      nextTier = 'vip';
      pointsNeeded = tierThresholds.vip - customer.loyalty_points;
    } else {
      nextTier = 'vip';
      pointsNeeded = 0;
    }

    return NextResponse.json({
      customer: {
        ...customer,
        segment,
        next_tier: nextTier,
        points_to_next_tier: Math.max(0, pointsNeeded),
      },
      bookings,
      loyalty_transactions: loyaltyTransactions,
      gift_cards: giftCards,
      reviews,
      notes,
      messages,
    });
  } catch (error) {
    console.error('Customer detail error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// PATCH /api/customers/[id] — Update customer
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const body = await request.json();

    // Allowed fields to update
    const allowedFields = [
      'full_name', 'phone', 'email', 'birth_date', 'avatar_url',
      'skin_type', 'hair_color', 'preferred_color', 'allergies',
      'preferred_services', 'beauty_notes', 'tags', 'notes',
      'marketing_consent', 'is_active'
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', params.id)
      .eq('tenant_id', userProfile?.tenant_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'خطأ في تحديث العميل' }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Customer PATCH error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}