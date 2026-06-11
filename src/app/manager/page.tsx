import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحة المدير | سالوني",
  description:
    "لوحة مدير عربية لإدارة حجوزات الصالون، العميلات، الإيرادات، والموظفات.",
};

const stats = [
  ["حجوزات اليوم", "42", "+18%"],
  ["إيرادات مؤكدة", "18.4K", "+12%"],
  ["إشغال الموظفات", "76%", "متوازن"],
  ["عميلات جدد", "11", "+4"],
];

const bookings = [
  ["10:00", "لمياء", "صبغة جذور", "مؤكد"],
  ["13:00", "هيا", "قص أطراف", "انتظار"],
  ["16:30", "سارة", "صبغة + عناية", "عربون"],
];

export default function ManagerPage() {
  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
          <Link className="font-bold text-purple-700" href="/">
            سالوني
          </Link>
          <div className="flex items-center gap-2">
            <Link className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50" href="/client">
              صفحة العميلة
            </Link>
            <Link className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white" href="/dashboard">
              دخول اللوحة
            </Link>
          </div>
        </nav>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-bold text-purple-700">صفحة المدير</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
              لوحة تشغيل يومية للحجوزات والعميلات والفريق.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              صفحة مختصرة للمدير تعرض مؤشرات اليوم، الحجوزات القادمة، وروابط العمل السريع داخل النظام.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-pink-500 p-5 text-white shadow-xl shadow-purple-100">
            <p className="text-sm text-white/75">صالون لوكس بيوتي</p>
            <p className="mt-2 text-3xl font-extrabold">الخميس 11 يونيو</p>
            <p className="mt-4 text-sm leading-6 text-white/80">تحديث تلقائي للحجوزات، المدفوعات، وتذكيرات واتساب.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, change]) => (
            <div key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm text-gray-500">{label}</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900">حجوزات اليوم</h2>
              <Link className="text-sm font-bold text-purple-700" href="/dashboard/bookings">
                إدارة الحجوزات
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {bookings.map(([time, client, service, status]) => (
                <div key={`${time}-${client}`} className="grid grid-cols-[80px_1fr_auto] items-center gap-3 py-4">
                  <p className="font-bold text-purple-700">{time}</p>
                  <div>
                    <p className="font-bold text-gray-900">{client}</p>
                    <p className="text-sm text-gray-500">{service}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{status}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900">اختصارات المدير</h2>
            <div className="mt-4 grid gap-3">
              {[
                ["العميلات", "/dashboard/customers"],
                ["الخدمات", "/dashboard/services"],
                ["الموظفات", "/dashboard/staff"],
                ["التقارير", "/dashboard/reports"],
              ].map(([label, href]) => (
                <Link key={label} className="rounded-2xl bg-gray-50 px-4 py-3 font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-700" href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
