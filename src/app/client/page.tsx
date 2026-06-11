import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحة العميلة | سالوني",
  description:
    "صفحة عميلة عربية لحجز خدمات الصالون، متابعة النقاط، واستعراض ملف الجمال.",
};

const services = [
  ["صبغة جذور + عناية", "95 دقيقة", "320 ر.س"],
  ["تنظيف بشرة VIP", "70 دقيقة", "260 ر.س"],
  ["مانيكير جل فاخر", "55 دقيقة", "145 ر.س"],
];

const steps = ["اختيار الخدمة", "اختيار الموظفة", "تأكيد الوقت", "العربون"];

export default function ClientPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50" dir="rtl">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[1fr_420px] lg:items-center lg:px-8">
        <div className="space-y-7">
          <nav className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-purple-100 backdrop-blur">
            <Link className="font-bold text-purple-700" href="/">
              سالوني
            </Link>
            <Link className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white" href="/manager">
              صفحة المدير
            </Link>
          </nav>

          <div className="space-y-5">
            <p className="text-sm font-bold text-purple-700">صفحة العميلة</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
              احجزي موعدك، تابعي نقاطك، وخلي ملف جمالك مع الصالون.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-gray-600">
              تجربة حجز عربية مباشرة للعميلة: خدمات واضحة، موظفات متاحات، عربون، وتذكيرات واتساب.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-gradient-to-l from-purple-600 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200" href="/luxe-beauty">
                افتحي صفحة الصالون
              </Link>
              <Link className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-purple-700 ring-1 ring-purple-100" href="/auth/register">
                إنشاء حساب
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-purple-100">
                <span className="text-xs font-bold text-purple-500">0{index + 1}</span>
                <p className="mt-2 font-bold text-gray-800">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] bg-white p-5 shadow-2xl shadow-purple-100 ring-1 ring-purple-100">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-purple-700 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/75">Luxe Beauty</p>
                <h2 className="text-2xl font-extrabold">حجز جديد</h2>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">4.9 ★</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {services.map(([name, duration, price]) => (
                <div key={name} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/20">
                  <p className="font-bold">{name}</p>
                  <p className="mt-2 text-xs text-white/75">{duration}</p>
                  <p className="mt-3 text-lg font-extrabold">{price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["نقاطك", "1,480"],
              ["زيارات", "18"],
              ["محفظة", "220 ر.س"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-extrabold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
