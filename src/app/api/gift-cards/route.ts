import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/gift-cards — List gift cards
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let query = supabase
      .from('gift_cards')
      .select('*, purchased_by_customer:customers(id, full_name, phone)')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: giftCards, error } = await query;
    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });

    return NextResponse.json({ gift_cards: giftCards });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/gift-cards — Create gift card
// ============================================================
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
    const { amount, purchased_by, gifted_to_name, gifted_to_phone, gift_message, gift_design } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'مبلغ البطاقة مطلوب' }, { status: 400 });
    }

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .insert({
        tenant_id: userProfile?.tenant_id,
        amount,
        remaining_balance: amount,
        purchased_by: purchased_by || null,
        gifted_to_name: gifted_to_name || null,
        gifted_to_phone: gifted_to_phone || null,
        gift_message: gift_message || null,
        gift_design: gift_design || 'default',
        status: 'active',
        expires_at: body.expires_at || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في إنشاء البطاقة' }, { status: 500 });

    // If there's a purchaser, deduct from their wallet or create payment
    if (purchased_by) {
      // Deduct points or create payment record
      // This would be handled by the payment system
    }

    return NextResponse.json({ gift_card: giftCard }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}