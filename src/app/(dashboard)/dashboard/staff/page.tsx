'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', name_en: '', phone: '', specializations: '', commission_percentage: 20, bio_ar: '', bio_en: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('staff').select('*').eq('tenant_id', ud.tenant_id).order('name');
      setStaff(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.name) return;
    const specs = form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [];
    const data = {
      name: form.name,
      name_en: form.name_en || null,
      phone: form.phone || null,
      specializations: specs,
      commission_percentage: form.commission_percentage,
      bio: form.bio_ar ? { ar: form.bio_ar, en: form.bio_en || '' } : null,
      is_active: true,
    };

    if (editId) {
      await supabase.from('staff').update(data).eq('id', editId);
    } else {
      await supabase.from('staff').insert({ ...data, tenant_id: tenantId });
    }
    setShowForm(false); setEditId(null); resetForm(); loadData();
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('staff').update({ is_active: !active }).eq('id', id);
    loadData();
  }

  function startEdit(s: any) {
    const bio = typeof s.bio === 'object' ? s.bio as any : {};
    setForm({
      name: s.name || '', name_en: s.name_en || '', phone: s.phone || '',
      specializations: (s.specializations || []).join(', '),
      commission_percentage: s.commission_percentage || 20,
      bio_ar: bio.ar || '', bio_en: bio.en || '',
    });
    setEditId(s.id); setShowForm(true);
  }

  function resetForm() {
    setForm({ name: '', name_en: '', phone: '', specializations: '', commission_percentage: 20, bio_ar: '', bio_en: '' });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">👩‍💼 الموظفات</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.length} موظفة</p>
        </div>
        <button onClick={() => { setEditId(null); resetForm(); setShowForm(true); }} className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
          ➕ إضافة موظفة
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(s => (
          <div key={s.id} className={cn('bg-white rounded-2xl border p-5 hover:shadow-md transition-all', s.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-bl from-amber-100 to-orange-200 flex items-center justify-center text-amber-700 font-bold text-xl">
                {s.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{s.name}</p>
                <p className="text-xs text-gray-500">{s.phone || '-'}</p>
              </div>
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', s.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                {s.is_active ? 'نشطة' : 'متوقفة'}
              </span>
            </div>

            {s.specializations?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {s.specializations.map((sp: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[10px] rounded-full font-medium">{sp}</span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-purple-50 rounded-lg py-2 text-center">
                <p className="text-sm font-bold text-purple-700">{s.commission_percentage}%</p>
                <p className="text-[10px] text-purple-600">عمولة</p>
              </div>
              <div className="bg-amber-50 rounded-lg py-2 text-center">
                <p className="text-sm font-bold text-amber-700">{typeof s.bio === 'object' ? (s.bio as any).ar?.substring(0, 30) + '...' : 'لا وصف'}</p>
                <p className="text-[10px] text-amber-600">نبذة</p>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-50">
              <button onClick={() => startEdit(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100">تعديل</button>
              <button onClick={() => toggleActive(s.id, s.is_active)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', s.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                {s.is_active ? 'إيقاف' : 'تفعيل'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">👩‍💼</div>
          <p className="text-gray-500">لا توجد موظفات بعد</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">{editId ? '✏️ تعديل موظفة' : '➕ إضافة موظفة'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي) *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي)</label>
                  <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجوال</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05XXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التخصصات (مفصولة بفاصلة)</label>
                <input value={form.specializations} onChange={e => setForm(f => ({ ...f, specializations: e.target.value }))} placeholder="قص، صبغة، مكياج" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نسبة العمولة %</label>
                <input type="number" value={form.commission_percentage} onChange={e => setForm(f => ({ ...f, commission_percentage: +e.target.value }))} min={0} max={100} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نبذة تعريفية</label>
                <textarea value={form.bio_ar} onChange={e => setForm(f => ({ ...f, bio_ar: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm resize-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                {editId ? 'حفظ التعديلات ✅' : 'إضافة الموظفة ✅'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}