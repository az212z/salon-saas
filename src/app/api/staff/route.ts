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
      .from('staff')
      .select('*, staff_services(*, service:services(id, name, duration_minutes, price)), staff_schedules(*)')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('sort_order', { ascending: true });

    if (is_active !== null) query = query.eq('is_active', is_active === 'true');

    const { data: staff, error } = await query;
    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });

    return NextResponse.json({ staff });
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

    // Create staff member
    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        tenant_id: userProfile?.tenant_id,
        name: body.name,
        name_en: body.name_en,
        phone: body.phone,
        email: body.email,
        avatar_url: body.avatar_url,
        bio: body.bio,
        specializations: body.specializations || [],
        commission_percentage: body.commission_percentage || 0,
        permission_level: body.permission_level || 'limited',
        is_active: body.is_active ?? true,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في إنشاء الموظفة' }, { status: 500 });

    // Add staff services if provided
    if (body.services?.length && staff) {
      const staffServices = body.services.map((service_id: string) => ({
        tenant_id: userProfile?.tenant_id,
        staff_id: staff.id,
        service_id,
        is_active: true,
      }));

      await supabase.from('staff_services').insert(staffServices);
    }

    // Add staff schedule if provided
    if (body.schedules?.length && staff) {
      const schedules = body.schedules.map((s: any) => ({
        tenant_id: userProfile?.tenant_id,
        staff_id: staff.id,
        day_of_week: s.day_of_week,
        is_working: s.is_working ?? true,
        start_time: s.start_time || '09:00',
        end_time: s.end_time || '17:00',
        break_start: s.break_start || null,
        break_end: s.break_end || null,
      }));

      await supabase.from('staff_schedules').insert(schedules);
    }

    return NextResponse.json({ staff }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}