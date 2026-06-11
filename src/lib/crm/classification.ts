// ============================================================
// CRM Utilities — Classification, Segmentation, Smart Tags
// ============================================================

import { createClient } from '@/lib/supabase/server';

// ============================================================
// Customer Segment Classification
// ============================================================
export type CustomerSegment = 'new' | 'active' | 'at_risk' | 'lost' | 'vip';

export async function classifyCustomer(customerId: string, tenantId: string): Promise<CustomerSegment> {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('last_visit_at, total_visits, lifetime_value, loyalty_tier')
    .eq('id', customerId)
    .eq('tenant_id', tenantId)
    .single();

  if (!customer) return 'new';

  // VIP check
  if (customer.loyalty_tier === 'vip') return 'vip';

  // New customer (joined less than 7 days ago or less than 2 visits)
  if (!customer.last_visit_at) return 'new';

  const daysSinceLastVisit = Math.floor(
    (Date.now() - new Date(customer.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Lost (60+ days since last visit)
  if (daysSinceLastVisit > 60) return 'lost';

  // At risk (30-60 days since last visit)
  if (daysSinceLastVisit > 30) return 'at_risk';

  // Active
  return 'active';
}

// ============================================================
// Get all customer segments for a tenant
// ============================================================
export async function getCustomerSegments(tenantId: string) {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('id, last_visit_at, total_visits, lifetime_value, loyalty_tier, created_at')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (!customers) return { new: 0, active: 0, at_risk: 0, lost: 0, vip: 0 };

  const now = Date.now();
  const segments = { new: 0, active: 0, at_risk: 0, lost: 0, vip: 0 };

  for (const customer of customers) {
    if (customer.loyalty_tier === 'vip') {
      segments.vip++;
      continue;
    }

    if (!customer.last_visit_at) {
      // Check if joined in last 7 days
      const daysSinceJoin = Math.floor((now - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceJoin <= 7) {
        segments.new++;
      } else {
        segments.at_risk++;
      }
      continue;
    }

    const daysSinceLastVisit = Math.floor(
      (now - new Date(customer.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastVisit > 60) segments.lost++;
    else if (daysSinceLastVisit > 30) segments.at_risk++;
    else segments.active++;
  }

  return segments;
}

// ============================================================
// Auto-tag customers based on behavior
// ============================================================
export async function autoTagCustomers(tenantId: string) {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('id, last_visit_at, total_visits, lifetime_value, tags, loyalty_tier')
    .eq('tenant_id', tenantId);

  if (!customers) return;

  const now = Date.now();

  for (const customer of customers) {
    const newTags = [...(customer.tags || [])];

    // Remove auto-tags first
    const autoTags = ['عميلة جديدة', 'عميلة نشطة', 'معرضة للفقدان', 'عميلة مفقودة', 'VIP'];
    const manualTags = newTags.filter((t: string) => !autoTags.includes(t));

    // Classify
    if (customer.loyalty_tier === 'vip') {
      manualTags.push('VIP');
    } else if (!customer.last_visit_at) {
      manualTags.push('عميلة جديدة');
    } else {
      const days = Math.floor((now - new Date(customer.last_visit_at).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 60) manualTags.push('عميلة مفقودة');
      else if (days > 30) manualTags.push('معرضة للفقدان');
      else manualTags.push('عميلة نشطة');
    }

    // High spender tag
    if (customer.lifetime_value > 5000) {
      if (!manualTags.includes('عميلة مميزة')) manualTags.push('عميلة مميزة');
    }

    // Update tags if changed
    if (JSON.stringify(customer.tags) !== JSON.stringify(manualTags)) {
      await supabase
        .from('customers')
        .update({ tags: manualTags })
        .eq('id', customer.id);
    }
  }
}

// ============================================================
// Send "Missed You" campaign to at-risk/lost customers
// ============================================================
export async function sendMissedYouCampaign(tenantId: string) {
  const supabase = await createClient();

  // Get at-risk customers (30+ days since last visit)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, phone, last_visit_at, marketing_consent')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .eq('marketing_consent', true)
    .lt('last_visit_at', thirtyDaysAgo.toISOString());

  if (!customers?.length) return { sent: 0 };

  // Create auto-coupon for this campaign
  const couponCode = `MISSED${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  await supabase.from('coupons').insert({
    tenant_id: tenantId,
    code: couponCode,
    name: { ar: 'كود الاشتقنا لك', en: 'Missed You Coupon' },
    type: 'percentage',
    value: 15, // 15% discount
    max_uses: customers.length,
    max_uses_per_customer: 1,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    is_auto_apply: false,
    is_active: true,
  });

  // Queue WhatsApp messages
  const messages = customers.map((customer: any) => ({
    tenant_id: tenantId,
    customer_id: customer.id,
    type: 'missed_you',
    content: `💜 اشتقنا لك ${customer.full_name}! مر زمان بدون زيارتك. خصم 15% على حجزك القادم بكود: ${couponCode}`,
    status: 'pending',
  }));

  await supabase.from('whatsapp_messages').insert(messages);

  return { sent: messages.length, coupon_code: couponCode };
}