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
    const category_id = url.searchParams.get('category_id');
    const is_active = url.searchParams.get('is_active');

    let query = supabase
      .from('services')
      .select('*, category:categories(id, name)')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('sort_order', { ascending: true });

    if (category_id) query = query.eq('category_id', category_id);
    if (is_active !== null) query = query.eq('is_active', is_active === 'true');

    const { data: services, error } = await query;
    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });

    return NextResponse.json({ services });
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

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        tenant_id: userProfile?.tenant_id,
        category_id: body.category_id,
        name: body.name,
        description: body.description,
        duration_minutes: body.duration_minutes,
        price: body.price,
        original_price: body.original_price,
        image_url: body.image_url,
        is_active: body.is_active ?? true,
        requires_consultation: body.requires_consultation ?? false,
        gender: body.gender || 'female',
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في إنشاء الخدمة' }, { status: 500 });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}