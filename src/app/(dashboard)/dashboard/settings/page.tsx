'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const DAY_LABELS: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة',
};

export default function SettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'general' | 'hours' | 'booking' | 'payments' | 'loyalty'>('general');
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      const { data } = await supabase.from('tenants').select('*').eq('id', ud.tenant_id).single();
      setTenant(data);
      setForm({
        name_ar: typeof data?.name === 'object' ? (data.name as any).ar : data?.name || '',
        name_en: typeof data?.name === 'object' ? (data.name as any).en : '',
        description_ar: typeof data?.description === 'object' ? (data.description as any).ar : '',
        description_en: typeof data?.description === 'object' ? (data.description as any).en : '',
        phone: data?.phone || '',
        email: data?.email || '',
        primary_color: data?.primary_color || '#8B5CF6',
        address: data?.address || {},
        business_hours: data?.business_hours || {},
        settings: data?.settings || {},
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleSave() {
    if (!tenant) return;
    setSaving(true);
    try {
      const update: any = {
        name: { ar: form.name_ar, en: form.name_en },
        description: { ar: form.description_ar, en: form.description_en },
        phone: form.phone,
        email: form.email,
        primary_color: form.primary_color,
        address: form.address,
        business_hours: form.business_hours,
        settings: form.settings,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('tenants').update(update).eq('id', tenant.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">⚙️ الإعدادات</h1>
          <p className="text-sm text-gray-500 mt-1">إعدادات الصالون والمنصة</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : saved ? '✅ تم الحفظ' : '💾 حفظ التغييرات'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {[
          { key: 'general' as const, label: 'عام', icon: '🏪' },
          { key: 'hours' as const, label: 'ساعات العمل', icon: '🕐' },
          { key: 'booking' as const, label: 'الحجوزات', icon: '📅' },
          { key: 'payments' as const, label: 'المدفوعات', icon: '💳' },
          { key: 'loyalty' as const, label: 'الولاء', icon: '💎' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all', tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">🏪 معلومات الصالون</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
              <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي)</label>
              <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (عربي)</label>
            <textarea value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الجوال</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الإيميل</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <input value={form.address?.city || ''} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
              <input value={form.address?.district || ''} onChange={e => setForm({ ...form, address: { ...form.address, district: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الشارع</label>
              <input value={form.address?.street || ''} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون الرئيسي</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 rounded-lg cursor-pointer" />
              <input value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm w-32" dir="ltr" />
            </div>
          </div>
        </div>
      )}

      {tab === 'hours' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">🕐 ساعات العمل</h3>
          <div className="space-y-3">
            {DAYS.map(day => {
              const hours = form.business_hours?.[day] || { start: '09:00', end: '21:00' };
              return (
                <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                  <span className="w-24 text-sm font-medium text-gray-700">{DAY_LABELS[day]}</span>
                  <input type="time" value={hours.start || '09:00'} onChange={e => setForm({ ...form, business_hours: { ...form.business_hours, [day]: { ...hours, start: e.target.value } } })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                  <span className="text-gray-400">→</span>
                  <input type="time" value={hours.end || '21:00'} onChange={e => setForm({ ...form, business_hours: { ...form.business_hours, [day]: { ...hours, end: e.target.value } } })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'booking' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">📅 إعدادات الحجوزات</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدة فترة الحجز (دقيقة)</label>
              <select value={form.settings?.booking_slot_interval_minutes || 30} onChange={e => setForm({ ...form, settings: { ...form.settings, booking_slot_interval_minutes: +e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
                <option value={15}>15 دقيقة</option>
                <option value={30}>30 دقيقة</option>
                <option value={45}>45 دقيقة</option>
                <option value={60}>60 دقيقة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">أقصى حجز مستقبلي (أيام)</label>
              <input type="number" value={form.settings?.max_future_booking_days || 30} onChange={e => setForm({ ...form, settings: { ...form.settings, max_future_booking_days: +e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موعد آخر إلغاء (ساعات قبل)</label>
              <input type="number" value={form.settings?.cancellation_deadline_hours || 6} onChange={e => setForm({ ...form, settings: { ...form.settings, cancellation_deadline_hours: +e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نسبة العربون %</label>
              <input type="number" value={form.settings?.deposit_percentage || 20} onChange={e => setForm({ ...form, settings: { ...form.settings, deposit_percentage: +e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" min={0} max={100} />
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.settings?.deposit_required || false} onChange={e => setForm({ ...form, settings: { ...form.settings, deposit_required: e.target.checked } })} className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-sm text-gray-700">طلب عربون عند الحجز</span>
            </label>
          </div>
          <div className="flex items-center gap-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.settings?.whatsapp_enabled || false} onChange={e => setForm({ ...form, settings: { ...form.settings, whatsapp_enabled: e.target.checked } })} className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-sm text-gray-700">تفعيل رسائل واتساب التلقائية</span>
            </label>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">💳 إعدادات المدفوعات</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            ⚠️ مفاتيح API تُضبط من ملف البيئة (.env) — لا تعرض هنا للأمان.
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">بطاقات الائتمان (Visa/Mastercard)</p>
                  <p className="text-xs text-gray-500">2.5% + 0.50 ر.س</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">مفعّل</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏦</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">مدى (Mada)</p>
                  <p className="text-xs text-gray-500">1.0% + 0.25 ر.س</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">مفعّل</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Apple Pay</p>
                  <p className="text-xs text-gray-500">2.5% + 0.50 ر.س</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">مفعّل</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">STC Pay</p>
                  <p className="text-xs text-gray-500">1.5% + 0.25 ر.س</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium">اختياري</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'loyalty' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg">💎 إعدادات الولاء</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نقاط لكل ريال</label>
              <input type="number" value={form.settings?.loyalty_points_per_riyal || 10} onChange={e => setForm({ ...form, settings: { ...form.settings, loyalty_points_per_riyal: +e.target.value } })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" min={1} />
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { tier: 'برونزي', key: 'bronze', pts: 0 },
              { tier: 'فضي', key: 'silver', pts: 500 },
              { tier: 'ذهبي', key: 'gold', pts: 2000 },
              { tier: 'VIP', key: 'vip', pts: 5000 },
            ].map(t => (
              <div key={t.key} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="font-bold text-gray-800 text-sm">{t.tier}</p>
                <p className="text-xs text-gray-500 mt-1">من {t.pts} نقطة</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}