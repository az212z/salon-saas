// ============================================================
// Loyalty Engine — Points, Tiers, Gifts, Referrals
// ============================================================

import { createClient } from '@/lib/supabase/server';

const DEFAULT_TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000, vip: 5000 };
const DEFAULT_POINTS_PER_RIYAL = 1;

// ============================================================
// Earn points on booking completion
// ============================================================
export async function earnPoints(
  customerId: string,
  tenantId: string,
  bookingId: string,
  amount: number
) {
  const supabase = await createClient();

  // Get tenant loyalty settings
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('key', 'loyalty_points_per_riyal')
    .single();

  const pointsPerRiyal = (settingsData?.value as number) || DEFAULT_POINTS_PER_RIYAL;
  const pointsEarned = Math.floor(amount * pointsPerRiyal);

  // Create transaction
  await supabase.from('loyalty_transactions').insert({
    tenant_id: tenantId,
    customer_id: customerId,
    booking_id: bookingId,
    points: pointsEarned,
    type: 'earn',
    description: `كسب ${pointsEarned} نقطة من حجز بقيمة ${amount} ر.س`,
  });

  // Update customer
  await updateCustomerTier(customerId, tenantId);

  return pointsEarned;
}

// ============================================================
// Redeem points
// ============================================================
export async function redeemPoints(
  customerId: string,
  tenantId: string,
  points: number,
  description?: string
) {
  const supabase = await createClient();

  // Check balance
  const { data: customer } = await supabase
    .from('customers')
    .select('loyalty_points')
    .eq('id', customerId)
    .eq('tenant_id', tenantId)
    .single();

  if (!customer || customer.loyalty_points < points) {
    return { success: false, error: 'رصيد النقاط غير كافٍ' };
  }

  // Create redemption transaction
  await supabase.from('loyalty_transactions').insert({
    tenant_id: tenantId,
    customer_id: customerId,
    points: -points,
    type: 'redeem',
    description: description || `استرداد ${points} نقطة`,
  });

  // Update customer
  await updateCustomerTier(customerId, tenantId);

  return { success: true, points_redeemed: points };
}

// ============================================================
// Referral bonus
// ============================================================
export async function referralBonus(
  referrerId: string,
  referredId: string,
  tenantId: string
) {
  const supabase = await createClient();

  const REFERRAL_BONUS = 100; // 100 points per referral

  // Award referrer
  await supabase.from('loyalty_transactions').insert({
    tenant_id: tenantId,
    customer_id: referrerId,
    points: REFERRAL_BONUS,
    type: 'referral',
    description: `هدية إحالة — عميلة جديدة انضمّت بكودك`,
  });

  // Award referred customer (welcome bonus)
  await supabase.from('loyalty_transactions').insert({
    tenant_id: tenantId,
    customer_id: referredId,
    points: REFERRAL_BONUS,
    type: 'bonus',
    description: 'هدية ترحيبية — استخدمتِ كود إحالة',
  });

  // Update referrer's referral count
  await supabase
    .from('customers')
    .update({ referral_rewards_earned: supabase.rpc('increment', { row_id: referrerId, table_name: 'customers', column_name: 'referral_rewards_earned', value: REFERRAL_BONUS }) })
    .eq('id', referrerId);

  await updateCustomerTier(referrerId, tenantId);
  await updateCustomerTier(referredId, tenantId);

  return { success: true, bonus: REFERRAL_BONUS };
}

// ============================================================
// Update customer tier based on points
// ============================================================
async function updateCustomerTier(customerId: string, tenantId: string) {
  const supabase = await createClient();

  // Get total points
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('tenant_id', tenantId)
    .eq('customer_id', customerId);

  const totalPoints = (transactions || []).reduce((sum: number, t: any) => sum + t.points, 0);

  // Get tier thresholds
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('key', 'loyalty_tier_thresholds')
    .single();

  const thresholds = (settingsData?.value as Record<string, number>) || DEFAULT_TIER_THRESHOLDS;

  // Determine tier
  let tier = 'bronze';
  if (totalPoints >= thresholds.vip) tier = 'vip';
  else if (totalPoints >= thresholds.gold) tier = 'gold';
  else if (totalPoints >= thresholds.silver) tier = 'silver';

  // Update customer
  await supabase
    .from('customers')
    .update({ loyalty_points: totalPoints, loyalty_tier: tier })
    .eq('id', customerId)
    .eq('tenant_id', tenantId);

  return { tier, points: totalPoints };
}

// ============================================================
// Redeem gift card
// ============================================================
export async function redeemGiftCard(
  code: string,
  customerId: string,
  tenantId: string,
  amount: number
) {
  const supabase = await createClient();

  // Find gift card
  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('code', code)
    .eq('status', 'active')
    .single();

  if (!giftCard) {
    return { success: false, error: 'بطاقة الهدايا غير صالحة' };
  }

  // Check expiry
  if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
    await supabase
      .from('gift_cards')
      .update({ status: 'expired' })
      .eq('id', giftCard.id);
    return { success: false, error: 'بطاقة الهدايا منتهية الصلاحية' };
  }

  // Check balance
  if (giftCard.remaining_balance < amount) {
    return { success: false, error: 'رصيد بطاقة الهدايا غير كافٍ' };
  }

  // Update gift card balance
  const newBalance = giftCard.remaining_balance - amount;
  await supabase
    .from('gift_cards')
    .update({
      remaining_balance: newBalance,
      ...(newBalance <= 0 ? { status: 'redeemed', redeemed_at: new Date().toISOString() } : {}),
    })
    .eq('id', giftCard.id);

  // Add to customer wallet
  await supabase
    .from('customers')
    .update({ wallet_balance: supabase.rpc('increment', { row_id: customerId, table_name: 'customers', column_name: 'wallet_balance', value: amount }) })
    .eq('id', customerId);

  // Create payment record
  await supabase.from('payments').insert({
    tenant_id: tenantId,
    customer_id: customerId,
    gift_card_id: giftCard.id,
    amount,
    currency: 'SAR',
    payment_method: 'gift_card',
    payment_type: 'gift_card',
    status: 'paid',
  });

  return { success: true, remaining_balance: newBalance };
}