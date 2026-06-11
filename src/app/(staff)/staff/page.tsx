'use client';

import { useState } from 'react';
import { cn, formatTime, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils';

// Mock data for staff portal
const TODAY_SCHEDULE = [
  { id: '1', time: '09:00', end: '10:30', customer: 'سارة أحمد', services: ['قص + صبغة'], status: 'completed' as const, notes: 'تفضل اللون البني الغامق' },
  { id: '2', time: '10:30', end: '11:30', customer: 'مريم خالد', services: ['مناكير جل'], status: 'in_progress' as const, notes: '' },
  { id: '3', time: '12:00', end: '13:00', customer: 'نورة العتيبي', services: ['بديكير'], status: 'confirmed' as const, notes: 'حساسة من الأسيتون' },
  { id: '4', time: '14:00', end: '15:30', customer: 'فاطمة السعيد', services: ['كيراتين'], status: 'confirmed' as const, notes: '' },
  { id: '5', time: '16:00', end: '17:00', customer: 'ريم الحربي', services: ['قص أطفال'], status: 'pending' as const, notes: '' },
];

export default function StaffPortal() {
  const [activeView, setActiveView] = useState<'today' | 'requests' | 'stats'>('today');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-bl from-purple-500 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              ن
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">نورة</p>
              <p className="text-xs text-gray-400">خبيرة صبغة وقص</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* View Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-6">
          {[
            { id: 'today' as const, label: 'جدول اليوم', icon: '📅' },
            { id: 'requests' as const, label: 'طلبات الإجازة', icon: '🏖️' },
            { id: 'stats' as const, label: 'إحصائياتي', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeView === tab.id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Today's Schedule */}
        {activeView === 'today' && (
          <div className="space-y-4">
            {/* Today Summary */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
              <p className="text-white/70 text-sm">اليوم — الخميس ١١ يونيو</p>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-3xl font-extrabold">٥ حجوزات</p>
                  <p className="text-white/70 text-sm mt-1">٩:٠٠ ص — ٥:٠٠ م</p>
                </div>
                <div className="text-5xl">📅</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                  <p className="text-xl font-bold">٢</p>
                  <p className="text-xs text-white/70">مكتمل</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                  <p className="text-xl font-bold">١</p>
                  <p className="text-xs text-white/70">جاري</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                  <p className="text-xl font-bold">٢</p>
                  <p className="text-xs text-white/70">قادم</p>
                </div>
              </div>
            </div>

            {/* Schedule Items */}
            {TODAY_SCHEDULE.map((booking, i) => (
              <div key={booking.id} className={cn(
                'bg-white rounded-2xl p-5 border shadow-sm',
                booking.status === 'completed' ? 'border-green-100' :
                booking.status === 'in_progress' ? 'border-purple-200 ring-2 ring-purple-100' :
                'border-gray-100'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Time column */}
                    <div className="text-center min-w-[3.5rem]">
                      <p className="text-lg font-bold text-gray-800">{formatTime(booking.time)}</p>
                      <p className="text-xs text-gray-400">{formatTime(booking.end)}</p>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{booking.customer}</p>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getBookingStatusColor(booking.status)
                        )}>
                          {getBookingStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.services.map((service, si) => (
                          <span key={si} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1">
                          <span>📋</span> {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 mr-[4.5rem]">
                  {booking.status === 'confirmed' && (
                    <button className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                      بدء الخدمة
                    </button>
                  )}
                  {booking.status === 'in_progress' && (
                    <button className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                      إنهاء الخدمة ✓
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <>
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-medium">
                        تأكيد
                      </button>
                      <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium">
                        رفض
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-xl text-sm">
                      مكتمل ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave Requests */}
        {activeView === 'requests' && (
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-l from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              + طلب إجازة جديدة
            </button>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">إجازة عيد الأضحى</p>
                  <p className="text-sm text-gray-500">٦ يوليو — ١٠ يوليو ٢٠٢٥</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  قيد المراجعة
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {activeView === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-purple-700">٤٢</p>
                <p className="text-sm text-gray-500">حجز هذا الشهر</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-green-600">٣,٧٥٠ ر.س</p>
                <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-blue-600">٤.٨</p>
                <p className="text-sm text-gray-500">تقييم العملاء</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-extrabold text-pink-600">١٥٪</p>
                <p className="text-sm text-gray-500">نسبة العمولة</p>
              </div>
            </div>

            {/* Commission Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">ملخص العمولة 💰</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">قص + صبغة (٨ حجوزات)</span>
                  <span className="font-bold text-gray-800">١,٨٠٠ ر.س</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">مناكير (١٢ حجز)</span>
                  <span className="font-bold text-gray-800">٧٢٠ ر.س</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">كيراتين (٥ حجوزات)</span>
                  <span className="font-bold text-gray-800">٩٣٧ ر.س</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-gray-800">الإجمالي</span>
                  <span className="text-xl font-extrabold text-purple-700">٣,٤٥٧ ر.س</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}