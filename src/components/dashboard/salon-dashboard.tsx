'use client';

import { cn, formatCurrency, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils';
import type { DashboardStats, Booking } from '@/types';

// ==============================
// Stats Cards
// ==============================
function StatCard({ title, value, change, icon, color }: {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-gray-800">{value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-500'
            )}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-400">من الأسبوع الماضي</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-xl', color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ==============================
// Booking Timeline
// ==============================
function BookingTimeline({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">حجوزات اليوم</h3>
        <button className="text-primary text-sm font-medium hover:underline">عرض الكل</button>
      </div>
      <div className="divide-y divide-gray-50">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>لا توجد حجوزات اليوم</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-bl from-purple-300 to-pink-300 flex items-center justify-center text-white font-bold">
                    {booking.customer?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{booking.customer?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {booking.start_time} • {booking.total_duration} دقيقة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(booking.total_amount)}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border',
                    getBookingStatusColor(booking.status)
                  )}>
                    {getBookingStatusLabel(booking.status)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==============================
// Quick Actions
// ==============================
function QuickActions() {
  const actions = [
    { icon: '➕', label: 'حجز جديد', href: '/dashboard/bookings/new', color: 'bg-purple-50 text-purple-700' },
    { icon: '👤', label: 'إضافة عميلة', href: '/dashboard/customers/new', color: 'bg-blue-50 text-blue-700' },
    { icon: '✂️', label: 'إضافة خدمة', href: '/dashboard/services/new', color: 'bg-pink-50 text-pink-700' },
    { icon: '💬', label: 'إرسال رسالة', href: '/dashboard/whatsapp/new', color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className={cn(
            'flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all',
            action.color
          )}
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="font-medium">{action.label}</span>
        </a>
      ))}
    </div>
  );
}

// ==============================
// Upcoming Appointments
// ==============================
function UpcomingWidget() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
      <h3 className="font-bold text-lg mb-4">⏰ القادمة</h3>
      <div className="space-y-3">
        <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">سارة أحمد</p>
              <p className="text-white/70 text-sm">قص + صبغة</p>
            </div>
            <div className="text-left">
              <p className="font-bold">١٠:٠٠ ص</p>
              <p className="text-white/70 text-xs">مع نورة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">مريم خالد</p>
              <p className="text-white/70 text-sm">مناكير</p>
            </div>
            <div className="text-left">
              <p className="font-bold">١١:٣٠ ص</p>
              <p className="text-white/70 text-xs">مع لمى</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Customer Segments Widget
// ==============================
function CustomerSegments() {
  const segments = [
    { label: 'جديدات', count: 12, color: 'bg-blue-500', percentage: 20 },
    { label: 'نشيطات', count: 38, color: 'bg-green-500', percentage: 63 },
    { label: 'معرضات للفقدان', count: 7, color: 'bg-yellow-500', percentage: 12 },
    { label: 'مفقودات', count: 3, color: 'bg-red-500', percentage: 5 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-4">تصنيف العملاء</h3>
      {/* Progress bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-4">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn(seg.color, 'transition-all')}
            style={{ width: `${seg.percentage}%` }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', seg.color)} />
            <span className="text-sm text-gray-600">{seg.label}</span>
            <span className="text-sm font-bold text-gray-800 mr-auto">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==============================
// Main Dashboard Page
// ==============================
export default function SalonDashboard() {
  // These would come from API/hooks
  const stats: DashboardStats = {
    today_bookings: 8,
    today_revenue: 2450,
    occupancy_rate: 75,
    new_customers: 3,
    pending_bookings: 2,
    completed_bookings: 4,
    cancelled_bookings: 1,
    no_show_count: 0,
    revenue_change: 12,
    bookings_change: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      {/* Sidebar placeholder - would be a separate component */}
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">لوحة التحكم</h1>
              <p className="text-gray-500 mt-1">مرحباً بك 👋 إليك ملخص اليوم</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 transition-colors">
                📥 تصدير التقرير
              </button>
              <button className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                ➕ حجز جديد
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="حجوزات اليوم"
              value={stats.today_bookings}
              change={stats.bookings_change}
              icon="📅"
              color="bg-purple-50"
            />
            <StatCard
              title="إيرادات اليوم"
              value={formatCurrency(stats.today_revenue)}
              change={stats.revenue_change}
              icon="💰"
              color="bg-green-50"
            />
            <StatCard
              title="نسبة الإشغال"
              value={`${stats.occupancy_rate}%`}
              icon="📊"
              color="bg-blue-50"
            />
            <StatCard
              title="عميلات جديدات"
              value={stats.new_customers}
              icon="👩"
              color="bg-pink-50"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Booking Timeline */}
              <BookingTimeline bookings={[]} />
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              {/* Upcoming */}
              <UpcomingWidget />

              {/* Customer Segments */}
              <CustomerSegments />

              {/* Loyalty Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">🏅 برنامج الولاء</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">عميلات VIP</span>
                    <span className="font-bold text-purple-700">١٥</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">نقاط مكتسبة اليوم</span>
                    <span className="font-bold text-green-600">٢,٤٥٠</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">بطاقات هدايا نشطة</span>
                    <span className="font-bold text-pink-600">٨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}