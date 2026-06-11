import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/whatsapp/templates — List message templates
// ============================================================
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

    const { data: templates, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('type');

    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// PUT /api/whatsapp/templates — Update message template
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
    const { type, content_ar, content_en, is_active, variables } = body;

    // Upsert template
    const { data: template, error } = await supabase
      .from('whatsapp_templates')
      .upsert({
        tenant_id: userProfile?.tenant_id,
        type,
        name: type, // Use type as name
        content_ar,
        content_en,
        is_active: is_active ?? true,
        variables: variables || [],
      }, { onConflict: 'tenant_id,type' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في تحديث القالب' }, { status: 500 });
    return NextResponse.json({ template });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}