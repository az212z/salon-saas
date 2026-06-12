import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateBookingStatus, checkWaitlistOnCancellation } from '@/lib/bookings/engine';

type BookingRouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================================
// GET /api/bookings/[id] — Get single booking
// ============================================================
export async function GET(
  request: NextRequest,
  { params }: BookingRouteContext
) {
  try {
    const { id } = await params;
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

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customer:customers(*), staff:staff(*), booking_items(*, service:services(*))')
      .eq('id', id)
      .eq('tenant_id', userProfile?.tenant_id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// PATCH /api/bookings/[id] — Update booking status
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: BookingRouteContext
) {
  try {
    const { id } = await params;
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

    if (!userProfile?.tenant_id) {
      return NextResponse.json({ error: 'لا يوجد صالون مرتبط' }, { status: 404 });
    }

    const body = await request.json();
    const { status, reason, internal_notes } = body;

    if (status) {
      const result = await updateBookingStatus(
        id,
        userProfile.tenant_id,
        status,
        reason
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // If cancelled, check waitlist
      if (status === 'cancelled') {
        const { data: booking } = await supabase
          .from('bookings')
          .select('booking_items(service_id), booking_date, start_time')
          .eq('id', id)
          .single();

        if (booking) {
          const serviceId = booking.booking_items?.[0]?.service_id;
          if (serviceId) {
            await checkWaitlistOnCancellation(
              userProfile.tenant_id,
              serviceId,
              booking.booking_date,
              booking.start_time
            );
          }
        }
      }
    }

    // Update other fields
    const updateData: Record<string, any> = {};
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes;

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', userProfile.tenant_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking PATCH error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/bookings/[id] — Cancel booking (soft delete)
// ============================================================
export async function DELETE(
  request: NextRequest,
  { params }: BookingRouteContext
) {
  try {
    const { id } = await params;
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

    const result = await updateBookingStatus(
      id,
      userProfile?.tenant_id,
      'cancelled',
      'تم الإلغاء بواسطة المستخدم'
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking DELETE error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
