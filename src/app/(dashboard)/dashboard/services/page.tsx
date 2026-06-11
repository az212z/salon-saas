'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', description: '', category_id: '', duration_minutes: 60, price: 0, original_price: 0, gender: 'female' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      const [sRes, cRes] = await Promise.all([
        supabase.from('services').select('*, categories(name)').eq('tenant_id', ud.tenant_id).order('sort_order'),
        supabase.from('categories').select('*').eq('tenant_id', ud.tenant_id).order('sort_order'),
      ]);
      setServices(sRes.data || []);
      setCategories(cRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !form.name_ar) return;
    const nameObj = form.name_en ? { ar: form.name_ar, en: form.name_en } : { ar: form.name_ar };
    const data = {
      name: nameObj,
      description: form.description ? { ar: form.description } : null,
      category_id: form.category_id || null,
      duration_minutes: form.duration_minutes,
      price: form.price,
      original_price: form.original_price || null,
      gender: form.gender,
      is_active: true,
      sort_order: services.length + 1,
    };

    if (editId) {
      await supabase.from('services').update(data).eq('id', editId);
    } else {
      await supabase.from('services').insert({ ...data, tenant_id: tenantId });
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name_ar: '', name_en: '', description: '', category_id: '', duration_minutes: 60, price: 0, original_price: 0, gender: 'female' });
    loadData();
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('services').update({ is_active: !active }).eq('id', id);
    loadData();
  }

  function startEdit(svc: any) {
    const name = typeof svc.name === 'object' ? svc.name as any : { ar: svc.name };
    setForm({
      name_ar: name.ar || '',
      name_en: name.en || '',
      description: typeof svc.description === 'object' ? (svc.description as any).ar || '' : svc.description || '',
      category_id: svc.category_id || '',
      duration_minutes: svc.duration_minutes || 60,
      price: svc.price || 0,
      original_price: svc.original_price || 0,
      gender: svc.gender || 'female',
    });
    setEditId(svc.id);
    setShowForm(true);
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">✂️ الخدمات</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} خدمة مسجلة</p>
        </div>
        <button onClick={() => { setEditId(null); setShowForm(true); }} className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
          ➕ إضافة خدمة
        </button>
      </div>

      {/* Services by category */}
      {categories.length > 0 ? categories.map(cat => {
        const catServices = services.filter(s => s.category_id === cat.id);
        if (catServices.length === 0) return null;
        return (
          <div key={cat.id}>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              {typeof cat.name === 'object' ? (cat.name as any).ar : cat.name}
              <span className="text-sm font-normal text-gray-400 mr-2">({catServices.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catServices.map(svc => (
                <div key={svc.id} className={cn('bg-white rounded-2xl border p-5 hover:shadow-md transition-all', svc.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60')}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{typeof svc.name === 'object' ? (svc.name as any).ar : svc.name}</p>
                      {svc.original_price && svc.original_price > svc.price && (
                        <span className="text-xs text-gray-400 line-through mr-2">{formatCurrency(svc.original_price)}</span>
                      )}
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', svc.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                      {svc.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-purple-700">{formatCurrency(svc.price)}</span>
                    <span className="text-gray-400">⏱ {svc.duration_minutes} دقيقة</span>
                    <span className="text-gray-400">{svc.gender === 'female' ? '♀️' : svc.gender === 'male' ? '♂️' : '⚧'}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => startEdit(svc)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100">تعديل</button>
                    <button onClick={() => toggleActive(svc.id, svc.is_active)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', svc.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                      {svc.is_active ? 'إيقاف' : 'تفعيل'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }) : (
        /* No categories, show flat list */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc.id} className={cn('bg-white rounded-2xl border p-5 hover:shadow-md transition-all', svc.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium text-gray-800">{typeof svc.name === 'object' ? (svc.name as any).ar : svc.name}</p>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', svc.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{svc.is_active ? 'نشط' : 'متوقف'}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-purple-700">{formatCurrency(svc.price)}</span>
                <span className="text-gray-400">⏱ {svc.duration_minutes} دقيقة</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => startEdit(svc)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100">تعديل</button>
                <button onClick={() => toggleActive(svc.id, svc.is_active)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', svc.is_active ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>{svc.is_active ? 'إيقاف' : 'تفعيل'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {services.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">✂️</div>
          <p className="text-gray-500">لا توجد خدمات بعد</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">{editId ? '✏️ تعديل خدمة' : '➕ إضافة خدمة'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة (عربي) *</label>
                <input value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة (إنجليزي)</label>
                <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm">
                  <option value="">بدون تصنيف</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{typeof c.name === 'object' ? (c.name as any).ar : c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ر.س) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} required min={0} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر قبل الخصم</label>
                  <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: +e.target.value }))} min={0} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدة (دقيقة) *</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: +e.target.value }))} required min={5} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm">
                  <option value="female">نسائي</option>
                  <option value="male">رجالي</option>
                  <option value="unisex">مختلط</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm resize-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                {editId ? 'حفظ التعديلات ✅' : 'إضافة الخدمة ✅'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}