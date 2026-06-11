import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// POST /api/customers/import — Import customers from CSV/Excel
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
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.tenant_id) {
      return NextResponse.json({ error: 'لا يوجد صالون مرتبط' }, { status: 404 });
    }

    const body = await request.json();
    const { customers } = body as { customers: Record<string, any>[] };

    if (!customers?.length) {
      return NextResponse.json({ error: 'قائمة العملاء فارغة' }, { status: 400 });
    }

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const row of customers) {
      // Validate required fields
      if (!row.full_name || !row.phone) {
        results.skipped++;
        results.errors.push(`صف بدون اسم أو رقم جوال: ${JSON.stringify(row)}`);
        continue;
      }

      // Check for duplicate phone
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('phone', row.phone)
        .maybeSingle();

      if (existing) {
        results.skipped++;
        continue;
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          tenant_id: userProfile.tenant_id,
          full_name: row.full_name,
          phone: row.phone,
          email: row.email || null,
          birth_date: row.birth_date || null,
          gender: row.gender || 'female',
          skin_type: row.skin_type || null,
          hair_color: row.hair_color || null,
          preferred_color: row.preferred_color || null,
          allergies: row.allergies ? row.allergies.split(',') : [],
          beauty_notes: row.beauty_notes || null,
          tags: row.tags ? row.tags.split(',') : [],
          acquired_source: 'import',
        });

      if (error) {
        results.errors.push(`خطأ في استيراد ${row.full_name}: ${error.message}`);
      } else {
        results.imported++;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}