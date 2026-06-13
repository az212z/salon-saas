import { NextRequest, NextResponse } from 'next/server';
import { isMoyasarConfigured, verifyPayment } from '@/lib/payments/moyasar';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// POST /api/payments/callback — Payment gateway callback
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, amount, metadata } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
    }

    if (!isMoyasarConfigured()) {
      return NextResponse.json(
        {
          error: 'بوابة الدفع غير مهيأة. أضف مفاتيح Moyasar أو استخدم Tap قبل معالجة دفعات حقيقية.',
          mode: 'configuration_required',
        },
        { status: 503 },
      );
    }

    // Verify payment with gateway
    const verification = await verifyPayment(id);

    if (!verification || verification.status !== 'paid') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const supabase = await createClient();

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: status === 'paid' ? 'paid' : status,
        gateway_transaction_id: id,
        gateway_response: body,
      })
      .eq('gateway_transaction_id', id);

    // If booking payment, update booking status
    if (metadata?.booking_id) {
      if (status === 'paid') {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', metadata.booking_id);
      }
    }

    // If subscription payment, update subscription
    if (metadata?.subscription_id) {
      if (status === 'paid') {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + (metadata.interval === 'yearly' ? 12 : 1));

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .eq('id', metadata.subscription_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
