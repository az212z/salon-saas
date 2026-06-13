import { NextRequest, NextResponse } from 'next/server';

import { getAppUrl, halalasToSar, isMoyasarConfigured, verifyPayment } from '@/lib/payments/moyasar';
import { createServiceClient } from '@/lib/supabase/service';

async function reconcilePayment(paymentId: string) {
  if (!isMoyasarConfigured()) {
    return {
      ok: false,
      status: 'configuration_required',
      error: 'بوابة الدفع غير مهيأة. أضف مفاتيح Moyasar قبل معالجة دفعات حقيقية.',
    };
  }

  const payment = await verifyPayment(paymentId);
  const expectedAmount = Number(payment.metadata?.expected_amount_halalas ?? 0);

  if (!payment || payment.status !== 'paid') {
    return { ok: false, status: payment?.status ?? 'unknown', error: 'Payment verification failed' };
  }

  if (payment.currency !== 'SAR') {
    return { ok: false, status: 'currency_mismatch', error: 'Payment currency mismatch' };
  }

  if (expectedAmount > 0 && payment.amount !== expectedAmount) {
    return { ok: false, status: 'amount_mismatch', error: 'Payment amount mismatch' };
  }

  const supabase = createServiceClient();
  const tenantId = payment.metadata?.tenant_id;
  if (supabase && tenantId) {
    const bookingId = payment.metadata?.booking_id || null;
    const customerId = payment.metadata?.customer_id || null;
    const paymentRecord = {
      tenant_id: tenantId,
      booking_id: bookingId,
      customer_id: customerId,
      amount: halalasToSar(payment.amount),
      currency: payment.currency,
      payment_method: payment.source?.type === 'applepay' ? 'apple_pay' : payment.source?.company === 'mada' ? 'mada' : 'card',
      payment_type: payment.metadata?.payment_type || 'deposit',
      status: 'paid',
      gateway: 'moyasar',
      gateway_transaction_id: payment.id,
      gateway_response: payment,
      updated_at: new Date().toISOString(),
    };

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('gateway_transaction_id', payment.id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (existingPayment?.id) {
      await supabase.from('payments').update(paymentRecord).eq('id', existingPayment.id);
    } else {
      await supabase.from('payments').insert(paymentRecord);
    }

    if (bookingId) {
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('tenant_id', tenantId);
    }
  }

  return { ok: true, status: 'paid', payment };
}

// POST /api/payments/callback — internal/server callback for payment events.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentId = String(body.id ?? '');

    if (!paymentId) {
      return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
    }

    const result = await reconcilePayment(paymentId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

// GET /api/payments/callback — Moyasar redirects the customer here with ?id=...
export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('id');
  const redirectUrl = new URL('/pay/result', getAppUrl());

  if (!paymentId) {
    redirectUrl.searchParams.set('status', 'missing_payment_id');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const result = await reconcilePayment(paymentId);
    redirectUrl.searchParams.set('status', result.ok ? 'paid' : result.status);
    redirectUrl.searchParams.set('payment_id', paymentId);
    if (result.error) redirectUrl.searchParams.set('message', result.error);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment redirect callback error:', error);
    redirectUrl.searchParams.set('status', 'verification_failed');
    redirectUrl.searchParams.set('payment_id', paymentId);
    return NextResponse.redirect(redirectUrl);
  }
}
