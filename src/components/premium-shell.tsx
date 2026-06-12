"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  Crown,
  Gauge,
  Gem,
  Gift,
  LayoutDashboard,
  LogIn,
  MessageCircle,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  bookings,
  calendarPlan,
  campaigns,
  coupons,
  customers,
  dashboardStats,
  demoOwner,
  loyaltyRows,
  pageMeta,
  reportMetrics,
  salon,
  services,
  settingsGroups,
  staffMembers,
  timeSlots,
  weeklyRevenue,
  whatsappStatus,
  whatsappTemplates,
} from "@/lib/demo-platform";

type DashboardPage = keyof typeof pageMeta;
type BookingStatus = "مؤكد" | "وصلت" | "قيد الانتظار" | "ملغي";

type DashboardContext = {
  statuses: Record<string, BookingStatus>;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  actionLog: string;
  logAction: (message: string) => void;
  settingsDraft: {
    salonName: string;
    depositPercent: number;
    hours: string;
    branch: string;
  };
  setSettingsDraft: (draft: DashboardContext["settingsDraft"]) => void;
};

const moneyFormatter = new Intl.NumberFormat("ar-SA");

const dashboardNav: Array<{ page: DashboardPage; label: string; href: string; icon: LucideIcon }> = [
  { page: "dashboard", label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { page: "bookings", label: "الحجوزات", href: "/dashboard/bookings", icon: ClipboardList },
  { page: "calendar", label: "التقويم", href: "/dashboard/calendar", icon: CalendarDays },
  { page: "customers", label: "العملاء", href: "/dashboard/customers", icon: UsersRound },
  { page: "services", label: "الخدمات", href: "/dashboard/services", icon: Tags },
  { page: "staff", label: "الفريق", href: "/dashboard/staff", icon: UserRound },
  { page: "reports", label: "التقارير", href: "/dashboard/reports", icon: BarChart3 },
  { page: "loyalty", label: "الولاء", href: "/dashboard/loyalty", icon: Gem },
  { page: "coupons", label: "العروض", href: "/dashboard/coupons", icon: Gift },
  { page: "whatsapp", label: "واتساب", href: "/dashboard/whatsapp", icon: MessageCircle },
  { page: "settings", label: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

const dateOptions = ["الأحد 18 مايو", "الاثنين 19 مايو", "الثلاثاء 20 مايو", "الأربعاء 21 مايو"];
const bookingFilters = ["الكل", "مؤكد", "وصلت", "قيد الانتظار", "ملغي"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function money(value: number) {
  return `${moneyFormatter.format(value)} ر.س`;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function AppLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#211829] text-[#f5c8bf] shadow-sm">
        <Crown size={21} strokeWidth={1.8} />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-semibold leading-6 text-[#211829]">Saloni Pro</p>
          <p className="text-xs font-medium text-[#7f7482]">منصة تشغيل الصالونات</p>
        </div>
      )}
    </div>
  );
}

function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cx("rounded-lg border border-[#eadfdd] bg-white shadow-[0_18px_60px_rgba(33,24,41,0.06)]", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-[#f0e7e4] px-5 py-4">
      {title && <h2 className="text-base font-semibold text-[#211829]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  variant = "light",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "dark" | "light" | "outline" | "green" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants = {
    dark: "border-[#211829] bg-[#211829] text-white hover:bg-[#33263f]",
    light: "border-[#eadfdd] bg-white text-[#211829] hover:bg-[#fbf6f5]",
    outline: "border-[#d8c7c3] bg-transparent text-[#211829] hover:bg-white",
    green: "border-[#cfe5d2] bg-[#edf8ef] text-[#167339] hover:bg-[#e2f3e5]",
    danger: "border-[#f2c9c5] bg-[#fff2f1] text-[#b93f34] hover:bg-[#ffe8e6]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#d88782]/30",
        variants[variant],
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {Icon && <Icon size={17} strokeWidth={1.9} />}
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status.includes("وصلت")
    ? "border-[#dcd4ff] bg-[#f3f0ff] text-[#6550b9]"
    : status.includes("مؤكد") || status.includes("نشط") || status.includes("متاحة")
      ? "border-[#cfe5d2] bg-[#edf8ef] text-[#17733a]"
      : status.includes("انتظار") || status.includes("مسودة") || status.includes("موسمية")
        ? "border-[#f0dfb8] bg-[#fff8e7] text-[#a26a00]"
        : status.includes("ملغي")
          ? "border-[#f2c9c5] bg-[#fff2f1] text-[#b93f34]"
          : "border-[#e5dadd] bg-[#fbf7f6] text-[#6f6571]";

  return <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tone)}>{status}</span>;
}

function ProgressBar({ value, tone = "bg-[#d88782]" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 rounded-full bg-[#f0e7e4]">
      <div className={cx("h-full rounded-full", tone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-[#eadfdd] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#7f7482]">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf2f1] text-[#b87776]">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 text-2xl font800 font-semibold text-[#211829]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#36854c]">{note}</p>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#211829] text-sm font-semibold text-[#f5c8bf]">
      {initials}
    </span>
  );
}

export function PublicHome() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f4f2] text-[#211829]">
      <header className="sticky top-0 z-30 border-b border-[#eadfdd]/80 bg-[#f7f4f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandMark />
          <nav className="hidden items-center gap-2 md:flex">
            <AppLink href="/client" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5f5363] hover:bg-white">
              تجربة العميل
            </AppLink>
            <AppLink href="/manager" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5f5363] hover:bg-white">
              لوحة المدير
            </AppLink>
            <AppLink href="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5f5363] hover:bg-white">
              إدارة المنصة
            </AppLink>
          </nav>
          <AppLink href="/auth/login" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#211829] px-4 text-sm font-semibold text-white">
            دخول علي
            <LogIn size={16} />
          </AppLink>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
        <div className="rounded-lg border border-[#2f2538] bg-[#15111b] p-5 text-white shadow-[0_24px_90px_rgba(33,24,41,0.22)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="text-sm font-semibold text-[#f5c8bf]">{salon.arabicName}</p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
                نظام واحد للحجز، الإدارة، العملاء، والواتساب.
              </h1>
            </div>
            <StatusPill status="جاهز للاختبار" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dashboardStats.slice(0, 3).map((stat, index) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-medium text-white/60">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                <p className={cx("mt-1 text-xs font-semibold", index === 2 ? "text-[#f2c56b]" : "text-[#8fd39e]")}>{stat.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white">
            <div className="grid min-w-[720px] grid-cols-[130px_repeat(5,1fr)] text-[#211829]">
              <div className="border-b border-[#eadfdd] p-3 text-sm font-semibold">اليوم</div>
              {["10:00", "11:30", "13:00", "15:30", "17:00"].map((hour) => (
                <div key={hour} className="border-b border-r border-[#eadfdd] p-3 text-center text-xs font-semibold text-[#7f7482]">
                  {hour}
                </div>
              ))}
              {staffMembers.slice(0, 4).map((staff, staffIndex) => (
                <div key={staff.id} className="contents">
                  <div className="flex items-center gap-2 border-b border-[#f0e7e4] p-3">
                    <Avatar initials={staff.initials} />
                    <div>
                      <p className="text-sm font-semibold">{staff.name}</p>
                      <p className="text-xs text-[#7f7482]">{staff.role}</p>
                    </div>
                  </div>
                  {Array.from({ length: 5 }).map((_, slotIndex) => {
                    const isBooked = (slotIndex + staffIndex) % 2 === 0;
                    return (
                      <div key={`${staff.id}-${slotIndex}`} className="border-b border-r border-[#f0e7e4] p-2">
                        <div className={cx("h-11 rounded-md px-2 py-1 text-xs", isBooked ? "bg-[#f4d7d5] text-[#713f42]" : "bg-[#f8f5f3] text-[#9a8d95]")}>
                          {isBooked ? bookings[(slotIndex + staffIndex) % bookings.length].service : "متاح"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#b87776]">اختبار سريع</p>
                <h2 className="mt-2 text-2xl font-semibold">ادخل بحساب علي أو جرّب رحلة العميل مباشرة.</h2>
              </div>
              <ShieldCheck className="text-[#8f9d84]" size={28} />
            </div>
            <div className="mt-5 grid gap-3 rounded-lg border border-[#eadfdd] bg-[#fbf7f6] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#7f7482]">البريد</span>
                <strong dir="ltr">{demoOwner.email}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7f7482]">كلمة المرور</span>
                <strong dir="ltr">{demoOwner.password}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#7f7482]">OTP التجريبي</span>
                <strong dir="ltr">{demoOwner.otp}</strong>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <AppLink href="/client" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#211829] px-4 text-sm font-semibold text-white">
                تجربة العميل
                <ArrowLeft size={17} />
              </AppLink>
              <AppLink href="/manager" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#eadfdd] bg-white px-4 text-sm font-semibold text-[#211829]">
                لوحة المدير
                <Gauge size={17} />
              </AppLink>
            </div>
          </Panel>

          <Panel title="حالة الربط">
            <div className="grid gap-3 p-5">
              <div className="flex items-center justify-between rounded-lg border border-[#d7e7dc] bg-[#f1faf3] p-4">
                <div>
                  <p className="font-semibold text-[#17733a]">النظام يعمل بوضع تجريبي</p>
                  <p className="mt-1 text-sm text-[#57725d]">كل الصفحات قابلة للتنقل والاختبار بدون Supabase حقيقي.</p>
                </div>
                <CheckCircle2 className="text-[#17733a]" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#f0dfb8] bg-[#fff8e7] p-4">
                <div>
                  <p className="font-semibold text-[#7d5a10]">واتساب غير مربوط برقم حقيقي بعد</p>
                  <p className="mt-1 text-sm text-[#846d3d]">يتطلب مفاتيح Meta Cloud API وPhone Number ID.</p>
                </div>
                <MessageCircle className="text-[#a26a00]" />
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

export function ClientExperience() {
  const [serviceId, setServiceId] = useState(services[0].id);
  const [staffId, setStaffId] = useState(services[0].staff[0]);
  const [dateIndex, setDateIndex] = useState(0);
  const [slot, setSlot] = useState(timeSlots[2]);
  const [phone, setPhone] = useState("+966 50 123 4567");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("اختاري الخدمة والموعد ثم أكدي رمز التحقق.");

  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];
  const availableStaff = staffMembers.filter((staff) => selectedService.staff.includes(staff.id));
  const selectedStaff = availableStaff.find((staff) => staff.id === staffId) ?? availableStaff[0] ?? staffMembers[0];
  const vat = Math.round(selectedService.price * (salon.vatPercent / 100));
  const total = selectedService.price + vat;
  const phoneReady = normalizeDigits(phone).replace(/\D/g, "").length >= 8;
  const otpReady = normalizeDigits(otp) === demoOwner.otp;

  function chooseService(id: string) {
    const nextService = services.find((service) => service.id === id) ?? services[0];
    setServiceId(nextService.id);
    setStaffId(nextService.staff[0]);
    setConfirmed(false);
    setNotice("تم تحديث الخدمة. اختاري الوقت المناسب ثم أرسلي رمز التحقق.");
  }

  function sendOtp() {
    if (!phoneReady) {
      setNotice("أدخلي رقم جوال صحيح قبل إرسال الرمز.");
      return;
    }
    setOtpSent(true);
    setNotice(`تم إرسال رمز تجريبي ${demoOwner.otp}. الربط الحقيقي يحتاج WhatsApp Cloud API.`);
  }

  function confirmBooking() {
    if (!otpReady) {
      setNotice("رمز التحقق غير صحيح. استخدم 123123 أو ١٢٣١٢٣ للاختبار.");
      return;
    }
    setConfirmed(true);
    setNotice("تم تثبيت الحجز التجريبي وإضافة الموعد لحساب العميل.");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f5f3] text-[#211829]">
      <header className="border-b border-[#eadfdd] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <AppLink href={`/${salon.slug}/profile`} className="hidden rounded-lg border border-[#eadfdd] px-3 py-2 text-sm font-semibold text-[#211829] sm:inline-flex">
              حسابي
            </AppLink>
            <AppLink href="/manager" className="rounded-lg bg-[#211829] px-3 py-2 text-sm font-semibold text-white">
              المدير
            </AppLink>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <Panel className="overflow-hidden">
            <div className="border-b border-[#eadfdd] bg-[#211829] p-5 text-white">
              <p className="text-sm font-semibold text-[#f5c8bf]">{salon.arabicName} - {salon.district}</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">احجزي موعدك وتابعي رصيد الولاء من نفس الصفحة.</h1>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {["الخدمة", "الموظفة", "التاريخ والوقت", "التأكيد"].map((step, index) => (
                  <div key={step} className={cx("rounded-lg border px-3 py-2 text-sm", index === 0 || confirmed ? "border-[#f5c8bf] bg-white/10" : "border-white/10 bg-white/[0.04]")}>
                    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#211829]">{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">اختاري الخدمة</h2>
                  <StatusPill status={selectedService.category} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {services.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => chooseService(service.id)}
                      className={cx(
                        "rounded-lg border p-4 text-right transition",
                        selectedService.id === service.id
                          ? "border-[#d88782] bg-[#fff7f6] shadow-[0_14px_34px_rgba(216,135,130,0.13)]"
                          : "border-[#eadfdd] bg-white hover:border-[#d8c7c3]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="mt-1 text-sm text-[#7f7482]">{service.duration} مع {service.specialist}</p>
                        </div>
                        {selectedService.id === service.id ? <CheckCircle2 className="text-[#d88782]" size={20} /> : <ChevronLeft className="text-[#9b8e98]" size={18} />}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold">{money(service.price)}</span>
                        <span className="text-[#7f7482]">عربون {money(service.deposit)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="rounded-lg border border-[#eadfdd] bg-[#fbf7f6] p-4">
                <h3 className="font-semibold">ملخص الحجز</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7f7482]">الخدمة</span>
                    <strong>{selectedService.name}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7f7482]">الموظفة</span>
                    <strong>{selectedStaff.name}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7f7482]">الموعد</span>
                    <strong>{dateOptions[dateIndex]} - {slot}</strong>
                  </div>
                  <div className="border-t border-[#eadfdd] pt-3">
                    <div className="flex justify-between">
                      <span>الخدمة</span>
                      <strong>{money(selectedService.price)}</strong>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span>الضريبة</span>
                      <strong>{money(vat)}</strong>
                    </div>
                    <div className="mt-2 flex justify-between text-base">
                      <span>المطلوب الآن</span>
                      <strong>{money(selectedService.deposit)}</strong>
                    </div>
                    <p className="mt-2 text-xs text-[#7f7482]">المتبقي عند زيارة الصالون: {money(total - selectedService.deposit)}</p>
                  </div>
                </div>
              </aside>
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="الموظفة والتاريخ">
              <div className="grid gap-4 p-5">
                <div className="grid gap-2">
                  {availableStaff.map((staff) => (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => setStaffId(staff.id)}
                      className={cx("flex items-center justify-between rounded-lg border p-3 text-right", selectedStaff.id === staff.id ? "border-[#d88782] bg-[#fff7f6]" : "border-[#eadfdd] bg-white")}
                    >
                      <span className="flex items-center gap-3">
                        <Avatar initials={staff.initials} />
                        <span>
                          <span className="block font-semibold">{staff.name}</span>
                          <span className="text-sm text-[#7f7482]">{staff.role} - تقييم {staff.rating}</span>
                        </span>
                      </span>
                      <StatusPill status={staff.status} />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dateOptions.map((date, index) => (
                    <button
                      type="button"
                      key={date}
                      onClick={() => setDateIndex(index)}
                      className={cx("rounded-lg border px-3 py-3 text-sm font-semibold", dateIndex === index ? "border-[#211829] bg-[#211829] text-white" : "border-[#eadfdd] bg-white text-[#211829]")}
                    >
                      {date}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSlot(time)}
                      className={cx("rounded-lg border px-3 py-3 text-sm font-semibold", slot === time ? "border-[#d88782] bg-[#fff0ef] text-[#a94c47]" : "border-[#eadfdd] bg-white text-[#211829]")}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="التحقق والتأكيد">
              <div className="grid gap-4 p-5">
                <label className="grid gap-2 text-sm font-semibold">
                  رقم الجوال
                  <input
                    dir="ltr"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 text-right font-semibold outline-none focus:border-[#d88782]"
                  />
                </label>
                <ActionButton icon={Send} variant="outline" onClick={sendOtp} disabled={!phoneReady}>
                  إرسال رمز التحقق
                </ActionButton>
                <label className="grid gap-2 text-sm font-semibold">
                  رمز التحقق
                  <input
                    dir="ltr"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="123123"
                    className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 text-center text-lg font-semibold tracking-normal outline-none focus:border-[#d88782]"
                  />
                </label>
                <ActionButton icon={CheckCircle2} variant="dark" onClick={confirmBooking} disabled={!otpSent}>
                  تأكيد الحجز
                </ActionButton>
                <div className={cx("rounded-lg border p-4 text-sm", confirmed ? "border-[#cfe5d2] bg-[#edf8ef] text-[#17733a]" : "border-[#f0dfb8] bg-[#fff8e7] text-[#7d5a10]")}>
                  {notice}
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <aside className="grid gap-5">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#b87776]">حساب العميل</p>
                <h2 className="mt-1 text-xl font-semibold">أهلا أفنان</h2>
              </div>
              <Avatar initials="أ" />
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-lg border border-[#eadfdd] bg-[#fbf7f6] p-4">
                <p className="text-sm text-[#7f7482]">الموعد القادم</p>
                <p className="mt-2 font-semibold">{selectedService.name}</p>
                <p className="mt-1 text-sm text-[#7f7482]">{dateOptions[dateIndex]} - {slot}</p>
              </div>
              <div className="rounded-lg border border-[#eadfdd] bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">نقاط الولاء</span>
                  <Gem className="text-[#b87776]" size={18} />
                </div>
                <p className="mt-3 text-3xl font-semibold">1,250</p>
                <ProgressBar value={72} tone="bg-[#b87776]" />
                <p className="mt-2 text-xs text-[#7f7482]">باقي 250 نقطة للوصول لمكافأة ذهبية.</p>
              </div>
              <AppLink href={`/${salon.slug}/profile`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#eadfdd] bg-white px-4 text-sm font-semibold text-[#211829]">
                فتح حساب العميل
                <ArrowLeft size={16} />
              </AppLink>
            </div>
          </Panel>

          {confirmed && (
            <Panel className="border-[#cfe5d2] bg-[#f6fff7] p-5">
              <CheckCircle2 className="text-[#17733a]" />
              <h3 className="mt-3 text-lg font-semibold text-[#17733a]">تم تأكيد الحجز</h3>
              <p className="mt-2 text-sm text-[#57725d]">رقم الحجز B-NEW-01. ستظهر الرسالة في لوحة المدير وملف العميل.</p>
            </Panel>
          )}
        </aside>
      </section>
    </main>
  );
}

export function ClientProfileExperience() {
  const customer = customers[0];

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f5f3] text-[#211829]">
      <header className="border-b border-[#eadfdd] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/client" className="rounded-lg bg-[#211829] px-4 py-2 text-sm font-semibold text-white">
            حجز جديد
          </AppLink>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr]">
        <Panel className="p-5">
          <Avatar initials="س" />
          <h1 className="mt-4 text-2xl font-semibold">{customer.name}</h1>
          <p className="mt-1 text-sm text-[#7f7482]" dir="ltr">{customer.phone}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#fbf7f6] p-4">
              <p className="text-sm text-[#7f7482]">المستوى</p>
              <p className="mt-1 font-semibold">{customer.tier}</p>
            </div>
            <div className="rounded-lg bg-[#fbf7f6] p-4">
              <p className="text-sm text-[#7f7482]">الزيارات</p>
              <p className="mt-1 font-semibold">{customer.visits}</p>
            </div>
          </div>
        </Panel>
        <div className="grid gap-5">
          <Panel title="موعدك القادم">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-lg border border-[#eadfdd] p-4">
                <p className="text-sm text-[#7f7482]">الخدمة</p>
                <p className="mt-2 font-semibold">صبغة شعر احترافية</p>
              </div>
              <div className="rounded-lg border border-[#eadfdd] p-4">
                <p className="text-sm text-[#7f7482]">الموعد</p>
                <p className="mt-2 font-semibold">الأحد 18 مايو - 16:30</p>
              </div>
              <div className="rounded-lg border border-[#eadfdd] p-4">
                <p className="text-sm text-[#7f7482]">الحالة</p>
                <div className="mt-2"><StatusPill status="مؤكد" /></div>
              </div>
            </div>
          </Panel>
          <Panel title="الولاء والمحفظة">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              {loyaltyRows.map((row) => (
                <div key={row.tier} className="rounded-lg border border-[#eadfdd] p-4">
                  <p className="font-semibold">{row.tier}</p>
                  <p className="mt-2 text-3xl font-semibold">{row.points}</p>
                  <p className="mt-2 text-sm text-[#7f7482]">{row.reward}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

export function ManagerDashboard() {
  return <DashboardShell page="dashboard" managerMode />;
}

export function DashboardShell({ page, managerMode = false }: { page: DashboardPage; managerMode?: boolean }) {
  const [statuses, setStatuses] = useState<Record<string, BookingStatus>>(
    Object.fromEntries(bookings.map((booking) => [booking.id, booking.status as BookingStatus])),
  );
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [actionLog, setActionLog] = useState("جاهز: كل العمليات هنا تعمل محليا للتجربة.");
  const [settingsDraft, setSettingsDraft] = useState({
    salonName: salon.arabicName,
    depositPercent: salon.depositPercent,
    hours: salon.hours,
    branch: salon.district,
  });

  const meta = pageMeta[page] ?? pageMeta.dashboard;

  function logAction(message: string) {
    setActionLog(message);
  }

  function setBookingStatus(id: string, status: BookingStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
    setActionLog(`تم تحديث الحجز ${id} إلى "${status}".`);
  }

  const context: DashboardContext = {
    statuses,
    setBookingStatus,
    statusFilter,
    setStatusFilter,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedServiceId,
    setSelectedServiceId,
    actionLog,
    logAction,
    settingsDraft,
    setSettingsDraft,
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f5f3] text-[#211829]">
      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden w-[282px] shrink-0 border-l border-[#32283b] bg-[#15111b] text-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col p-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5c8bf] text-[#211829]">
                  <Crown size={21} />
                </div>
                <div>
                  <p className="font-semibold">Saloni Pro</p>
                  <p className="text-xs text-white/55">مركز التشغيل</p>
                </div>
              </div>
              <StatusPill status="Live" />
            </div>

            <nav className="mt-5 grid gap-1 overflow-y-auto pl-1">
              {dashboardNav.map((item) => {
                const Icon = item.icon;
                const active = item.page === page;
                return (
                  <AppLink
                    key={item.page}
                    href={item.href}
                    className={cx(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
                      active ? "bg-[#f5c8bf] text-[#211829]" : "text-white/70 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </AppLink>
                );
              })}
            </nav>

            <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm">
              <p className="font-semibold text-[#f5c8bf]">حساب الاختبار</p>
              <p className="mt-2 text-white/70" dir="ltr">{demoOwner.email}</p>
              <p className="mt-1 text-white/70">كلمة المرور: {demoOwner.password}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#eadfdd] bg-[#f8f5f3]/92 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3 lg:hidden">
                <BrandMark compact />
                <strong>Saloni Pro</strong>
              </div>
              <div className="hidden min-w-[280px] items-center gap-2 rounded-lg border border-[#eadfdd] bg-white px-3 py-2 text-sm text-[#7f7482] lg:flex">
                <Search size={16} />
                <span>بحث سريع عن حجز، عميلة، خدمة...</span>
              </div>
              <div className="flex items-center gap-2">
                <AppLink href="/client" className="rounded-lg border border-[#eadfdd] bg-white px-3 py-2 text-sm font-semibold text-[#211829]">
                  تجربة العميل
                </AppLink>
                <AppLink href="/auth/login" className="rounded-lg bg-[#211829] px-3 py-2 text-sm font-semibold text-white">
                  دخول
                </AppLink>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
              {dashboardNav.map((item) => {
                const active = item.page === page;
                return (
                  <AppLink
                    key={item.page}
                    href={item.href}
                    className={cx(
                      "shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold",
                      active ? "border-[#211829] bg-[#211829] text-white" : "border-[#eadfdd] bg-white text-[#211829]",
                    )}
                  >
                    {item.label}
                  </AppLink>
                );
              })}
            </nav>
          </header>

          <div className="px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#b87776]">{managerMode ? "صفحة المدير" : "مركز التشغيل"}</p>
                <h1 className="mt-1 text-2xl font-semibold sm:text-4xl">{meta.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7f7482]">{meta.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={Plus} variant="dark" onClick={() => logAction("تم فتح إجراء حجز جديد تجريبيا.")}>
                  حجز جديد
                </ActionButton>
                <ActionButton icon={Send} variant="light" onClick={() => logAction("تم تجهيز رسالة واتساب تجريبية للعميلة المحددة.")}>
                  رسالة واتساب
                </ActionButton>
              </div>
            </div>

            <div className="mb-5 rounded-lg border border-[#eadfdd] bg-white px-4 py-3 text-sm text-[#5f5363]">
              <span className="font-semibold text-[#211829]">آخر إجراء:</span> {actionLog}
            </div>

            {renderDashboardPage(page, context)}
          </div>
        </section>
      </div>
    </main>
  );
}

function renderDashboardPage(page: DashboardPage, context: DashboardContext) {
  switch (page) {
    case "bookings":
      return <BookingsPage context={context} />;
    case "calendar":
      return <CalendarPage context={context} />;
    case "customers":
      return <CustomersPage context={context} />;
    case "services":
      return <ServicesPage context={context} />;
    case "staff":
      return <StaffPage context={context} />;
    case "reports":
      return <ReportsPage context={context} />;
    case "loyalty":
      return <LoyaltyPage context={context} />;
    case "coupons":
      return <CouponsPage context={context} />;
    case "whatsapp":
      return <WhatsappPage context={context} />;
    case "settings":
      return <SettingsPage context={context} />;
    default:
      return <CommandCenterPage context={context} />;
  }
}

function CommandCenterPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat, index) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            icon={[CalendarDays, ReceiptText, Gauge, UsersRound, MessageCircle][index] ?? Sparkles}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="جدول اليوم">
          <div className="overflow-x-auto p-5">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[110px_repeat(5,1fr)] border-b border-[#eadfdd] text-xs font-semibold text-[#7f7482]">
                <div className="p-3">الفترة</div>
                {timeSlots.slice(0, 5).map((slot) => <div key={slot} className="border-r border-[#eadfdd] p-3 text-center">{slot}</div>)}
              </div>
              {staffMembers.slice(0, 4).map((staff, rowIndex) => (
                <div key={staff.id} className="grid grid-cols-[110px_repeat(5,1fr)] border-b border-[#f0e7e4]">
                  <div className="flex items-center gap-2 p-3">
                    <Avatar initials={staff.initials} />
                    <span className="text-sm font-semibold">{staff.name.split(" ")[0]}</span>
                  </div>
                  {timeSlots.slice(0, 5).map((slot, slotIndex) => {
                    const booked = (rowIndex + slotIndex) % 2 === 0;
                    return (
                      <div key={`${staff.id}-${slot}`} className="border-r border-[#f0e7e4] p-2">
                        <div className={cx("min-h-12 rounded-md px-3 py-2 text-xs font-semibold", booked ? "bg-[#f4d7d5] text-[#713f42]" : "bg-[#f8f5f3] text-[#948894]")}>
                          {booked ? bookings[(rowIndex + slotIndex) % bookings.length].service : "متاح"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="حمل الفريق">
          <div className="grid gap-4 p-5">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="rounded-lg border border-[#eadfdd] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={staff.initials} />
                    <div>
                      <p className="font-semibold">{staff.name}</p>
                      <p className="text-sm text-[#7f7482]">{staff.next}</p>
                    </div>
                  </div>
                  <strong>{staff.load}%</strong>
                </div>
                <div className="mt-3"><ProgressBar value={staff.load} tone="bg-[#8f9d84]" /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="أحدث الحجوزات" action={<AppLink href="/dashboard/bookings" className="text-sm font-semibold text-[#b87776]">عرض الكل</AppLink>}>
          <BookingTable context={context} compact />
        </Panel>
        <WhatsappSummary context={context} />
      </div>
    </div>
  );
}

function BookingsPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {bookingFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => context.setStatusFilter(filter)}
            className={cx("rounded-lg border px-4 py-2 text-sm font-semibold", context.statusFilter === filter ? "border-[#211829] bg-[#211829] text-white" : "border-[#eadfdd] bg-white text-[#211829]")}
          >
            {filter}
          </button>
        ))}
      </div>
      <Panel title="إدارة الحجوزات">
        <BookingTable context={context} />
      </Panel>
    </div>
  );
}

function BookingTable({ context, compact = false }: { context: DashboardContext; compact?: boolean }) {
  const visibleBookings = bookings.filter((booking) => context.statusFilter === "الكل" || context.statuses[booking.id] === context.statusFilter);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#eadfdd] bg-[#fbf7f6] text-[#7f7482]">
            {["الوقت", "العميلة", "الخدمة", "الموظفة", "الدفع", "الحالة", compact ? "المصدر" : "إجراءات"].map((head) => (
              <th key={head} className="px-4 py-3 text-right font-semibold">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleBookings.map((booking) => {
            const status = context.statuses[booking.id];
            return (
              <tr key={booking.id} className="border-b border-[#f0e7e4]">
                <td className="px-4 py-4 font-semibold">{booking.time}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold">{booking.client}</p>
                  <p className="text-xs text-[#7f7482]" dir="ltr">{booking.phone}</p>
                </td>
                <td className="px-4 py-4">{booking.service}</td>
                <td className="px-4 py-4">{booking.staff}</td>
                <td className="px-4 py-4">{booking.payment}</td>
                <td className="px-4 py-4"><StatusPill status={status} /></td>
                <td className="px-4 py-4">
                  {compact ? (
                    booking.source
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "مؤكد")} className="rounded-md border border-[#cfe5d2] px-2 py-1 text-xs font-semibold text-[#17733a]">تأكيد</button>
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "وصلت")} className="rounded-md border border-[#dcd4ff] px-2 py-1 text-xs font-semibold text-[#6550b9]">وصلت</button>
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "ملغي")} className="rounded-md border border-[#f2c9c5] px-2 py-1 text-xs font-semibold text-[#b93f34]">إلغاء</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CalendarPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5">
      <Panel title="تقويم الفريق" action={<ActionButton icon={CalendarDays} variant="outline" onClick={() => context.logAction("تم تبديل عرض التقويم إلى أسبوع العمل.")}>عرض الأسبوع</ActionButton>}>
        <div className="overflow-x-auto p-5">
          <div className="min-w-[900px] rounded-lg border border-[#eadfdd]">
            <div className="grid grid-cols-[90px_repeat(4,1fr)] bg-[#fbf7f6] text-sm font-semibold text-[#7f7482]">
              <div className="p-3">الوقت</div>
              {staffMembers.slice(0, 4).map((staff) => <div key={staff.id} className="border-r border-[#eadfdd] p-3">{staff.name}</div>)}
            </div>
            {calendarPlan.map((row) => (
              <div key={row.hour} className="grid grid-cols-[90px_repeat(4,1fr)] border-t border-[#eadfdd] text-sm">
                <div className="p-3 font-semibold">{row.hour}</div>
                {[row.noura, row.sarah, row.reem, row.hind].map((cell, index) => (
                  <div key={`${row.hour}-${index}`} className="border-r border-[#f0e7e4] p-2">
                    <button
                      type="button"
                      onClick={() => context.logAction(`تم اختيار خانة ${cell} الساعة ${row.hour}.`)}
                      className={cx("min-h-12 w-full rounded-md px-3 py-2 text-right", cell === "متاح" ? "bg-[#f8f5f3] text-[#948894]" : "bg-[#fff0ef] text-[#713f42]")}
                    >
                      {cell}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function CustomersPage({ context }: { context: DashboardContext }) {
  const selectedCustomer = customers.find((customer) => customer.id === context.selectedCustomerId) ?? customers[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Panel title="قائمة العملاء">
        <div className="grid gap-2 p-4">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => context.setSelectedCustomerId(customer.id)}
              className={cx("rounded-lg border p-4 text-right transition", selectedCustomer.id === customer.id ? "border-[#d88782] bg-[#fff7f6]" : "border-[#eadfdd] bg-white hover:border-[#d8c7c3]")}
            >
              <div className="flex items-center justify-between">
                <strong>{customer.name}</strong>
                <StatusPill status={customer.tier} />
              </div>
              <p className="mt-1 text-sm text-[#7f7482]" dir="ltr">{customer.phone}</p>
              <p className="mt-2 text-sm text-[#5f5363]">{customer.nextAction}</p>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="ملف العميل">
        <div className="grid gap-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{selectedCustomer.name}</h2>
              <p className="mt-1 text-sm text-[#7f7482]" dir="ltr">{selectedCustomer.phone}</p>
            </div>
            <ActionButton icon={MessageCircle} variant="green" onClick={() => context.logAction(`تم تجهيز رسالة متابعة إلى ${selectedCustomer.name}.`)}>
              رسالة متابعة
            </ActionButton>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <MiniStat label="الإنفاق" value={selectedCustomer.spend} />
            <MiniStat label="النقاط" value={String(selectedCustomer.points)} />
            <MiniStat label="الزيارات" value={String(selectedCustomer.visits)} />
            <MiniStat label="آخر زيارة" value={selectedCustomer.last} />
          </div>
          <div className="rounded-lg border border-[#eadfdd] bg-[#fbf7f6] p-4">
            <p className="font-semibold">ملاحظات تشغيلية</p>
            <p className="mt-2 text-sm leading-6 text-[#5f5363]">تفضيلات العميلة محفوظة للفريق، وتظهر قبل الموعد لتجهيز الخدمة بدون سؤال متكرر.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCustomer.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6f6571]">{tag}</span>)}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ServicesPage({ context }: { context: DashboardContext }) {
  const selectedService = services.find((service) => service.id === context.selectedServiceId) ?? services[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => context.setSelectedServiceId(service.id)}
            className={cx("rounded-lg border bg-white p-5 text-right shadow-sm transition", selectedService.id === service.id ? "border-[#d88782]" : "border-[#eadfdd] hover:border-[#d8c7c3]")}
          >
            <div className="flex items-start justify-between">
              <div>
                <StatusPill status={service.status} />
                <h2 className="mt-3 text-lg font-semibold">{service.name}</h2>
                <p className="mt-1 text-sm text-[#7f7482]">{service.category} - {service.duration}</p>
              </div>
              <p className="text-xl font-semibold">{money(service.price)}</p>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-[#7f7482]">
                <span>الطلب</span>
                <span>{service.demand}%</span>
              </div>
              <div className="mt-2"><ProgressBar value={service.demand} tone="bg-[#d88782]" /></div>
            </div>
          </button>
        ))}
      </div>
      <Panel title="تعديل الخدمة">
        <div className="grid gap-4 p-5">
          <label className="grid gap-2 text-sm font-semibold">
            اسم الخدمة
            <input value={selectedService.name} readOnly className="h-11 rounded-lg border border-[#eadfdd] bg-[#fbf7f6] px-3" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            السعر
            <input value={money(selectedService.price)} readOnly className="h-11 rounded-lg border border-[#eadfdd] bg-[#fbf7f6] px-3" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            العربون
            <input value={money(selectedService.deposit)} readOnly className="h-11 rounded-lg border border-[#eadfdd] bg-[#fbf7f6] px-3" />
          </label>
          <ActionButton icon={CheckCircle2} variant="dark" onClick={() => context.logAction(`تم حفظ إعدادات ${selectedService.name} تجريبيا.`)}>
            حفظ الخدمة
          </ActionButton>
        </div>
      </Panel>
    </div>
  );
}

function StaffPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {staffMembers.map((staff) => (
          <Panel key={staff.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={staff.initials} />
                <div>
                  <h2 className="font-semibold">{staff.name}</h2>
                  <p className="text-sm text-[#7f7482]">{staff.role}</p>
                </div>
              </div>
              <StatusPill status={staff.status} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <MiniStat label="حجوزات" value={String(staff.bookings)} />
              <MiniStat label="إيراد" value={money(staff.revenue)} />
              <MiniStat label="تقييم" value={staff.rating} />
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#7f7482]">الإشغال</span>
                <strong>{staff.load}%</strong>
              </div>
              <div className="mt-2"><ProgressBar value={staff.load} tone="bg-[#8f9d84]" /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {staff.skills.map((skill) => <span key={skill} className="rounded-full bg-[#fbf7f6] px-3 py-1 text-xs font-semibold text-[#6f6571]">{skill}</span>)}
            </div>
            <ActionButton icon={CalendarDays} variant="outline" onClick={() => context.logAction(`تم فتح جدول ${staff.name}.`)}>
              عرض الجدول
            </ActionButton>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ReportsPage({ context }: { context: DashboardContext }) {
  const maxRevenue = Math.max(...weeklyRevenue.map((item) => item.revenue));

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
          <Panel key={metric.label} className="p-5">
            <p className="text-sm text-[#7f7482]">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#36854c]">{metric.change}</p>
            <div className="mt-4"><ProgressBar value={metric.progress} tone="bg-[#211829]" /></div>
          </Panel>
        ))}
      </div>
      <Panel title="إيراد الأسبوع" action={<ActionButton icon={ReceiptText} variant="outline" onClick={() => context.logAction("تم تجهيز تقرير الأسبوع للتصدير CSV.")}>تصدير</ActionButton>}>
        <div className="grid gap-4 p-5">
          {weeklyRevenue.map((day) => (
            <div key={day.day} className="grid grid-cols-[90px_1fr_110px] items-center gap-3">
              <span className="text-sm font-semibold">{day.day}</span>
              <div className="h-10 rounded-lg bg-[#fbf7f6]">
                <div className="flex h-full items-center rounded-lg bg-[#d88782] px-3 text-xs font-semibold text-white" style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}>
                  {day.bookings} حجز
                </div>
              </div>
              <strong>{money(day.revenue)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function LoyaltyPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {loyaltyRows.map((row) => (
          <Panel key={row.tier} className="p-5">
            <div className={cx("flex h-12 w-12 items-center justify-center rounded-lg text-white", row.color)}>
              <Gem size={22} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{row.tier}</h2>
            <p className="mt-1 text-sm text-[#7f7482]">{row.customers} عميلة</p>
            <p className="mt-4 text-2xl font-semibold">{row.points}</p>
            <p className="mt-2 text-sm text-[#5f5363]">{row.reward}</p>
            <ActionButton icon={Gift} variant="outline" onClick={() => context.logAction(`تم تحديث مكافآت مستوى ${row.tier}.`)}>
              إدارة المكافآت
            </ActionButton>
          </Panel>
        ))}
      </div>
      <Panel title="سجل النقاط">
        <div className="grid gap-3 p-5">
          {customers.map((customer) => (
            <div key={customer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#eadfdd] p-4">
              <div>
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-[#7f7482]">{customer.tier} - {customer.visits} زيارة</p>
              </div>
              <strong>{customer.points} نقطة</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CouponsPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {coupons.map((coupon) => (
        <Panel key={coupon.code} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusPill status={coupon.status} />
              <h2 className="mt-3 text-xl font-semibold">{coupon.title}</h2>
              <p className="mt-1 text-sm text-[#7f7482]">{coupon.audience}</p>
            </div>
            <div className="rounded-lg bg-[#211829] px-3 py-2 text-sm font-semibold text-white">{coupon.code}</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="الخصم" value={coupon.discount} />
            <MiniStat label="الاستخدام" value={String(coupon.used)} />
            <MiniStat label="الإيراد" value={coupon.revenue} />
          </div>
          <ActionButton icon={Send} variant="outline" onClick={() => context.logAction(`تم تجهيز حملة ${coupon.code} للإرسال.`)}>
            إرسال للجمهور
          </ActionButton>
        </Panel>
      ))}
    </div>
  );
}

function WhatsappPage({ context }: { context: DashboardContext }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel title="حالة الربط">
        <div className="grid gap-4 p-5">
          <div className="rounded-lg border border-[#f0dfb8] bg-[#fff8e7] p-4">
            <p className="font-semibold text-[#7d5a10]">وضع تجريبي</p>
            <p className="mt-2 text-sm leading-6 text-[#846d3d]">
              رموز التحقق والحملات تظهر في النظام، لكن الإرسال من رقم حقيقي يحتاج مفاتيح Meta WhatsApp Business Cloud API.
            </p>
          </div>
          <div className="rounded-lg border border-[#eadfdd] p-4">
            <p className="text-sm text-[#7f7482]">المرسل</p>
            <p className="mt-2 font-semibold">{whatsappStatus.sender}</p>
          </div>
          <div className="grid gap-2">
            {whatsappStatus.requiredEnv.map((env) => (
              <div key={env} className="flex items-center justify-between rounded-lg border border-[#eadfdd] bg-[#fbf7f6] px-3 py-2 text-sm">
                <span dir="ltr">{env}</span>
                <StatusPill status="مطلوب" />
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel title="القوالب">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {whatsappTemplates.map((template) => (
              <div key={template.name} className="rounded-lg border border-[#eadfdd] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{template.name}</h2>
                  <StatusPill status={template.status} />
                </div>
                <p className="mt-2 text-xs font-semibold text-[#b87776]">{template.type}</p>
                <p className="mt-3 rounded-lg bg-[#fbf7f6] p-3 text-sm text-[#5f5363]">{template.sample}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="الحملات النشطة" action={<ActionButton icon={Plus} variant="dark" onClick={() => context.logAction("تم إنشاء مسودة حملة واتساب جديدة.")}>حملة جديدة</ActionButton>}>
          <div className="grid gap-3 p-5">
            {campaigns.map((campaign) => (
              <div key={campaign.title} className="grid gap-3 rounded-lg border border-[#eadfdd] p-4 md:grid-cols-[1fr_repeat(4,110px)]">
                <div>
                  <p className="font-semibold">{campaign.title}</p>
                  <p className="mt-1 text-sm text-[#7f7482]">{campaign.channel} - {campaign.status}</p>
                </div>
                <MiniStat label="إرسال" value={String(campaign.sent)} />
                <MiniStat label="وصل" value={String(campaign.delivered)} />
                <MiniStat label="ردود" value={String(campaign.replies)} />
                <MiniStat label="الأثر" value={campaign.revenue} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsPage({ context }: { context: DashboardContext }) {
  const draft = context.settingsDraft;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="إعدادات الصالون">
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            اسم الصالون
            <input
              value={draft.salonName}
              onChange={(event) => context.setSettingsDraft({ ...draft, salonName: event.target.value })}
              className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 outline-none focus:border-[#d88782]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            الفرع
            <input
              value={draft.branch}
              onChange={(event) => context.setSettingsDraft({ ...draft, branch: event.target.value })}
              className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 outline-none focus:border-[#d88782]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            ساعات العمل
            <input
              value={draft.hours}
              onChange={(event) => context.setSettingsDraft({ ...draft, hours: event.target.value })}
              className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 outline-none focus:border-[#d88782]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            نسبة العربون
            <input
              type="number"
              value={draft.depositPercent}
              onChange={(event) => context.setSettingsDraft({ ...draft, depositPercent: Number(event.target.value) })}
              className="h-11 rounded-lg border border-[#eadfdd] bg-white px-3 outline-none focus:border-[#d88782]"
            />
          </label>
          <div className="md:col-span-2">
            <ActionButton icon={CheckCircle2} variant="dark" onClick={() => context.logAction("تم حفظ إعدادات الصالون محليا للتجربة.")}>
              حفظ الإعدادات
            </ActionButton>
          </div>
        </div>
      </Panel>
      <Panel title="أقسام الإعداد">
        <div className="grid gap-3 p-5">
          {settingsGroups.map((group) => (
            <div key={group.title} className="rounded-lg border border-[#eadfdd] p-4">
              <p className="font-semibold">{group.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => <span key={item} className="rounded-full bg-[#fbf7f6] px-3 py-1 text-xs font-semibold text-[#6f6571]">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function WhatsappSummary({ context }: { context: DashboardContext }) {
  return (
    <Panel title="واتساب">
      <div className="grid gap-4 p-5">
        <div className="flex items-center justify-between rounded-lg border border-[#d7e7dc] bg-[#f1faf3] p-4">
          <div>
            <p className="font-semibold text-[#17733a]">قوالب جاهزة</p>
            <p className="mt-1 text-sm text-[#57725d]">OTP وتذكيرات وحملات ولاء</p>
          </div>
          <MessageCircle className="text-[#17733a]" />
        </div>
        {campaigns.slice(0, 2).map((campaign) => (
          <div key={campaign.title} className="rounded-lg border border-[#eadfdd] p-4">
            <div className="flex items-center justify-between">
              <strong>{campaign.title}</strong>
              <span className="text-sm text-[#7f7482]">{campaign.replies} رد</span>
            </div>
            <div className="mt-3"><ProgressBar value={(campaign.delivered / campaign.sent) * 100} tone="bg-[#8f9d84]" /></div>
          </div>
        ))}
        <ActionButton icon={Send} variant="green" onClick={() => context.logAction("تم تشغيل حملة واتساب تجريبية.")}>
          تشغيل حملة
        </ActionButton>
      </div>
    </Panel>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#eadfdd] bg-white p-3">
      <p className="text-xs font-medium text-[#7f7482]">{label}</p>
      <p className="mt-1 font-semibold text-[#211829]">{value}</p>
    </div>
  );
}

export function LoginExperience() {
  const [email, setEmail] = useState(demoOwner.email);
  const [password, setPassword] = useState(demoOwner.password);
  const [message, setMessage] = useState("استخدم حساب علي للاختبار أو اضغط دخول مباشرة.");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("جار التحقق من بيانات الدخول...");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: normalizeDigits(password) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result?.error ?? "تعذر تسجيل الدخول.");
        return;
      }
      setMessage("تم الدخول بنجاح. جار فتح لوحة التحكم...");
      window.location.href = "/dashboard";
    } catch {
      setMessage("تعذر الاتصال بالخادم، لكن بيانات demo محفوظة في الواجهة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f8f5f3] px-4 py-8 text-[#211829]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><BrandMark /></div>
        <Panel className="p-6">
          <h1 className="text-2xl font-semibold">دخول المدير</h1>
          <p className="mt-2 text-sm text-[#7f7482]">حساب الاختبار جاهز باسم علي.</p>
          <form onSubmit={submitLogin} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              البريد الإلكتروني
              <input dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border border-[#eadfdd] px-3 text-left outline-none focus:border-[#d88782]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              كلمة المرور
              <input dir="ltr" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border border-[#eadfdd] px-3 text-left outline-none focus:border-[#d88782]" />
            </label>
            <ActionButton type="submit" icon={LogIn} variant="dark" disabled={loading}>
              {loading ? "جار الدخول..." : "دخول لوحة التحكم"}
            </ActionButton>
          </form>
          <div className="mt-5 rounded-lg border border-[#eadfdd] bg-[#fbf7f6] p-4 text-sm text-[#5f5363]">{message}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppLink href="/client" className="rounded-lg border border-[#eadfdd] px-3 py-2 text-sm font-semibold">تجربة العميل</AppLink>
            <AppLink href="/dashboard" className="rounded-lg border border-[#eadfdd] px-3 py-2 text-sm font-semibold">لوحة التحكم</AppLink>
          </div>
        </Panel>
      </div>
    </main>
  );
}

export function RegisterExperience() {
  const [created, setCreated] = useState(false);

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f8f5f3] px-4 py-8 text-[#211829]">
      <Panel className="w-full max-w-2xl p-6">
        <BrandMark />
        <h1 className="mt-6 text-3xl font-semibold">إنشاء صالون جديد</h1>
        <p className="mt-2 text-sm text-[#7f7482]">نموذج تجريبي يوضح رحلة التهيئة للمالك قبل ربط Supabase وWhatsApp وميسر.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["بيانات الصالون", "الخدمات والطاقم", "الدفع والعربون", "واتساب والإشعارات"].map((step, index) => (
            <div key={step} className="rounded-lg border border-[#eadfdd] bg-white p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#211829] text-sm font-semibold text-white">{index + 1}</span>
              <p className="mt-3 font-semibold">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <ActionButton icon={CheckCircle2} variant="dark" onClick={() => setCreated(true)}>
            إنشاء نسخة تجريبية
          </ActionButton>
        </div>
        {created && (
          <div className="mt-5 rounded-lg border border-[#cfe5d2] bg-[#edf8ef] p-4 text-sm font-semibold text-[#17733a]">
            تم إنشاء النسخة التجريبية. يمكنك فتح لوحة التحكم الآن.
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <AppLink href="/dashboard" className="rounded-lg bg-[#211829] px-4 py-2 text-sm font-semibold text-white">لوحة التحكم</AppLink>
          <AppLink href="/auth/login" className="rounded-lg border border-[#eadfdd] px-4 py-2 text-sm font-semibold">تسجيل الدخول</AppLink>
        </div>
      </Panel>
    </main>
  );
}

export function StaffExperience() {
  const [checkedIn, setCheckedIn] = useState(false);
  const nextBookings = bookings.filter((booking) => booking.staffId === "noura" || booking.staffId === "sarah").slice(0, 3);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f5f3] text-[#211829]">
      <header className="border-b border-[#eadfdd] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/dashboard/staff" className="rounded-lg bg-[#211829] px-4 py-2 text-sm font-semibold text-white">
            إدارة الفريق
          </AppLink>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr]">
        <Panel className="p-5">
          <Avatar initials="ن" />
          <h1 className="mt-4 text-2xl font-semibold">نورة العتيبي</h1>
          <p className="mt-1 text-sm text-[#7f7482]">خبيرة شعر - جدول اليوم</p>
          <div className="mt-5">
            <ActionButton icon={Clock3} variant={checkedIn ? "green" : "dark"} onClick={() => setCheckedIn((value) => !value)}>
              {checkedIn ? "تم تسجيل الحضور" : "تسجيل الحضور"}
            </ActionButton>
          </div>
        </Panel>
        <Panel title="مواعيدي القادمة">
          <div className="grid gap-3 p-5">
            {nextBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-[#eadfdd] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{booking.client}</p>
                    <p className="mt-1 text-sm text-[#7f7482]">{booking.service} - {booking.time}</p>
                  </div>
                  <StatusPill status={booking.status} />
                </div>
                <p className="mt-3 rounded-lg bg-[#fbf7f6] p-3 text-sm text-[#5f5363]">{booking.notes}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

export function AdminExperience() {
  const tenantRows = [
    { name: "صالوني برو - الرياض", plan: "Premium", status: "نشط", users: 18, health: 98 },
    { name: "فرع جدة التجريبي", plan: "Growth", status: "تهيئة", users: 6, health: 74 },
    { name: "فرع الخبر", plan: "Starter", status: "مراجعة", users: 3, health: 61 },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f5f3] text-[#211829]">
      <header className="border-b border-[#eadfdd] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/dashboard" className="rounded-lg bg-[#211829] px-4 py-2 text-sm font-semibold text-white">
            لوحة الصالون
          </AppLink>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <p className="text-sm font-semibold text-[#b87776]">إدارة المنصة</p>
          <h1 className="mt-1 text-3xl font-semibold">مراقبة الفروع والربط والجاهزية</h1>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Panel title="الفروع">
            <div className="grid gap-3 p-5">
              {tenantRows.map((tenant) => (
                <div key={tenant.name} className="grid gap-3 rounded-lg border border-[#eadfdd] p-4 md:grid-cols-[1fr_120px_120px_160px]">
                  <div>
                    <p className="font-semibold">{tenant.name}</p>
                    <p className="mt-1 text-sm text-[#7f7482]">{tenant.users} مستخدم</p>
                  </div>
                  <MiniStat label="الخطة" value={tenant.plan} />
                  <MiniStat label="الحالة" value={tenant.status} />
                  <div>
                    <div className="flex justify-between text-sm"><span>الصحة</span><strong>{tenant.health}%</strong></div>
                    <div className="mt-2"><ProgressBar value={tenant.health} tone="bg-[#8f9d84]" /></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="بيئة التشغيل">
            <div className="grid gap-3 p-5">
              {["Supabase متصل تجريبيا", "Netlify Production", "WhatsApp يحتاج مفاتيح", "Moyasar جاهز للتهيئة"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-[#eadfdd] p-4">
                  <span className="font-semibold">{item}</span>
                  <ShieldCheck className="text-[#8f9d84]" size={18} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
