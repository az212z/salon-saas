'use client';

import { useState } from 'react';
import { cn, formatCurrency, formatDate, getLoyaltyTierLabel, getLoyaltyTierColor, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils';
import type { Customer, Booking, LoyaltyTransaction, GiftCard } from '@/types';

// Tabs for the customer profile
const TABS = [
  { id: 'bookings', label: 'حجوزاتي', icon: '📅' },
  { id: 'beauty', label: 'ملف الجمال', icon: '💄' },
  { id: 'loyalty', label: 'نقاطي وهداياي', icon: '🏆' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState<TabId>('bookings');

  // Mock data — would come from API
  const customer: Partial<Customer> = {
    full_name: 'سارة أحمد',
    phone: '0512345678',
    email: 'sara@example.com',
    avatar_url: undefined,
    loyalty_points: 1250,
    loyalty_tier: 'silver',
    lifetime_value: 4500,
    total_visits: 12,
    average_spend: 375,
    wallet_balance: 200,
    referral_code: 'SARA2024',
    skin_type: 'مختلطة',
    hair_color: 'بني غامق',
    preferred_color: 'أشقر رمادي',
    allergies: ['صبغة أمونيا'],
    beauty_notes: 'تفضل الجلسات الصباحية. حساسة من منتجات الكيراتين.',
  };

  const upcomingBookings: Partial<Booking>[] = [
    { id: '1', booking_number: 'BK-20250611-0001', booking_date: '2025-06-12', start_time: '10:00', status: 'confirmed', total_amount: 350, total_duration: 90 },
    { id: '2', booking_number: 'BK-20250611-0002', booking_date: '2025-06-15', start_time: '14:00', status: 'pending', total_amount: 200, total_duration: 60 },
  ];

  const pastBookings: Partial<Booking>[] = [
    { id: '3', booking_number: 'BK-20250601-0001', booking_date: '2025-06-01', start_time: '09:00', status: 'completed', total_amount: 450, total_duration: 120 },
    { id: '4', booking_number: 'BK-20250520-0001', booking_date: '2025-05-20', start_time: '11:00', status: 'completed', total_amount: 300, total_duration: 75 },
  ];

  const tierProgress = {
    current: customer.loyalty_points || 0,
    next: 2000,
    percentage: ((customer.loyalty_points || 0) / 2000) * 100,
  };

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-bl from-purple-300 to-pink-300 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {customer.full_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{customer.full_name}</h1>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              <div className={cn('inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium', getLoyaltyTierColor(customer.loyalty_tier || 'bronze'))}>
                🏅 {getLoyaltyTierLabel(customer.loyalty_tier || 'bronze')}
                <span className="text-xs opacity-75">({customer.loyalty_points} نقطة)</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'الزيارات', value: customer.total_visits },
              { label: 'إجمالي الإنفاق', value: formatCurrency(customer.lifetime_value || 0) },
              { label: 'متوسط الزيارة', value: formatCurrency(customer.average_spend || 0) },
              { label: 'رصيد المحفظة', value: formatCurrency(customer.wallet_balance || 0) },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-gray-50 rounded-xl p-3">
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Loyalty Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{getLoyaltyTierLabel(customer.loyalty_tier || 'bronze')}</span>
              <span className="text-gray-400">{customer.loyalty_points} / {tierProgress.next} نقطة → ذهبي</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gradient-to-l from-purple-600 to-pink-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(tierProgress.percentage, 100)}%` }} />
            </div>
          </div>

          {/* Referral Code */}
          <div className="mt-4 bg-purple-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">كود الإحالة الخاص بك</p>
              <p className="text-lg font-bold text-purple-900 tracking-wider" dir="ltr">{customer.referral_code}</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              شاركي الكود
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Upcoming */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">الحجوزات القادمة</h3>
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">حجز #{booking.booking_number}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(booking.booking_date!)} • الساعة {booking.start_time}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5">{booking.total_duration} دقيقة</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-purple-700">{formatCurrency(booking.total_amount!)}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border mt-1 inline-block', getBookingStatusColor(booking.status!))}>
                        {getBookingStatusLabel(booking.status!)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                      إعادة الحجز
                    </button>
                    {booking.status === 'confirmed' && (
                      <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                        إلغاء الحجز
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {upcomingBookings.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📅</div>
                  <p>لا توجد حجوزات قادمة</p>
                  <button className="mt-3 text-purple-600 font-medium hover:underline">احجزي الآن</button>
                </div>
              )}
            </div>

            {/* Past */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3">الحجوزات السابقة</h3>
              {pastBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-600">حجز #{booking.booking_number}</p>
                      <p className="text-sm text-gray-400 mt-1">{formatDate(booking.booking_date!)}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-700">{formatCurrency(booking.total_amount!)}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getBookingStatusColor(booking.status!))}>
                        {getBookingStatusLabel(booking.status!)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'beauty' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-lg">ملف الجمال الخاص بي 💄</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع البشرة</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.skin_type}>
                  <option>عادية</option><option>جافة</option><option>دهنية</option><option>مختلطة</option><option>حساسة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">لون الشعر</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.hair_color} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">لون الصبغة المفضل</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.preferred_color} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حساسيات</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.allergies?.join(', ')} placeholder="مثال: أمونيا، كيراتين" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات جمالية</label>
              <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none h-24 resize-none" defaultValue={customer.beauty_notes} placeholder="أي معلومات تساعد الموظفة في خدمتك..." />
            </div>

            <button className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all">
              حفظ التغييرات
            </button>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            {/* Points */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 text-sm">رصيد النقاط</p>
                  <p className="text-4xl font-extrabold">{customer.loyalty_points}</p>
                </div>
                <div className="text-5xl">🏆</div>
              </div>
              <div className="mt-4 bg-white/15 rounded-xl p-3">
                <p className="text-sm text-white/80">أنتِ في مستوى {getLoyaltyTierLabel(customer.loyalty_tier || 'bronze')}</p>
                <p className="text-sm text-white/80">تبقى {tierProgress.next - (customer.loyalty_points || 0)} نقطة لمستوى ذهبي</p>
              </div>
            </div>

            {/* Gift Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">بطاقات الهدايا 🎁</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-gray-500">رصيد المحفظة</p>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(customer.wallet_balance || 0)}</p>
                </div>
                <button className="bg-purple-50 rounded-xl p-4 border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors flex flex-col items-center justify-center">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm font-medium text-purple-700 mt-1">أهدِ صديقة</span>
                </button>
              </div>
            </div>

            {/* Referral */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">كود الإحالة 🎉</h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">شاركي هذا الكود مع صديقاتك</p>
                  <p className="text-xl font-bold tracking-wider" dir="ltr">{customer.referral_code}</p>
                  <p className="text-xs text-purple-600 mt-1">كلاكما تحصلن على ١٠٠ نقطة!</p>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                  نسخ الكود
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">الإعدادات</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.full_name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.phone} dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" defaultValue={customer.email} dir="ltr" />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">الإشعارات</h4>
                <div className="space-y-3">
                  {[
                    { label: 'تأكيد الحجز عبر واتساب', enabled: true },
                    { label: 'تذكير بالحجز قبل ٢٤ ساعة', enabled: true },
                    { label: 'عروض وتخفيضات', enabled: false },
                    { label: 'تهنئة عيد ميلاد', enabled: true },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{notif.label}</span>
                      <div className={cn('w-12 h-7 rounded-full transition-colors cursor-pointer relative', notif.enabled ? 'bg-purple-600' : 'bg-gray-300')}>
                        <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all', notif.enabled ? 'left-5' : 'left-0.5')} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all">
              حفظ التغييرات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}