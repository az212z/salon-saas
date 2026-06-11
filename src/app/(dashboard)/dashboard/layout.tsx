'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'لوحة التحكم', icon: '📊', href: '/dashboard' },
  { label: 'الحجوزات', icon: '📅', href: '/dashboard/bookings' },
  { label: 'العملاء', icon: '👥', href: '/dashboard/customers' },
  { label: 'الموظفات', icon: '👩‍💼', href: '/dashboard/staff' },
  { label: 'الخدمات', icon: '✂️', href: '/dashboard/services' },
  { label: 'التقويم', icon: '🗓️', href: '/dashboard/calendar' },
  { label: 'واتساب', icon: '💬', href: '/dashboard/whatsapp' },
  { label: 'الولاء والهدايا', icon: '🏆', href: '/dashboard/loyalty' },
  { label: 'العروض والكوبونات', icon: '🏷️', href: '/dashboard/coupons' },
  { label: 'التقارير', icon: '📈', href: '/dashboard/reports' },
  { label: 'الإعدادات', icon: '⚙️', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-50 transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-bl from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">س</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-purple-700 to-pink-500">سالوني</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="mr-auto lg:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.href === '/dashboard/bookings' && (
                  <span className="mr-auto bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">٢</span>
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="border-t border-gray-100 my-4" />

          {/* User */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-bl from-purple-300 to-pink-300 flex items-center justify-center text-white font-bold">
                ن
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">نورة المدير</p>
                <p className="text-xs text-gray-400 truncate">مديرة الصالون</p>
              </div>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="text-lg">🚪</span>
            <span>تسجيل الخروج</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="بحث عن حجز، عميلة، خدمة..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-lg">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-l from-purple-600 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all">
                <span>+</span>
                <span>حجز جديد</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}