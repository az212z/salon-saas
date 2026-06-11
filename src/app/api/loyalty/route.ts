import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/loyalty — Get loyalty settings and stats
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

    const tenant_id = userProfile?.tenant_id;

    // Get loyalty settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('tenant_id', tenant_id)
      .in('key', ['loyalty_points_per_riyal', 'loyalty_tier_thresholds']);

    const settingsMap = (settings || []).reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    // Get tier distribution
    const { data: tierDistribution } = await supabase
      .from('customers')
      .select('loyalty_tier, count')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true);

    const tierCounts: Record<string, number> = { bronze: 0, silver: 0, gold: 0, vip: 0 };
    (tierDistribution || []).forEach((row: any) => {
      tierCounts[row.loyalty_tier] = (tierCounts[row.loyalty_tier] || 0) + 1;
    });

    // Total points issued this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: pointsStats } = await supabase
      .from('loyalty_transactions')
      .select('type, points')
      .eq('tenant_id', tenant_id)
      .gte('created_at', startOfMonth.toISOString());

    let pointsEarned = 0;
    let pointsRedeemed = 0;
    (pointsStats || []).forEach((tx: any) => {
      if (tx.points > 0) pointsEarned += tx.points;
      else pointsRedeemed += Math.abs(tx.points);
    });

    return NextResponse.json({
      settings: settingsMap,
      tier_distribution: tierCounts,
      points_earned_this_month: pointsEarned,
      points_redeemed_this_month: pointsRedeemed,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ============================================================
// PUT /api/loyalty — Update loyalty settings
// ============================================================
export async function PUT(request: NextRequest) {
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

    // Upsert each setting
    const settings = [
      { key: 'loyalty_points_per_riyal', value: body.points_per_riyal || 1 },
      { key: 'loyalty_tier_thresholds', value: body.tier_thresholds || { bronze: 0, silver: 500, gold: 2000, vip: 5000 } },
    ];

    for (const setting of settings) {
      await supabase
        .from('settings')
        .upsert({
          tenant_id: userProfile?.tenant_id,
          key: setting.key,
          value: setting.value,
          updated_by: user.id,
        }, { onConflict: 'tenant_id,key' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}