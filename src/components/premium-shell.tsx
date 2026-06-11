"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  Search,
  Send,
  Settings,
  Scissors,
  Tags,
  Sparkles,
  UserCog,
  UsersRound,
} from "lucide-react";

import {
  bookings,
  customers,
  dashboardStats,
  demoOwner,
  pageMeta,
  salon,
  services,
  timeSlots,
  whatsappStatus,
} from "@/lib/demo-platform";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "الحجوزات", icon: CalendarDays },
  { href: "/dashboard/customers", label: "العملاء", icon: UsersRound },
  { href: "/dashboard/services", label: "الخدمات", icon: Scissors },
  { href: "/dashboard/staff", label: "الفريق", icon: UserCog },
  { href: "/dashboard/reports", label: "التقارير", icon: BarChart3 },
  { href: "/dashboard/loyalty", label: "الولاء", icon: Gift },
  { href: "/dashboard/coupons", label: "العروض", icon: Tags },
  { href: "/dashboard/whatsapp", label: "واتساب", icon: MessageCircle },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex items-center gap-3" href="/" prefetch={false}>
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#211829,#7c3a57)] text-white shadow-lg shadow-rose-950/10">
        <Sparkles size={20} />
      </span>
      {!compact ? (
        <span>
          <span className="block text-lg font-black tracking-tight text-[#211829]">سالوني</span>
          <span className="block text-xs font-semibold text-stone-500">تشغيل الصالون بوضوح</span>
        </span>
      ) : null}
    </Link>
  );
}

function TopNav({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/86 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 rounded-2xl bg-stone-100/70 p-1 md:flex">
          {[
            ["/client", "صفحة العميل"],
            ["/manager", "صفحة المدير"],
            ["/auth/login", "دخول علي"],
          ].map(([href, label]) => (
            <Link
              key={href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                active === href ? "bg-white text-[#211829] shadow-sm" : "text-stone-600 hover:text-[#211829]"
              )}
              href={href}
              prefetch={false}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="rounded-2xl bg-[#211829] px-5 py-3 text-sm font-black text-white shadow-xl shadow-stone-900/10" href="/dashboard" prefetch={false}>
          لوحة التشغيل
        </Link>
      </div>
    </header>
  );
}

function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>{children}</section>;
}

function StatGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-stone-500">{stat.label}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-black text-[#211829]">{stat.value}</p>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-800">{stat.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingRows() {
  return (
    <div className="divide-y divide-stone-100">
      {bookings.map((booking) => (
        <div key={`${booking.time}-${booking.client}`} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 py-4">
          <p className="font-black text-rose-900" dir="ltr">
            {booking.time}
          </p>
          <div>
            <p className="font-black text-[#211829]">{booking.client}</p>
            <p className="text-sm font-semibold text-stone-500">
              {booking.service} مع {booking.staff}
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">{booking.status}</span>
        </div>
      ))}
    </div>
  );
}

