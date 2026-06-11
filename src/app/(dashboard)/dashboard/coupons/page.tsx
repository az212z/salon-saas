'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, is_active: true });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('coupons').select('*').eq('tenant_id', ud.tenant_id).order('created_at', { ascending: false });
      setCoupons(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    await supabase.from('coupons').insert({
      tenant_id: tenantId,
      name: form.name,
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || null,
      max_uses: form.max_uses,
      current_uses: 0,
      is_active: form.is_active,
      starts_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    setShowForm(false);
    setForm({ name: '', code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: 100, is_active: true });
    loadData();
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('coupons').update({ is_active: !active }).eq('id', id);
    loadData();
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(f => ({ ...f, code }));
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">🏷️ العروض والكوبونات</h1>
          <p className="text-sm text-gray-500 mt-1">{coupons.length} كوبون</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
          ➕ إنشاء كوبون
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🏷️</div>
          <p className="text-gray-500 mb-4">لا توجد كوبونات بعد</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">إنشاء أول كوبون</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className={cn('bg-white rounded-2xl border-2 border-dashed p-5 transition-all', c.is_active ? 'border-amber-200 hover:shadow-md' : 'border-gray-200 opacity-60')}>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-mono font-bold tracking-wider">{c.code}</span>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', c.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                  {c.is_active ? '✅ نشط' : '⏸ متوقف'}
                </span>
              </div>
              <p className="font-bold text-gray-800 mb-1">{c.name}</p>
              <p className="text-lg font-extrabold text-purple-700 mb-2">
                {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value)} خصم
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>استخدام: {c.current_uses || 0}/{c.max_uses || '∞'}</span>
                {c.min_order_amount && <span>• حد أدنى: {formatCurrency(c.min_order_amount)}</span>}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => toggleActive(c.id, c.is_active)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', c.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                  {c.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">🏷️ إنشاء كوبون</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكوبون *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" placeholder="خصم الصيف" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm font-mono" dir="ltr" placeholder="SUMMER2026" />
                  <button type="button" onClick={generateCode} className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">عشوائي</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                    <option value="percentage">نسبة مئوية %</option>
                    <option value="fixed">مبلغ ثابت ر.س</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم *</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))} required min={1} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">حد أدنى للطلب (ر.س)</label>
                  <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: +e.target.value }))} min={0} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للاستخدام</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: +e.target.value }))} min={1} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                إنشاء الكوبون ✅
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}