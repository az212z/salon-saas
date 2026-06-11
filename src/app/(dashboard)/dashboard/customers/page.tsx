'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TIER_MAP: Record<string, { label: string; color: string; bg: string }> = {
  bronze: { label: 'برونزي', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  silver: { label: 'فضي', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  gold: { label: 'ذهبي', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  vip: { label: 'VIP', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', ud.tenant_id)
        .order('full_name');

      setCustomers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!selected || !noteText.trim()) return;
    await supabase.from('customer_notes').insert({
      tenant_id: tenantId,
      customer_id: selected.id,
      content: noteText,
      created_by: 'admin',
    });
    setNoteText('');
    setShowAddNote(false);
    // Refresh notes
    const { data: notes } = await supabase.from('customer_notes').select('*').eq('customer_id', selected.id).order('created_at', { ascending: false });
    setSelected({ ...selected, notes: notes || [] });
  }

  async function openCustomer(c: any) {
    const { data: notes } = await supabase.from('customer_notes').select('*').eq('customer_id', c.id).order('created_at', { ascending: false });
    const { data: bookings } = await supabase.from('bookings').select('*, services(name)').eq('customer_id', c.id).order('start_time', { ascending: false }).limit(10);
    setSelected({ ...c, notes: notes || [], bookings: bookings || [] });
  }

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">👥 العملاء</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} عميلة مسجلة</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الجوال أو الإيميل..." className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
      </div>

      {/* Customer Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const tier = TIER_MAP[c.loyalty_tier] || TIER_MAP.bronze;
          return (
            <div key={c.id} onClick={() => openCustomer(c)} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-purple-200 cursor-pointer transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-bl from-purple-200 to-pink-200 flex items-center justify-center text-purple-700 font-bold">
                  {c.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{c.full_name}</p>
                  <p className="text-xs text-gray-500">{c.phone || '-'}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', tier.bg, tier.color)}>{tier.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-800">{c.total_visits || 0}</p>
                  <p className="text-[10px] text-gray-500">زيارة</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(c.lifetime_value || 0)}</p>
                  <p className="text-[10px] text-gray-500">إجمالي</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-sm font-bold text-purple-700">{c.loyalty_points || 0}</p>
                  <p className="text-[10px] text-gray-500">نقاط</p>
                </div>
              </div>
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500">لا توجد عملاء</p>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-gray-800">👤 ملف العميلة</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-bl from-purple-200 to-pink-200 flex items-center justify-center text-purple-700 font-bold text-2xl">
                  {selected.full_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{selected.full_name}</p>
                  <p className="text-sm text-gray-500">{selected.phone} {selected.email && `• ${selected.email}`}</p>
                  {selected.birth_date && <p className="text-xs text-gray-400 mt-0.5">🎂 {new Date(selected.birth_date).toLocaleDateString('ar-SA')}</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-purple-700">{selected.loyalty_points || 0}</p>
                  <p className="text-[10px] text-purple-600">نقاط</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-700">{formatCurrency(selected.lifetime_value || 0)}</p>
                  <p className="text-[10px] text-green-600">إجمالي</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{selected.total_visits || 0}</p>
                  <p className="text-[10px] text-blue-600">زيارة</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-amber-700">{formatCurrency(selected.average_spend || 0)}</p>
                  <p className="text-[10px] text-amber-600">متوسط</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">📝 ملاحظات</h3>
                  <button onClick={() => setShowAddNote(true)} className="text-purple-600 text-xs font-medium hover:underline">+ إضافة</button>
                </div>
                {showAddNote && (
                  <div className="mb-3 flex gap-2">
                    <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="أضف ملاحظة..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-300" />
                    <button onClick={addNote} className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium">حفظ</button>
                  </div>
                )}
                <div className="space-y-2">
                  {(selected.notes || []).map((n: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700">{n.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                  ))}
                  {(selected.notes || []).length === 0 && <p className="text-xs text-gray-400">لا توجد ملاحظات</p>}
                </div>
              </div>

              {/* Recent Bookings */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">📅 آخر الحجوزات</h3>
                <div className="space-y-2">
                  {(selected.bookings || []).map((b: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{b.start_time ? new Date(b.start_time).toLocaleDateString('ar-SA') : '-'}</p>
                        <p className="text-xs text-gray-500">{b.status}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(b.total_amount)}</span>
                    </div>
                  ))}
                  {(selected.bookings || []).length === 0 && <p className="text-xs text-gray-400">لا توجد حجوزات</p>}
                </div>
              </div>

              {/* Tags */}
              {selected.tags?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">🏷️ التصنيفات</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}