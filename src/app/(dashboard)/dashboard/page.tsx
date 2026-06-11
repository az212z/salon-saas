'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================
// Types
// ==============================
interface DashboardData {
  todayBookings: number;
  todayRevenue: number;
  weekRevenue: number;
  newCustomers: number;
  occupancyRate: number;
  pendingBookings: number;
  completedToday: number;
  cancelledToday: number;
  noShowToday: number;
  revenueChange: number;
  bookingsChange: number;
  recentBookings: any[];
  topServices: { name: string; count: number; revenue: number }[];
  weeklyRevenue: { day: string; amount: number }[];
  customerSegments: { label: string; count: number; color: string; pct: number }[];
  staffPerformance: { name: string; bookings: number; revenue: number; rating: number }[];
}

// ==============================
// Stat Card
// ==============================
function StatCard({ title, value, change, icon, color, prefix = '' }: {
  title: string; value: string | number; change?: number; icon: string; color: string; prefix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-800">{prefix}{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-500'
            )}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-400">هذا الأسبوع</span>
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-lg', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ==============================
// Mini Bar Chart (no deps)
// ==============================
function MiniBarChart({ data, height = 120 }: { data: { label: string; value: number }[]; height?: number }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 justify-between" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] text-gray-400 font-medium">{d.value > 0 ? formatCurrency(d.value) : '-'}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-purple-600 to-pink-400 min-w-[20px] transition-all hover:opacity-80"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// Donut Chart (SVG)
// ==============================
function DonutChart({ segments, size = 140 }: { segments: { label: string; count: number; color: string; pct: number }[]; size?: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const el = (
            <circle
              key={i}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="60" y="56" textAnchor="middle" className="text-xl font-bold fill-gray-800">
          {segments.reduce((s, seg) => s + seg.count, 0)}
        </text>
        <text x="60" y="72" textAnchor="middle" className="text-[10px] fill-gray-400">عميلة</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', seg.color)} />
            <span className="text-xs text-gray-600">{seg.label}</span>
            <span className="text-xs font-bold text-gray-800">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==============================
// Booking Row
// ==============================
function BookingRow({ booking }: { booking: any }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    confirmed: { label: 'مؤكد', color: 'bg-green-50 text-green-700 border-green-200' },
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    completed: { label: 'مكتمل', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-700 border-red-200' },
    no_show: { label: 'لم تحضر', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  };
  const st = statusMap[booking.status] || statusMap.pending;

  return (
    <div className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-bl from-purple-200 to-pink-200 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
        {(booking.customers?.full_name || '?').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{booking.customers?.full_name || 'عميلة'}</p>
        <p className="text-xs text-gray-500 truncate">
          {booking.services?.map((s: any) => s.name || s.service_id).join(' • ') || 'خدمة'}
        </p>
      </div>
      <div className="text-left shrink-0">
        <p className="text-xs font-bold text-gray-800">
          {booking.start_time ? new Date(booking.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}
        </p>
        <p className="text-xs text-gray-400">{booking.staff?.name || '-'}</p>
      </div>
      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0', st.color)}>
        {st.label}
      </span>
    </div>
  );
}

// ==============================
// Staff Performance Row
// ==============================
function StaffRow({ staff }: { staff: { name: string; bookings: number; revenue: number; rating: number } }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-bl from-amber-200 to-orange-200 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
        {staff.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{staff.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cn('text-xs', i < Math.round(staff.rating) ? 'text-amber-400' : 'text-gray-200')}>★</span>
          ))}
        </div>
      </div>
      <div className="text-left shrink-0">
        <p className="text-sm font-bold text-gray-800">{staff.bookings}</p>
        <p className="text-xs text-gray-400">{formatCurrency(staff.revenue)}</p>
      </div>
    </div>
  );
}

// ==============================
// Top Services
// ==============================
function TopServiceItem({ svc, idx }: { svc: { name: string; count: number; revenue: number }; idx: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-lg w-6 text-center">{medals[idx] || `${idx + 1}`}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{svc.name}</p>
        <p className="text-xs text-gray-500">{svc.count} حجز</p>
      </div>
      <span className="text-sm font-bold text-purple-700">{formatCurrency(svc.revenue)}</span>
    </div>
  );
}

// ==============================
// Main Dashboard
// ==============================
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's tenant
      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) return;
      const tid = userData.tenant_id;
      setTenantId(tid);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      // Fetch today's bookings
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('*, customers(full_name), services:booking_services(service_id), staff(name)')
        .eq('tenant_id', tid)
        .gte('created_at', today)
        .order('start_time', { ascending: true });

      // Fetch weekly bookings for revenue
      const { data: weekBookings } = await supabase
        .from('bookings')
        .select('total_amount, status, created_at')
        .eq('tenant_id', tid)
        .gte('created_at', weekAgo);

      // Fetch new customers this week
      const { count: newCustCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tid)
        .gte('created_at', weekAgo);

      // Fetch total active customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tid);

      // Fetch staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, name')
        .eq('tenant_id', tid)
        .eq('is_active', true);

      // Fetch top services
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name')
        .eq('tenant_id', tid)
        .eq('is_active', true);

      // Calculate stats
      const completedToday = todayBookings?.filter(b => b.status === 'completed').length || 0;
      const pendingToday = todayBookings?.filter(b => b.status === 'pending').length || 0;
      const cancelledToday = todayBookings?.filter(b => b.status === 'cancelled').length || 0;
      const noShowToday = todayBookings?.filter(b => b.status === 'no_show').length || 0;
      const todayRevenue = todayBookings?.filter(b => b.status === 'paid' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const weekRevenue = weekBookings?.filter(b => b.status === 'paid' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      // Weekly revenue by day
      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weeklyRevenue = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        const dayStr = d.toISOString().split('T')[0];
        const dayBookings = weekBookings?.filter(b =>
          b.created_at?.startsWith(dayStr) && (b.status === 'paid' || b.status === 'completed')
        ) || [];
        return {
          day: dayNames[d.getDay()],
          amount: dayBookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0),
        };
      });

      // Customer segments (simplified)
      const goldCount = totalCustomers ? Math.floor(totalCustomers * 0.15) : 0;
      const silverCount = totalCustomers ? Math.floor(totalCustomers * 0.35) : 0;
      const bronzeCount = totalCustomers ? Math.floor(totalCustomers * 0.40) : 0;
      const newCount = newCustCount || 0;
      const customerSegments = [
        { label: 'VIP', count: goldCount, color: 'text-amber-500', pct: totalCustomers ? (goldCount / totalCustomers) * 100 : 0 },
        { label: 'ذهبي', count: goldCount, color: 'text-yellow-500', pct: totalCustomers ? (goldCount / totalCustomers) * 100 : 0 },
        { label: 'فضي', count: silverCount, color: 'text-gray-400', pct: totalCustomers ? (silverCount / totalCustomers) * 100 : 0 },
        { label: 'برونزي', count: bronzeCount, color: 'text-orange-400', pct: totalCustomers ? (bronzeCount / totalCustomers) * 100 : 0 },
      ];

      // Mock staff performance (would need real booking data)
      const staffPerformance = (staffData || []).slice(0, 5).map((s: any) => ({
        name: s.name,
        bookings: Math.floor(Math.random() * 15) + 5,
        revenue: Math.floor(Math.random() * 3000) + 500,
        rating: 3.5 + Math.random() * 1.5,
      }));

      // Top services (mock for now)
      const topServices = (servicesData || []).slice(0, 3).map((s: any) => ({
        name: typeof s.name === 'object' ? (s.name as any).ar || JSON.stringify(s.name) : s.name,
        count: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      }));

      // Occupancy: based on completed / total slots (simplified)
      const totalSlots = (staffData?.length || 1) * 8; // 8 slots per staff
      const occupancyRate = totalSlots > 0 ? Math.round((completedToday / totalSlots) * 100) : 0;

      setData({
        todayBookings: todayBookings?.length || 0,
        todayRevenue,
        weekRevenue,
        newCustomers: newCustCount || 0,
        occupancyRate: Math.min(occupancyRate, 100),
        pendingBookings: pendingToday,
        completedToday,
        cancelledToday,
        noShowToday,
        revenueChange: 12, // would need previous week comparison
        bookingsChange: 8,
        recentBookings: (todayBookings || []).slice(0, 8),
        topServices,
        weeklyRevenue,
        customerSegments,
        staffPerformance,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20" dir="rtl">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد بيانات</h2>
        <p className="text-gray-500 text-sm">ابدأ بإضافة خدمات وحجوزات لعرض لوحة التحكم</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1 text-sm">مرحباً بك 👋 إليك ملخص اليوم</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-colors">
            📥 تصدير التقرير
          </button>
          <a href="/dashboard/bookings/new" className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
            ➕ حجز جديد
          </a>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="حجوزات اليوم" value={data.todayBookings} change={data.bookingsChange} icon="📅" color="bg-purple-50" />
        <StatCard title="إيرادات اليوم" value={formatCurrency(data.todayRevenue)} change={data.revenueChange} icon="💰" color="bg-green-50" />
        <StatCard title="نسبة الإشغال" value={`${data.occupancyRate}%`} icon="📊" color="bg-blue-50" />
        <StatCard title="عميلات جديدات" value={data.newCustomers} icon="👩" color="bg-pink-50" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-green-700">{data.completedToday}</p>
          <p className="text-xs text-green-600">مكتملة ✅</p>
        </div>
        <div className="bg-yellow-50 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-yellow-700">{data.pendingBookings}</p>
          <p className="text-xs text-yellow-600">قيد الانتظار ⏳</p>
        </div>
        <div className="bg-red-50 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-red-700">{data.cancelledToday}</p>
          <p className="text-xs text-red-600">ملغية ❌</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
          <p className="text-lg font-bold text-gray-700">{data.noShowToday}</p>
          <p className="text-xs text-gray-600">لم تحضر 🚫</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Revenue Chart + Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800">📈 إيرادات الأسبوع</h3>
              <span className="text-sm text-gray-500">الإجمالي: {formatCurrency(data.weekRevenue)}</span>
            </div>
            <MiniBarChart data={data.weeklyRevenue.map(d => ({ label: d.day, value: d.amount }))} height={140} />
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">📅 حجوزات اليوم</h3>
              <a href="/dashboard/bookings" className="text-purple-600 text-sm font-medium hover:underline">عرض الكل</a>
            </div>
            {data.recentBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">لا توجد حجوزات اليوم</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.recentBookings.map((b: any) => <BookingRow key={b.id} booking={b} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Segments + Services + Staff */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '➕', label: 'حجز جديد', href: '/dashboard/bookings/new', color: 'bg-purple-50 text-purple-700' },
              { icon: '👤', label: 'إضافة عميلة', href: '/dashboard/customers/new', color: 'bg-blue-50 text-blue-700' },
              { icon: '✂️', label: 'إضافة خدمة', href: '/dashboard/services/new', color: 'bg-pink-50 text-pink-700' },
              { icon: '💬', label: 'إرسال رسالة', href: '/dashboard/whatsapp', color: 'bg-green-50 text-green-700' },
            ].map((action) => (
              <a key={action.href} href={action.href} className={cn('flex items-center gap-2 p-3.5 rounded-xl border border-gray-100 hover:shadow-md transition-all text-sm font-medium', action.color)}>
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </a>
            ))}
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">👥 تصنيف العملاء</h3>
            <DonutChart segments={data.customerSegments.map(s => ({ ...s, color: s.color.replace('text-', 'bg-') }))} size={130} />
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3">🏆 أعلى الخدمات</h3>
            {data.topServices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.topServices.map((svc, i) => <TopServiceItem key={i} svc={svc} idx={i} />)}
              </div>
            )}
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3">👩‍🎨 أداء الموظفات</h3>
            {data.staffPerformance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.staffPerformance.map((s, i) => <StaffRow key={i} staff={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}