function ClientBookingCard() {
  const [selectedService, setSelectedService] = useState(services[0].id);
  const [selectedTime, setSelectedTime] = useState(timeSlots[2]);
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const service = services.find((item) => item.id === selectedService) ?? services[0];
  const canConfirm = phone.trim().length >= 8;

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-2xl shadow-rose-950/8">
      <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#201821,#6e334d_55%,#b76d77)] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/70">{salon.name}</p>
            <h2 className="mt-1 text-3xl font-black">حجز موعد</h2>
          </div>
          <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black">تقييم {salon.rating}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {services.map((item) => (
            <button
              key={item.id}
              className={cn(
                "rounded-2xl border p-4 text-right transition",
                selectedService === item.id
                  ? "border-white bg-white text-[#211829] shadow-lg"
                  : "border-white/18 bg-white/8 text-white hover:bg-white/14"
              )}
              type="button"
              onClick={() => setSelectedService(item.id)}
            >
              <p className="font-black">{item.name}</p>
              <p className={cn("mt-2 text-xs font-bold", selectedService === item.id ? "text-stone-500" : "text-white/65")}>
                {item.duration} · {item.specialist}
              </p>
              <p className="mt-3 text-xl font-black">{item.price} ر.س</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-2 pt-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="mb-3 text-sm font-black text-[#211829]">اختيار الوقت</p>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm font-black transition",
                  selectedTime === time ? "border-rose-900 bg-rose-900 text-white" : "border-stone-200 bg-stone-50 text-stone-700"
                )}
                dir="ltr"
                type="button"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-3 block text-sm font-black text-[#211829]" htmlFor="client-phone">
            رقم الجوال للتحقق
          </label>
          <input
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-left text-sm font-bold outline-none ring-rose-900/10 transition focus:border-rose-900 focus:ring-4"
            dir="ltr"
            id="client-phone"
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+966 5X XXX XXXX"
            value={phone}
          />
          <p className="mt-2 text-xs font-bold text-stone-500">في demo الرمز هو {demoOwner.otp}. الإرسال الحقيقي يحتاج ربط WhatsApp Business.</p>
        </div>
      </div>

      <div className="mt-2 rounded-3xl bg-stone-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-stone-500">الموعد المختار</p>
            <p className="mt-1 font-black text-[#211829]">
              {service.name} · اليوم {selectedTime} · عربون 30%
            </p>
          </div>
          <button
            className="rounded-2xl bg-[#211829] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canConfirm}
            type="button"
            onClick={() => setConfirmed(true)}
          >
            تأكيد الحجز
          </button>
        </div>
        {confirmed ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
            <CheckCircle2 size={18} />
            تم إنشاء حجز تجريبي وإظهار رمز التحقق {demoOwner.otp}.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PublicHome() {
  return (
    <main className="min-h-screen bg-[#f7f4f0] text-[#211829]">
      <TopNav />
      <SectionShell className="grid min-h-[calc(100vh-5rem)] items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-7">
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            نظام واحد يحفظ إيقاع الصالون من أول حجز حتى آخر رسالة.
          </h1>
          <p className="max-w-2xl text-lg font-semibold leading-9 text-stone-600">
            سالوني منصة تشغيل عربية للصالونات: حجوزات، CRM، ولاء، واتساب، وتقارير يومية بدون تعقيد أو وعود فضفاضة.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-2xl bg-[#211829] px-6 py-4 text-sm font-black text-white shadow-xl shadow-stone-900/10" href="/manager" prefetch={false}>
              جرّب صفحة المدير
            </Link>
            <Link className="rounded-2xl border border-stone-300 bg-white px-6 py-4 text-sm font-black text-[#211829]" href="/client" prefetch={false}>
              افتح تجربة العميل
            </Link>
          </div>
        </div>
        <ManagerPreview />
      </SectionShell>
    </main>
  );
}

export function ClientExperience({ standalone = true }: { standalone?: boolean }) {
  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#211829]">
      {standalone ? <TopNav active="/client" /> : null}
      <SectionShell className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-black text-rose-900">تجربة العميل</p>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
            حجز واضح، تحقق واتساب، وملف جمال يتذكر التفاصيل.
          </h1>
          <p className="text-lg font-semibold leading-9 text-stone-600">
            صيغنا تجربة العميل بلغة مباشرة: الخدمة، السعر، الوقت، العربون، ثم تأكيد لا يترك مجالاً للالتباس.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["الولاء", "1,480 نقطة"],
              ["المحفظة", "220 ر.س"],
              ["الزيارات", "18 زيارة"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold text-stone-500">{label}</p>
                <p className="mt-2 text-xl font-black text-[#211829]">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <ClientBookingCard />
      </SectionShell>
    </main>
  );
}

export function ClientProfileExperience() {
  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#211829]">
      <TopNav active="/client" />
      <SectionShell className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black text-rose-900">ملف العميلة</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">تاريخ واضح للزيارات، التفضيلات، والنقاط.</h1>
          <p className="mt-4 text-base font-semibold leading-8 text-stone-600">
            هذه صفحة العميلة بعد الدخول: تحفظ اللون المفضل، الحساسية، آخر زيارة، الرصيد، وتعرض رسائل المتابعة بدون زحمة.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["مستوى الولاء", "ذهبي"],
              ["النقاط", "1,480"],
              ["الرصيد", "220 ر.س"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-stone-50 p-5">
                <p className="text-xs font-bold text-stone-500">{label}</p>
                <p className="mt-2 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">آخر التوصيات</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["لون الشعر", "بني شوكولاتة، رقم 5.7، بدون تفتيح قوي."],
              ["ملاحظة عناية", "تجنب الأسيتون القوي، واستخدام طبقة حماية قبل الجل."],
              ["رسالة قادمة", "تذكير واتساب قبل الموعد بـ 24 ساعة عند الربط الحقيقي."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-stone-50 p-4">
                <p className="font-black">{title}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionShell>
    </main>
  );
}

function ManagerPreview() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-950/8">
      <div className="rounded-[1.5rem] bg-[#211829] p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{salon.name}</p>
            <p className="mt-1 text-2xl font-black">نبض اليوم</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">متصل</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {dashboardStats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/8 p-4">
              <p className="text-xs font-bold text-white/55">{stat.label}</p>
              <p className="mt-2 text-2xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-2 pt-4">
        <BookingRows />
      </div>
    </div>
  );
}

export function ManagerDashboard({ title = "لوحة التشغيل", description = "مؤشرات اليوم، الحجوزات، رسائل واتساب، وحالة الفريق في صفحة واحدة." }: { title?: string; description?: string }) {
  return (
    <main className="min-h-screen bg-[#f7f4f0] text-[#211829]">
      <TopNav active="/manager" />
      <SectionShell>
        <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black text-rose-900">صفحة المدير</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-stone-600">{description}</p>
          </div>
          <Link className="rounded-2xl bg-[#211829] px-5 py-3 text-sm font-black text-white" href="/auth/login" prefetch={false}>
            دخول علي
          </Link>
        </div>
        <StatGrid />
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black">حجوزات اليوم</h2>
              <Link className="text-sm font-black text-rose-900" href="/dashboard/bookings" prefetch={false}>
                التفاصيل
              </Link>
            </div>
            <BookingRows />
          </section>
          <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">واتساب</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-stone-600">
              الوضع الحالي demo. الإرسال الحقيقي يحتاج رقم WhatsApp Business مفعل ومفاتيح Meta.
            </p>
            <div className="mt-5 grid gap-3">
              {["رمز تحقق جاهز", "تذكير قبل الموعد", "رسالة شكر وتقييم"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4">
                  <span className="font-black">{item}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">مفعل demo</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </SectionShell>
    </main>
  );
}

export function DashboardShell({ page = "dashboard" }: { page?: keyof typeof pageMeta | "dashboard" | "admin" | "staff" }) {
  const meta = page === "dashboard" ? { title: "مركز التشغيل", description: "كل ما يحتاجه المدير قبل بداية اليوم وأثناء ضغط المواعيد." } : page === "admin" ? { title: "إدارة المنصة", description: "مراقبة الصالونات، الخطط، وحالة الاشتراكات من مكان واحد." } : page === "staff" ? { title: "صفحة الموظفة", description: "قائمة اليوم، التحضير لكل عميلة، وحالة الخدمة." } : pageMeta[page];
  const [query, setQuery] = useState("");
  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return customers;
    return customers.filter((customer) => [customer.name, customer.phone, customer.tier].join(" ").includes(query.trim()));
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f7f4f0] text-[#211829]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1fr_280px]">
        <aside className="border-b border-stone-200 bg-white p-4 lg:sticky lg:top-0 lg:col-start-2 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-5">
            <Brand />
            <nav className="grid gap-2 sm:grid-cols-5 lg:grid-cols-1">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-stone-600 transition hover:bg-stone-100 hover:text-[#211829]" href={item.href} prefetch={false}>
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-3xl bg-[#211829] p-4 text-white">
              <p className="font-black">حساب الاختبار</p>
              <p className="mt-2 text-xs leading-6 text-white/65">
                {demoOwner.email}
                <br />
                كلمة المرور: {demoOwner.password}
              </p>
            </div>
          </div>
        </aside>
        <section className="min-w-0 p-4 sm:p-6 lg:col-start-1 lg:row-start-1 lg:p-8">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black text-rose-900">{salon.name}</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-[#211829]">{meta.title}</h1>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-8 text-stone-600">{meta.description}</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-4 top-3.5 text-stone-400" size={18} />
              <input
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white pr-11 text-sm font-bold outline-none ring-rose-900/10 focus:border-rose-900 focus:ring-4"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث سريع"
                value={query}
              />
            </div>
          </div>
          <StatGrid />
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_410px]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5">
              <h2 className="text-2xl font-black">{page === "whatsapp" ? "حالة رسائل واتساب" : "حجوزات وتشغيل"}</h2>
              {page === "whatsapp" ? <WhatsAppPanel /> : <BookingRows />}
            </div>
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5">
              <h2 className="text-2xl font-black">عملاء مختارون</h2>
              <div className="mt-4 grid gap-3">
                {filteredCustomers.map((customer) => (
                  <div key={customer.phone} className="rounded-2xl bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">{customer.name}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-stone-700">{customer.tier}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-stone-500">{customer.phone} · {customer.last}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function WhatsAppPanel() {
  return (
    <div className="mt-4 grid gap-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-black text-amber-900">غير مربوط برقم حقيقي بعد</p>
        <p className="mt-2 text-sm font-semibold leading-7 text-amber-900/75">
          لا أقدر أرسل من رقمك الشخصي بدون Meta WhatsApp Business Cloud API. عند إضافة المفاتيح أدناه يتحول النظام من demo إلى إرسال فعلي.
        </p>
      </div>
      {whatsappStatus.requiredEnv.map((env) => (
        <div key={env} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4">
          <code className="text-xs font-black text-stone-600">{env}</code>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-stone-500">مطلوب</span>
        </div>
      ))}
      <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211829] px-5 py-3 text-sm font-black text-white" type="button">
        <Send size={16} />
        تجربة رسالة demo
      </button>
    </div>
  );
}

export function LoginExperience() {
  const [email, setEmail] = useState(demoOwner.email);
  const [password, setPassword] = useState(demoOwner.password);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");

  function normalizeDigits(value: string) {
    return value.replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "email") {
      if (email.trim().toLowerCase() === demoOwner.email && normalizeDigits(password) === demoOwner.password) {
        window.localStorage.setItem("saloni-demo-user", JSON.stringify({ name: demoOwner.name, email: demoOwner.email }));
        window.location.href = "/dashboard";
        return;
      }
      setMessage("بيانات الدخول التجريبية: ali212@icloud.com / 123123");
      return;
    }

    if (phone.trim().length >= 8 && normalizeDigits(otp) === demoOwner.otp) {
      window.localStorage.setItem("saloni-demo-user", JSON.stringify({ name: demoOwner.name, phone }));
      window.location.href = "/dashboard";
      return;
    }
    setMessage(`رمز OTP التجريبي هو ${demoOwner.otp}. الإرسال الحقيقي يحتاج ربط واتساب.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f4f0] text-[#211829]">
      <TopNav active="/auth/login" />
      <SectionShell className="grid min-h-[calc(100vh-5rem)] items-center gap-10 lg:grid-cols-[1fr_460px]">
        <div className="space-y-6">
          <p className="text-sm font-black text-rose-900">دخول الاختبار</p>
          <h1 className="text-5xl font-black leading-tight tracking-tight">حساب علي جاهز للتجربة بدون انتظار قاعدة البيانات.</h1>
          <p className="max-w-2xl text-lg font-semibold leading-9 text-stone-600">
            أنشأت مسار دخول demo يعمل على الرابط الحي. عند ربط Supabase الحقيقي يمكن نقل نفس الحساب إلى Auth بشكل آمن من لوحة Supabase.
          </p>
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="font-black">بيانات الاختبار</p>
            <p className="mt-2 text-sm font-bold leading-7 text-stone-600">
              البريد: {demoOwner.email}
              <br />
              كلمة المرور: {demoOwner.password}
              <br />
              OTP التجريبي: {demoOwner.otp}
            </p>
          </div>
        </div>
        <form className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-2xl shadow-stone-950/8" onSubmit={submit}>
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
            <button className={cn("rounded-xl px-4 py-3 text-sm font-black", mode === "email" ? "bg-white shadow-sm" : "text-stone-500")} onClick={() => setMode("email")} type="button">
              البريد
            </button>
            <button className={cn("rounded-xl px-4 py-3 text-sm font-black", mode === "otp" ? "bg-white shadow-sm" : "text-stone-500")} onClick={() => setMode("otp")} type="button">
              OTP واتساب
            </button>
          </div>
          {mode === "email" ? (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-black">
                البريد الإلكتروني
                <input className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-left outline-none focus:border-rose-900" dir="ltr" onChange={(event) => setEmail(event.target.value)} value={email} />
              </label>
              <label className="grid gap-2 text-sm font-black">
                كلمة المرور
                <input className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-left outline-none focus:border-rose-900" dir="ltr" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
              </label>
            </div>
          ) : (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-black">
                رقم الجوال
                <input className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-left outline-none focus:border-rose-900" dir="ltr" onChange={(event) => setPhone(event.target.value)} placeholder="+966..." value={phone} />
              </label>
              <label className="grid gap-2 text-sm font-black">
                رمز التحقق
                <input className="h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-center text-xl font-black outline-none focus:border-rose-900" dir="ltr" maxLength={6} onChange={(event) => setOtp(event.target.value)} placeholder="123123" value={otp} />
              </label>
            </div>
          )}
          {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">{message}</p> : null}
          <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#211829] text-sm font-black text-white" type="submit">
            <LockKeyhole size={16} />
            دخول
          </button>
        </form>
      </SectionShell>
    </main>
  );
}

export function RegisterExperience() {
  return (
    <main className="min-h-screen bg-[#f7f4f0] text-[#211829]">
      <TopNav />
      <SectionShell className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black text-rose-900">تجربة اشتراك صالون</p>
          <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight">إعداد صالون جديد خلال دقائق.</h1>
          <p className="mt-5 text-lg font-semibold leading-9 text-stone-600">هذه صفحة تسجيل demo آمنة للعرض. التسجيل الحقيقي يحتاج ربط Supabase Auth ومفتاح الخدمة في بيئة السيرفر.</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl">
          {["بيانات المالك", "هوية الصالون", "الخطة", "المراجعة"].map((step, index) => (
            <div key={step} className="flex items-center gap-4 border-b border-stone-100 py-4 last:border-b-0">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-stone-100 text-sm font-black">{index + 1}</span>
              <div>
                <p className="font-black">{step}</p>
                <p className="text-sm font-semibold text-stone-500">جاهز للربط الفعلي بعد إدخال مفاتيح Supabase.</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </main>
  );
}

export function StaffExperience() {
  return <DashboardShell page="staff" />;
}

export function AdminExperience() {
  return <DashboardShell page="admin" />;
}
