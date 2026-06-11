import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/whatsapp/campaigns — List campaigns
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

    const { data: campaigns, error } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('tenant_id', userProfile?.tenant_id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'خطأ في الاستعلام' }, { status: 500 });
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// POST /api/whatsapp/campaigns — Create & send campaign
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
    const { name, content, target_filters, scheduled_at } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'الاسم والمحتوى مطلوبان' }, { status: 400 });
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('whatsapp_campaigns')
      .insert({
        tenant_id: userProfile?.tenant_id,
        name,
        content,
        target_filters: target_filters || {},
        status: scheduled_at ? 'scheduled' : 'draft',
        scheduled_at,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'خطأ في إنشاء الحملة' }, { status: 500 });

    // If not scheduled, find matching customers and send
    if (!scheduled_at) {
      await sendCampaign(supabase, campaign, userProfile!.tenant_id, target_filters);
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

async function sendCampaign(
  supabase: any,
  campaign: any,
  tenant_id: string,
  target_filters: Record<string, any>
) {
  // Build customer query based on filters
  let query = supabase
    .from('customers')
    .select('id, phone, full_name')
    .eq('tenant_id', tenant_id)
    .eq('is_active', true)
    .eq('marketing_consent', true);

  if (target_filters?.tiers?.length) {
    query = query.in('loyalty_tier', target_filters.tiers);
  }
  if (target_filters?.tags?.length) {
    query = query.contains('tags', target_filters.tags);
  }
  if (target_filters?.last_visit_days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - target_filters.last_visit_days);
    query = query.lt('last_visit_at', cutoff.toISOString());
  }
  if (target_filters?.min_lifetime_value) {
    query = query.gte('lifetime_value', target_filters.min_lifetime_value);
  }

  const { data: customers } = await query;

  if (!customers?.length) return;

  // Update campaign stats
  await supabase
    .from('whatsapp_campaigns')
    .update({
      status: 'sending',
      sent_count: customers.length,
    })
    .eq('id', campaign.id);

  // Queue messages for each customer
  // In production, this would use a queue system (Redis/BullMQ)
  // For now, we create message records
  const messages = customers.map((customer: any) => ({
    tenant_id,
    customer_id: customer.id,
    type: 'custom_campaign',
    content: campaign.content
      .replace('{customer_name}', customer.full_name)
      .replace('{phone}', customer.phone),
    status: 'pending',
    campaign_id: campaign.id,
  }));

  // Insert in batches of 100
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    await supabase.from('whatsapp_messages').insert(batch);
  }

  // Mark campaign as completed
  await supabase
    .from('whatsapp_campaigns')
    .update({
      status: 'completed',
    })
    .eq('id', campaign.id);
}