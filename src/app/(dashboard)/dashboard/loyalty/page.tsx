'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TIER_INFO: Record<string, { label: string; color: string; bg: string; icon: string; minPoints: number }> = {
  bronze: { label: 'برونزي', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: '🥉', minPoints: 0 },
  silver: { label: 'فضي', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-300', icon: '🥈', minPoints: 500 },
  gold: { label: 'ذهبي', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: '🥇', minPoints: 2000 },
  vip: { label: 'VIP', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: '💎', minPoints: 5000 },
};

export default function LoyaltyPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'customers' | 'coupons' | 'gifts'>('overview');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      const [cRes, cpRes, gcRes] = await Promise.all([
        supabase.from('customers').select('*').eq('tenant_id', ud.tenant_id).order('loyalty_points', { ascending: false }),
        supabase.from('coupons').select('*').eq('tenant_id', ud.tenant_id).order('created_at', { ascending: false }),
        supabase.from('gift_cards').select('*').eq('tenant_id', ud.tenant_id).order('created_at', { ascending: false }),
      ]);
      setCustomers(cRes.data || []);
      setCoupons(cpRes.data || []);
      setGiftCards(gcRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  const tierCounts: Record<string, number> = { bronze: 0, silver: 0, gold: 0, vip: 0 };
  customers.forEach((c: any) => { if (c.loyalty_tier && tierCounts[c.loyalty_tier] !== undefined) tierCounts[c.loyalty_tier]++; });
  const totalPoints = customers.reduce((s, c) => s + (c.loyalty_points || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">🏆 الولاء والهدايا</h1>
          <p className="text-sm text-gray-500 mt-1">نظام نقاط الولاء والكوبونات وبطاقات الهدايا</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {[
          { key: 'overview' as const, label: 'نظرة عامة', icon: '📊' },
          { key: 'customers' as const, label: 'نقاط العملاء', icon: '👥' },
          { key: 'coupons' as const, label: 'الكوبونات', icon: '🏷️' },
          { key: 'gifts' as const, label: 'بطاقات الهدايا', icon: '🎁' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all', tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Tier Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TIER_INFO).map(([key, info]) => (
              <div key={key} className={cn('rounded-2xl border p-5', info.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{info.icon}</span>
                  <span className={cn('font-bold', info.color)}>{info.label}</span>
                </div>
                <p className="text-3xl font-extrabold text-gray-800">{tierCounts[key as keyof typeof tierCounts]}</p>
                <p className="text-xs text-gray-500 mt-1">من {info.minPoints} نقطة</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-purple-700">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">إجمالي النقاط المكتسبة</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-pink-700">{coupons.length}</p>
              <p className="text-xs text-gray-500">كوبونات نشطة</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-amber-700">{giftCards.length}</p>
              <p className="text-xs text-gray-500">بطاقات هدايا</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-bl from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">💎 كيف يعمل نظام الولاء؟</h3>
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                <p className="font-bold mb-1">1️⃣ تكسب نقاط</p>
                <p className="text-white/80">كل ريال = نقاط حسب إعدادات الصالون</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                <p className="font-bold mb-1">2️⃣ تترقى</p>
                <p className="text-white/80">من برونزي → فضي → ذهبي → VIP</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                <p className="font-bold mb-1">3️⃣ تحصل مزايا</p>
                <p className="text-white/80">كوبونات خصم، أولوية حجز، هدايا</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                <p className="font-bold mb-1">4️⃣ تدعو صديقات</p>
                <p className="text-white/80">برنامج إحالة مع مكافآت للاثنين</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-3">
          {customers.map(c => {
            const tier = TIER_INFO[c.loyalty_tier] || TIER_INFO.bronze;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-full bg-gradient-to-bl from-purple-200 to-pink-200 flex items-center justify-center text-purple-700 font-bold">
                  {c.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-500">{c.total_visits || 0} زيارة • {formatCurrency(c.lifetime_value || 0)}</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-purple-700">{(c.loyalty_points || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">نقطة</p>
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', tier.bg, tier.color)}>
                  {tier.icon} {tier.label}
                </span>
              </div>
            );
          })}
          {customers.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><div className="text-4xl mb-2">👥</div><p className="text-gray-500 text-sm">لا توجد عملاء بعد</p></div>}
        </div>
      )}

      {tab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="px-5 py-2.5 bg-gradient-to-l from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all">➕ إنشاء كوبون</button>
          </div>
          {coupons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-5xl mb-3">🏷️</div><p className="text-gray-500">لا توجد كوبونات بعد</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {coupons.map(c => (
                <div key={c.id} className="bg-gradient-to-bl from-amber-50 to-yellow-50 rounded-2xl border-2 border-dashed border-amber-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-mono font-bold">{c.code}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', c.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{c.is_active ? 'نشط' : 'منتهي'}</span>
                  </div>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.discount_type === 'percentage' ? `${c.discount_value}% خصم` : formatCurrency(c.discount_value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'gifts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="px-5 py-2.5 bg-gradient-to-l from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all">🎁 إنشاء بطاقة هدية</button>
          </div>
          {giftCards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-5xl mb-3">🎁</div><p className="text-gray-500">لا توجد بطاقات هدايا بعد</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {giftCards.map(gc => (
                <div key={gc.id} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-purple-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-purple-600">{gc.code}</span>
                    <span className="text-sm font-bold text-purple-700">{formatCurrency(gc.balance || gc.initial_amount)}</span>
                  </div>
                  <p className="text-xs text-gray-500">المشتري: {gc.purchaser_name || '-'} • المستلم: {gc.recipient_name || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}