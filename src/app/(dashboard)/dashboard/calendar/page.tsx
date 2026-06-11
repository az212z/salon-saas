'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM - 9 PM
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      // Get week range
      const startOfWeek = getWeekStart(currentDate);
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

      const { data } = await supabase
        .from('bookings')
        .select('*, customers(full_name), staff(name, id)')
        .eq('tenant_id', ud.tenant_id)
        .gte('start_time', startOfWeek.toISOString())
        .lt('start_time', endOfWeek.toISOString())
        .order('start_time');

      setBookings(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { if (tenantId) loadData(); }, [currentDate]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(): Date[] {
    const start = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  function getBookingsForSlot(day: Date, hour: number): any[] {
    return bookings.filter(b => {
      const bDate = new Date(b.start_time);
      return bDate.getDate() === day.getDate() &&
             bDate.getMonth() === day.getMonth() &&
             bDate.getHours() === hour;
    });
  }

  function formatDate(d: Date): string {
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  }

  function isToday(d: Date): boolean {
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  const STATUS_COLORS: Record<string, string> = {
    confirmed: 'bg-green-100 border-green-300 text-green-800',
    pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    completed: 'bg-blue-100 border-blue-300 text-blue-800',
    cancelled: 'bg-red-100 border-red-300 text-red-800',
    no_show: 'bg-gray-100 border-gray-300 text-gray-600',
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">🗓️ التقويم</h1>
          <p className="text-sm text-gray-500 mt-1">عرض الحجوزات على التقويم</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">→ السابق</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium">اليوم</button>
          <button onClick={nextWeek} className="px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">التالي ←</button>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mr-2">
            <button onClick={() => setView('week')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', view === 'week' ? 'bg-white shadow' : 'text-gray-500')}>أسبوع</button>
            <button onClick={() => setView('day')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', view === 'day' ? 'bg-white shadow' : 'text-gray-500')}>يوم</button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50">
          <div className="p-2 text-center text-xs text-gray-400">الساعة</div>
          {weekDays.map((day, i) => (
            <div key={i} className={cn('p-2 text-center border-l border-gray-100', isToday(day) && 'bg-purple-50')}>
              <p className="text-xs text-gray-500">{DAYS_AR[day.getDay()]}</p>
              <p className={cn('text-sm font-bold', isToday(day) ? 'text-purple-700' : 'text-gray-800')}>{formatDate(day)}</p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="max-h-[70vh] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[60px]">
              <div className="p-2 text-center text-xs text-gray-400 flex items-center justify-center border-l border-gray-100">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day, i) => {
                const slotBookings = getBookingsForSlot(day, hour);
                return (
                  <div key={i} className={cn('p-1 border-l border-gray-50', isToday(day) && 'bg-purple-50/30')}>
                    {slotBookings.map(b => (
                      <div key={b.id} className={cn('px-1.5 py-1 rounded-md text-[10px] font-medium border mb-0.5 truncate', STATUS_COLORS[b.status] || STATUS_COLORS.pending)}>
                        <p className="truncate font-bold">{b.customers?.full_name || '?'}</p>
                        <p className="truncate opacity-70">{b.staff?.name || '-'}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: 'مؤكد', color: 'bg-green-100 border-green-300' },
          { label: 'قيد الانتظار', color: 'bg-yellow-100 border-yellow-300' },
          { label: 'مكتمل', color: 'bg-blue-100 border-blue-300' },
          { label: 'ملغي', color: 'bg-red-100 border-red-300' },
          { label: 'لم تحضر', color: 'bg-gray-100 border-gray-300' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded border', s.color)} />
            <span className="text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-lg font-bold text-purple-700">{bookings.length}</p>
          <p className="text-xs text-gray-500">حجوزات الأسبوع</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-lg font-bold text-green-700">{bookings.filter(b => b.status === 'confirmed').length}</p>
          <p className="text-xs text-gray-500">مؤكدة</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{bookings.filter(b => b.status === 'completed').length}</p>
          <p className="text-xs text-gray-500">مكتملة</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-lg font-bold text-gray-700">{formatCurrency(bookings.filter(b => b.status === 'completed' || b.status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0))}</p>
          <p className="text-xs text-gray-500">إيرادات</p>
        </div>
      </div>
    </div>
  );
}