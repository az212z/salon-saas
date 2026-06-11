import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBooking, getAvailableSlots, getAvailableSlotsForAnyStaff, updateBookingStatus } from '@/lib/bookings/engine';

// ============================================================
// GET /api/bookings — List bookings with filters
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
    const date = url.searchParams.get('date');
    const staff_id = url.searchParams.get('staff_id');
    const customer_id = url.searchParams.get('customer_id');
    const status = url.searchParams.get('status');
    const view = url.searchParams.get('view'); // 'calendar', 'list', 'timeline'
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let query = supabase
      .from('bookings')
      .select('*, customer:customers(id, full_name, phone, avatar_url), staff:staff(id, name, avatar_url), booking_items(*, service:services(id, name, price, duration_minutes))')
      .eq('tenant_id', userProfile.tenant_id)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (date) query = query.eq('booking_date', date);
    if (from) query = query.gte('booking_date', from);
    if (to) query = query.lte('booking_date', to);
    if (staff_id) query = query.eq('staff_id', staff_id);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (status) query = query.eq('status', status);

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'خطأ في استعلام الحجوزات' }, { status: 500 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/bookings — Create a new booking
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { tenant_id, customer_id, staff_id, booking_date, start_time, items, payment_type, notes, coupon_code, gift_card_code, points_to_redeem } = body;

    // Validation
    if (!tenant_id || !customer_id || !booking_date || !start_time || !items?.length) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const result = await createBooking({
      tenant_id,
      customer_id,
      staff_id,
      booking_date,
      start_time,
      items,
      payment_type: payment_type || 'in_salon',
      notes,
      coupon_code,
      gift_card_code,
      points_to_redeem,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch (error) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء الحجز' }, { status: 500 });
  }
}