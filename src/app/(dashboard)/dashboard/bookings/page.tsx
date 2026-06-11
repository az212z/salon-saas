'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  confirmed: { label: 'مؤكد', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed: { label: 'مكتمل', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  cancelled: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  no_show: { label: 'لم تحضر', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      const { data } = await supabase
        .from('bookings')
        .select('*, customers(full_name, phone), staff(name)')
        .eq('tenant_id', ud.tenant_id)
        .order('start_time', { ascending: false })
        .limit(100);

      setBookings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.customers?.full_name || '').toLowerCase().includes(q) || b.id.includes(q);
    }
    return true;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    no_show: bookings.filter(b => b.status === 'no_show').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]" dir="rtl">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">📅 الحجوزات</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة جميع حجوزات الصالون</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
          ➕ حجز جديد
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن حجز أو عميلة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                filter === s ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
              )}
            >
              {s === 'all' ? 'الكل' : STATUS_MAP[s].label}
              <span className="mr-1 opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="px-5 py-3 text-right font-medium">العميلة</th>
                  <th className="px-5 py-3 text-right font-medium">الخدمة</th>
                  <th className="px-5 py-3 text-right font-medium">الموظفة</th>
                  <th className="px-5 py-3 text-right font-medium">التاريخ</th>
                  <th className="px-5 py-3 text-right font-medium">الوقت</th>
                  <th className="px-5 py-3 text-right font-medium">المبلغ</th>
                  <th className="px-5 py-3 text-right font-medium">الحالة</th>
                  <th className="px-5 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const st = STATUS_MAP[b.status as BookingStatus] || STATUS_MAP.pending;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                            {(b.customers?.full_name || '?').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{b.customers?.full_name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{b.services?.[0]?.name || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{b.staff?.name || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {b.start_time ? new Date(b.start_time).toLocaleDateString('ar-SA') : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {b.start_time ? new Date(b.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-gray-800">{formatCurrency(b.total_amount)}</td>
                      <td className="px-5 py-3">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-medium border', st.bg, st.color)}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {b.status === 'pending' && (
                            <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-2 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100">تأكيد</button>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">إكمال</button>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100">إلغاء</button>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateStatus(b.id, 'no_show')} className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100">لم تحضر</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {filtered.map(b => {
              const st = STATUS_MAP[b.status as BookingStatus] || STATUS_MAP.pending;
              return (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                        {(b.customers?.full_name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{b.customers?.full_name || '-'}</p>
                        <p className="text-xs text-gray-500">{b.staff?.name || '-'} • {b.start_time ? new Date(b.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </div>
                    </div>
                    <span className={cn('px-2 py-1 rounded-full text-[10px] font-medium border', st.bg, st.color)}>{st.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{b.start_time ? new Date(b.start_time).toLocaleDateString('ar-SA') : '-'}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(b.total_amount)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {b.status === 'pending' && <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">تأكيد</button>}
                    {b.status === 'confirmed' && <button onClick={() => updateStatus(b.id, 'completed')} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">إكمال</button>}
                    {(b.status === 'pending' || b.status === 'confirmed') && <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700">إلغاء</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNew && <NewBookingModal tenantId={tenantId!} onClose={() => { setShowNew(false); loadData(); }} />}
    </div>
  );
}

// ==============================
// New Booking Modal
// ==============================
function NewBookingModal({ tenantId, onClose }: { tenantId: string; onClose: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ customer_id: '', service_id: '', staff_id: '', date: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [sRes, stRes, cRes] = await Promise.all([
        supabase.from('services').select('*').eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true),
        supabase.from('customers').select('*').eq('tenant_id', tenantId).order('full_name'),
      ]);
      setServices(sRes.data || []);
      setStaffList(stRes.data || []);
      setCustomers(cRes.data || []);
    }
    load();
  }, [tenantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_id || !form.service_id || !form.date || !form.time) return;
    setSubmitting(true);
    try {
      const svc = services.find(s => s.id === form.service_id);
      const start = new Date(`${form.date}T${form.time}:00`).toISOString();
      const end = new Date(new Date(start).getTime() + (svc?.duration_minutes || 60) * 60000).toISOString();

      await supabase.from('bookings').insert({
        tenant_id: tenantId,
        customer_id: form.customer_id,
        staff_id: form.staff_id || null,
        start_time: start,
        end_time: end,
        total_amount: svc?.price || 0,
        total_duration: svc?.duration_minutes || 60,
        status: 'confirmed',
        notes: form.notes,
        booking_source: 'admin',
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-800">➕ حجز جديد</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العميلة *</label>
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm">
              <option value="">اختر عميلة</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الخدمة *</label>
            <select value={form.service_id} onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm">
              <option value="">اختر خدمة</option>
              {services.map(s => <option key={s.id} value={s.id}>{typeof s.name === 'object' ? (s.name as any).ar : s.name} — {formatCurrency(s.price)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الموظفة</label>
            <select value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm">
              <option value="">أي موظفة متاحة</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوقت *</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm resize-none" placeholder="ملاحظات إضافية..." />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
            {submitting ? 'جاري التأكيد...' : 'تأكيد الحجز ✅'}
          </button>
        </form>
      </div>
    </div>
  );
}