import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableSlots, getAvailableSlotsForAnyStaff } from '@/lib/bookings/engine';

export const dynamic = 'force-dynamic';

// ============================================================
// GET /api/bookings/availability — Get available time slots
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenant_id = url.searchParams.get('tenant_id');
    const date = url.searchParams.get('date');
    const staff_id = url.searchParams.get('staff_id');
    const service_id = url.searchParams.get('service_id');
    const interval = parseInt(url.searchParams.get('interval') || '30');

    if (!tenant_id || !date) {
      return NextResponse.json({ error: 'tenant_id و date مطلوبان' }, { status: 400 });
    }

    if (staff_id) {
      // Get slots for specific staff
      const supabase = await createClient();
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id || '')
        .eq('tenant_id', tenant_id)
        .single();

      const duration = service?.duration_minutes || 30;

      const slots = await getAvailableSlots({
        tenant_id,
        staff_id,
        date,
        service_duration: duration,
        interval_minutes: interval,
      });

      return NextResponse.json({ slots });
    } else if (service_id) {
      // Get slots for any available staff
      const slots = await getAvailableSlotsForAnyStaff(
        tenant_id,
        date,
        service_id,
        interval
      );

      return NextResponse.json({ slots });
    } else {
      return NextResponse.json({ error: 'staff_id أو service_id مطلوب' }, { status: 400 });
    }
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'خطأ في حساب الأوقات المتاحة' }, { status: 500 });
  }
}
