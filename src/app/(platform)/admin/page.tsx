'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

const STATS = [
  { label: 'صالونات نشطة', value: '١٢', change: '+٢', icon: '🏪', color: 'bg-purple-50 text-purple-700' },
  { label: 'إيرادات الشهر', value: '٧,١٨٨ ر.س', change: '+١٥%', icon: '💰', color: 'bg-green-50 text-green-700' },
  { label: 'حجوزات الشهر', value: '١,٢٤٥', change: '+٨%', icon: '📅', color: 'bg-blue-50 text-blue-700' },
  { label: 'اشتراكات جديدة', value: '٣', change: '+١', icon: '🆕', color: 'bg-pink-50 text-pink-700' },
];

const TENANTS = [
  { name: 'لوكس بيوتي', slug: 'luxe-beauty', plan: 'احترافية', status: 'نشط', revenue: '٢,٣٩٦ ر.س', bookings: 423, customers: 156 },
  { name: 'جلام ستايل', slug: 'glam-style', plan: 'متقدمة', status: 'نشط', revenue: '٩٩٩ ر.س', bookings: 289, customers: 89 },
  { name: 'روز بيوتي', slug: 'rose-beauty', plan: 'أساسية', status: 'تجربة', revenue: '٠ ر.س', bookings: 45, customers: 23 },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'billing' | 'plans'>('tenants');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-bl from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">س</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">سالوني</h1>
              <p className="text-xs text-gray-400">لوحة مالك المنصة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/tenants/new" className="bg-gradient-to-l from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              + إضافة صالون
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg', stat.color)}>
                  {stat.icon}
                </div>
              </div>
              {stat.change && (
                <p className="text-sm text-green-600 mt-2">
                  <span className="font-medium">{stat.change}</span>
                  <span className="text-gray-400 mr-1">من الشهر الماضي</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-6">
          {[
            { id: 'tenants' as const, label: 'الصالونات' },
            { id: 'billing' as const, label: 'الفوترة' },
            { id: 'plans' as const, label: 'الخطط' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tenants Table */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">الصالونات المشتركة</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-purple-300 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الصالون</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الخطة</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الإيرادات</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الحجوزات</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">العملاء</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TENANTS.map((tenant, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-bl from-purple-200 to-pink-200 flex items-center justify-center text-purple-700 font-bold">
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{tenant.name}</p>
                            <p className="text-xs text-gray-400" dir="ltr">{tenant.slug}.saloni.sa</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          tenant.plan === 'متقدمة' ? 'bg-purple-100 text-purple-700' :
                          tenant.plan === 'احترافية' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          tenant.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{tenant.revenue}</td>
                      <td className="px-6 py-4 text-gray-600">{tenant.bookings}</td>
                      <td className="px-6 py-4 text-gray-600">{tenant.customers}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-purple-600 transition-colors" title="عرض">
                            👁️
                          </button>
                          <button className="text-gray-400 hover:text-blue-600 transition-colors" title="تعديل">
                            ✏️
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors" title="تعطيل">
                            ⏸️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">عرض ١-٣ من ١٢ صالون</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">→</button>
                <button className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm">١</button>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">٢</button>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">٣</button>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">←</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">الفوترة</h3>
            <p className="text-gray-500">إدارة الاشتراكات والمدفوعات والفواتير</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-extrabold text-green-700">٧,١٨٨ ر.س</p>
                <p className="text-sm text-green-600">إيرادات الشهر</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-extrabold text-blue-700">٩ صالون</p>
                <p className="text-sm text-blue-600">اشتراكات نشطة</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-2xl font-extrabold text-yellow-700">٣ صالون</p>
                <p className="text-sm text-yellow-600">في فترة تجربة</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'أساسية', price: 299, tenants: 3, color: 'border-gray-200' },
              { name: 'احترافية', price: 599, tenants: 6, color: 'border-purple-300 ring-2 ring-purple-100' },
              { name: 'متقدمة', price: 999, tenants: 3, color: 'border-gray-200' },
            ].map((plan, i) => (
              <div key={i} className={cn('bg-white rounded-2xl p-6 border-2', plan.color)}>
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-3xl font-extrabold mt-2 bg-clip-text text-transparent bg-gradient-to-l from-purple-700 to-pink-500">{plan.price} <span className="text-sm text-gray-500">ر.س/شهر</span></p>
                <p className="text-sm text-gray-500 mt-2">{plan.tenants} صالون مشترك</p>
                <p className="text-lg font-bold mt-1">{formatCurrency(plan.tenants * plan.price)} إيراد شهري</p>
                <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  تعديل الخطة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}