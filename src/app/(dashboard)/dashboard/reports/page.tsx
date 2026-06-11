'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);

      // Calculate date ranges
      const now = new Date();
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const startDate = new Date(now.getTime() - periodDays * 86400000).toISOString().split('T')[0];

      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', ud.tenant_id)
        .gte('created_at', startDate);

      // Fetch customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', ud.tenant_id);

      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', ud.tenant_id)
        .gte('created_at', startDate);

      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      const totalRevenue = completedBookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0);
      const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
      const noShowBookings = bookings?.filter(b => b.status === 'no_show').length || 0;
      const totalBookings = bookings?.length || 1;
      const cancellationRate = Math.round((cancelledBookings / totalBookings) * 100);

      setReportData({
        totalRevenue,
        totalBookings: bookings?.length || 0,
        completedBookings: completedBookings.length,
        avgBookingValue,
        cancellationRate,
        noShowRate: Math.round((noShowBookings / totalBookings) * 100),
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
        bookings,
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { if (tenantId) loadData(); }, [period]);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">📈 التقارير</h1>
          <p className="text-sm text-gray-500 mt-1">تحليلات وتقارير مفصلة</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { key: 'week' as const, label: 'أسبوع' },
            { key: 'month' as const, label: 'شهر' },
            { key: 'quarter' as const, label: 'ربع سنة' },
          ].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', period === p.key ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>{p.label}</button>
          ))}
        </div>
      </div>

      {reportData && (
        <>
          {/* Revenue Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">إجمالي الإيرادات</p>
              <p className="text-3xl font-extrabold text-green-700">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">إجمالي الحجوزات</p>
              <p className="text-3xl font-extrabold text-purple-700">{reportData.totalBookings}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">متوسط قيمة الحجز</p>
              <p className="text-3xl font-extrabold text-blue-700">{formatCurrency(reportData.avgBookingValue)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">عملاء جدد</p>
              <p className="text-3xl font-extrabold text-pink-700">{reportData.newCustomers}</p>
            </div>
          </div>

          {/* Rates */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">نسبة الإكمال</p>
                <span className="text-lg font-bold text-green-700">{reportData.totalBookings > 0 ? Math.round((reportData.completedBookings / reportData.totalBookings) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 rounded-full h-3 transition-all" style={{ width: `${reportData.totalBookings > 0 ? (reportData.completedBookings / reportData.totalBookings) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">نسبة الإلغاء</p>
                <span className="text-lg font-bold text-red-700">{reportData.cancellationRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-red-500 rounded-full h-3 transition-all" style={{ width: `${reportData.cancellationRate}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">نسبة عدم الحضور</p>
                <span className="text-lg font-bold text-amber-700">{reportData.noShowRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-amber-500 rounded-full h-3 transition-all" style={{ width: `${reportData.noShowRate}%` }} />
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 توزيع الحجوزات حسب الحالة</h3>
            <div className="grid sm:grid-cols-5 gap-4">
              {[
                { label: 'مكتملة', count: reportData.completedBookings, color: 'bg-blue-500' },
                { label: 'مؤكدة', count: reportData.bookings?.filter((b: any) => b.status === 'confirmed').length || 0, color: 'bg-green-500' },
                { label: 'قيد الانتظار', count: reportData.bookings?.filter((b: any) => b.status === 'pending').length || 0, color: 'bg-yellow-500' },
                { label: 'ملغية', count: reportData.bookings?.filter((b: any) => b.status === 'cancelled').length || 0, color: 'bg-red-500' },
                { label: 'لم يحضروا', count: reportData.bookings?.filter((b: any) => b.status === 'no_show').length || 0, color: 'bg-gray-400' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={cn('w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg', s.color)}>
                    {s.count}
                  </div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all text-sm">
              📥 تصدير التقرير PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}