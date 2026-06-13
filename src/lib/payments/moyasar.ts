// ============================================================
// Moyasar Payment Gateway — التكامل الكامل 💳
// Saudi payment gateway: Credit Card, Mada, Apple Pay, STC Pay
// ============================================================

import { createClient } from '@/lib/supabase/server';

const MOYASAR_API_URL = 'https://api.moyasar.com/v1';
const MOYASAR_PUBLIC_URL = 'https://checkout.moyasar.com';

interface MoyasarConfig {
  secretKey: string;
  publicKey: string;
}

function valueLooksConfigured(value: string | undefined) {
  if (!value) return false;
  const lowered = value.toLowerCase();
  return !["your-", "dummy", "example", "test-key", "replace"].some((fragment) => lowered.includes(fragment));
}

export function isMoyasarConfigured() {
  return valueLooksConfigured(process.env.MOYASAR_SECRET_KEY) && valueLooksConfigured(process.env.MOYASAR_PUBLIC_KEY);
}

function getConfig(): MoyasarConfig {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  const publicKey = process.env.MOYASAR_PUBLIC_KEY;
  
  if (!isMoyasarConfigured() || !secretKey || !publicKey) {
    throw new Error('Moyasar API keys not configured');
  }
  
  return { secretKey, publicKey };
}

// ==========================================
// إنشاء دفعة (Payment)
// ==========================================

export interface CreatePaymentParams {
  amount: number; // in halalas (1 SAR = 100 halalas)
  currency: 'SAR';
  description: string;
  callback_url: string;
  metadata: {
    tenant_id: string;
    booking_id?: string;
    subscription_id?: string;
    customer_id?: string;
    customer_name?: string;
    payment_type: 'booking' | 'deposit' | 'gift_card' | 'subscription' | 'wallet_topup';
  };
  source: {
    type: 'creditcard' | 'mada' | 'applepay' | 'stcpay';
  };
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<{ id: string; status: string; url?: string; error?: string }> {
  try {
    const config = getConfig();
    
    const response = await fetch(`${MOYASAR_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(config.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: params.amount.toString(),
        currency: params.currency,
        description: params.description,
        callback_url: params.callback_url,
        'source[type]': params.source.type,
        'metadata[tenant_id]': params.metadata.tenant_id,
        'metadata[booking_id]': params.metadata.booking_id || '',
        'metadata[subscription_id]': params.metadata.subscription_id || '',
        'metadata[customer_id]': params.metadata.customer_id || '',
        'metadata[customer_name]': params.metadata.customer_name || '',
        'metadata[payment_type]': params.metadata.payment_type,
      }).toString(),
    });
    
    const data = await response.json();
    
    if (data.type === 'validation_error') {
      console.error('Moyasar validation error:', data);
      return { id: '', status: 'failed', error: data.message || 'Validation error' };
    }
    
    // For creditcard/mada, return the checkout URL
    if (data.source?.type === 'creditcard' || data.source?.type === 'mada') {
      return {
        id: data.id,
        status: data.status,
        url: data.source?.transaction_url, // Redirect URL for 3DS
      };
    }
    
    return {
      id: data.id,
      status: data.status,
    };
  } catch (error: any) {
    console.error('Moyasar create payment error:', error);
    return { id: '', status: 'failed', error: error.message };
  }
}

// ==========================================
// التحقق من دفعة
// ==========================================

export async function verifyPayment(paymentId: string): Promise<{
  id: string;
  status: string;
  amount: number;
  fee: number;
  refunded: number;
  source: any;
  metadata: any;
}> {
  try {
    const config = getConfig();
    
    const response = await fetch(`${MOYASAR_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(config.secretKey + ':').toString('base64')}`,
      },
    });
    
    return await response.json();
  } catch (error: any) {
    console.error('Moyasar verify payment error:', error);
    throw error;
  }
}

// ==========================================
// استرداد دفعة (Refund)
// ==========================================

export async function refundPayment(
  paymentId: string,
  amount?: number // in halalas, if partial refund
): Promise<{ id: string; status: string; error?: string }> {
  try {
    const config = getConfig();
    
    const body: any = {};
    if (amount) body.amount = amount.toString();
    
    const response = await fetch(`${MOYASAR_API_URL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(config.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    });
    
    const data = await response.json();
    
    if (data.type === 'validation_error') {
      return { id: paymentId, status: 'failed', error: data.message };
    }
    
    return { id: data.id, status: data.status };
  } catch (error: any) {
    console.error('Moyasar refund error:', error);
    return { id: paymentId, status: 'failed', error: error.message };
  }
}

// ==========================================
// معالجة Callback (Webhook)
// ==========================================

export async function handlePaymentCallback(
  paymentId: string,
  tenantId: string
): Promise<{ success: boolean; payment?: any }> {
  try {
    const payment = await verifyPayment(paymentId);
    
    if (payment.status === 'paid') {
      const supabase = await createClient();
      
      // Update payment record
      await supabase.from('payments').update({
        status: 'paid',
        gateway_transaction_id: payment.id,
        gateway_response: payment,
        updated_at: new Date().toISOString(),
      }).eq('gateway_transaction_id', paymentId).eq('tenant_id', tenantId);
      
      // If booking payment, update booking too
      if (payment.metadata?.booking_id) {
        await supabase.from('bookings').update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        }).eq('id', payment.metadata.booking_id).eq('tenant_id', tenantId);
      }
      
      // If subscription payment, update subscription
      if (payment.metadata?.subscription_id) {
        await supabase.from('subscriptions').update({
          status: 'active',
          updated_at: new Date().toISOString(),
        }).eq('id', payment.metadata.subscription_id).eq('tenant_id', tenantId);
      }
      
      return { success: true, payment };
    }
    
    return { success: false };
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return { success: false };
  }
}

// ==========================================
// إنشاء رابط دفع (Checkout URL)
// ==========================================

export function createCheckoutUrl(params: {
  amount: number;
  description: string;
  callbackUrl: string;
  metadata: Record<string, string>;
  methods?: string[];
}): string {
  const config = getConfig();
  
  const queryParams = new URLSearchParams({
    key: config.publicKey,
    amount: params.amount.toString(),
    currency: 'SAR',
    description: params.description,
    callback_url: params.callbackUrl,
    'metadata[tenant_id]': params.metadata.tenant_id,
    'metadata[payment_type]': params.metadata.payment_type,
    'publishable_key': config.publicKey,
  });
  
  if (params.methods?.length) {
    params.methods.forEach((method, i) => {
      queryParams.append(`methods[${i}]`, method);
    });
  } else {
    // Default: creditcard + mada + applepay
    queryParams.append('methods[0]', 'creditcard');
    queryParams.append('methods[1]', 'mada');
    queryParams.append('methods[2]', 'applepay');
  }
  
  return `${MOYASAR_PUBLIC_URL}?${queryParams.toString()}`;
}

// ==========================================
// أدوات مساعدة
// ==========================================

export function sarToHalalas(sar: number): number {
  return Math.round(sar * 100);
}

export function halalasToSar(halalas: number): number {
  return halalas / 100;
}
