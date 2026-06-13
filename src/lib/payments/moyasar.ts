// ============================================================
// Moyasar Payment Gateway — التكامل الكامل 💳
// Saudi payment gateway: credit cards with mada network support, plus optional Apple Pay/STC Pay when enabled in Moyasar.
// ============================================================

import { createClient } from '@/lib/supabase/server';

const MOYASAR_API_URL = 'https://api.moyasar.com/v1';

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

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3100';
}

function getConfig(): MoyasarConfig {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  const publicKey = process.env.MOYASAR_PUBLIC_KEY;
  
  if (!isMoyasarConfigured() || !secretKey || !publicKey) {
    throw new Error('Moyasar API keys not configured');
  }
  
  return { secretKey, publicKey };
}

export type MoyasarFormConfig = {
  amount: number;
  currency: 'SAR';
  description: string;
  publishable_api_key: string;
  callback_url: string;
  methods: string[];
  supported_networks: string[];
  language: 'ar';
  fixed_width: boolean;
  metadata: Record<string, string>;
  apple_pay?: {
    country: 'SA';
    label: string;
    validate_merchant_url?: string;
  };
};

function enabledMethods() {
  const configured = process.env.MOYASAR_PAYMENT_METHODS?.split(',').map((item) => item.trim()).filter(Boolean);
  if (configured?.length) return configured;
  return ['creditcard'];
}

export function createBookingPaymentFormConfig(params: {
  tenantId: string;
  bookingId: string;
  amountSar: number;
  description: string;
  customerId?: string;
  customerName?: string;
  paymentType: 'booking' | 'deposit' | 'subscription';
}): MoyasarFormConfig {
  const config = getConfig();
  const amount = sarToHalalas(params.amountSar);
  const methods = enabledMethods();
  const metadata: Record<string, string> = {
    tenant_id: params.tenantId,
    booking_id: params.bookingId,
    payment_type: params.paymentType,
    expected_amount_halalas: String(amount),
  };

  if (params.customerId) metadata.customer_id = params.customerId;
  if (params.customerName) metadata.customer_name = params.customerName;

  const formConfig: MoyasarFormConfig = {
    amount,
    currency: 'SAR',
    description: params.description,
    publishable_api_key: config.publicKey,
    callback_url: `${getAppUrl()}/api/payments/callback`,
    methods,
    supported_networks: ['mada', 'visa', 'mastercard', 'amex', 'unionpay'],
    language: 'ar',
    fixed_width: false,
    metadata,
  };

  if (methods.includes('applepay')) {
    formConfig.apple_pay = {
      country: 'SA',
      label: process.env.MOYASAR_APPLE_PAY_LABEL || process.env.NEXT_PUBLIC_APP_NAME || 'Saloni Pro',
      validate_merchant_url: process.env.MOYASAR_APPLE_PAY_VALIDATE_URL,
    };
  }

  return formConfig;
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
    
    // For 3-D Secure cards, Moyasar returns a transaction URL when redirection is required.
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
  currency: string;
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
// أدوات مساعدة
// ==========================================

export function sarToHalalas(sar: number): number {
  return Math.round(sar * 100);
}

export function halalasToSar(halalas: number): number {
  return halalas / 100;
}
