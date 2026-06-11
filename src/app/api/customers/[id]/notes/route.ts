import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// POST /api/customers/[id]/notes — Add internal note to customer
// ============================================================
export async function POST(
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

    const { data: note, error } = await supabase
      .from('customer_notes')
      .insert({
        tenant_id: userProfile?.tenant_id,
        customer_id: params.id,
        created_by: user.id,
        note: body.note,
        is_important: body.is_important || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'خطأ في إضافة الملاحظة' }, { status: 500 });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Note POST error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/customers/[id]/gift-points — Gift points to customer
// ============================================================
export async function PUT(
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
    const { points, description } = body;

    if (!points || points === 0) {
      return NextResponse.json({ error: 'عدد النقاط مطلوب' }, { status: 400 });
    }

    // Add loyalty transaction
    const { data: transaction, error: txError } = await supabase
      .from('loyalty_transactions')
      .insert({
        tenant_id: userProfile?.tenant_id,
        customer_id: params.id,
        points: points,
        type: points > 0 ? 'bonus' : 'admin_adjust',
        description: description || (points > 0 ? 'هدية نقاط من الإدارة' : 'تعديل نقاط'),
        created_by: user.id,
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json({ error: 'خطأ في إضافة النقاط' }, { status: 500 });
    }

    // Update customer's points
    const { data: customer } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', params.id)
      .eq('tenant_id', userProfile?.tenant_id)
      .single();

    if (customer) {
      const newPoints = customer.loyalty_points + points;
      let newTier: string = 'bronze';
      if (newPoints >= 5000) newTier = 'vip';
      else if (newPoints >= 2000) newTier = 'gold';
      else if (newPoints >= 500) newTier = 'silver';

      await supabase
        .from('customers')
        .update({ loyalty_points: newPoints, loyalty_tier: newTier })
        .eq('id', params.id);
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Gift points error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}