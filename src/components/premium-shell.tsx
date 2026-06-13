"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  CreditCard,
  Crown,
  Gauge,
  Gem,
  Gift,
  LifeBuoy,
  LayoutDashboard,
  LogIn,
  MessageCircle,
  PhoneCall,
  Plus,
  ReceiptText,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserPlus,
  UserCheck,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  automationPlaybooks,
  bookings,
  calendarPlan,
  campaigns,
  conversationFeed,
  coupons,
  customers,
  dailyOperationsChecklist,
  dashboardStats,
  demoOwner,
  implementationPhases,
  integrationChecks,
  inventoryAlerts,
  loyaltyRows,
  growthLevers,
  launchReadinessItems,
  marketBenchmarks,
  onboardingSteps,
  operatingMetrics,
  operationAlerts,
  pageMeta,
  paymentQueue,
  platformMetrics,
  platformTenants,
  reportMetrics,
  salon,
  salesReadinessSummary,
  services,
  settingsGroups,
  staffMembers,
  subscriptionPlans,
  timeSlots,
  waitlistEntries,
  weeklyRevenue,
  whatsappStatus,
  whatsappTemplates,
} from "@/lib/demo-platform";

type DashboardPage = keyof typeof pageMeta;
type BookingStatus = "مؤكد" | "وصلت" | "قيد الانتظار" | "ملغي";
type DemoBooking = (typeof bookings)[number];
type DemoEvent = {
  id: string;
  time: string;
  title: string;
  body: string;
  type: "booking" | "payment" | "whatsapp" | "tenant" | "staff";
};
type SalonSettingsDraft = {
  salonName: string;
  depositPercent: number;
  hours: string;
  branch: string;
};
type DemoPlatformState = {
  bookings: DemoBooking[];
  statuses: Record<string, BookingStatus>;
  events: DemoEvent[];
  settingsDraft: SalonSettingsDraft;
};

type SystemReadinessCheck = {
  id: string;
  label: string;
  requiredFor: "sales_demo" | "daily_use" | "production";
  ready: boolean;
  status: string;
  detail: string;
  missing: string[];
};

type SystemReadinessSnapshot = {
  generatedAt: string;
  mode: "demo_ready" | "production_ready";
  productionReady: boolean;
  score: number;
  checks: SystemReadinessCheck[];
  blockers: string[];
  decision: string;
};

type DashboardContext = {
  bookings: DemoBooking[];
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
  settingsDraft: SalonSettingsDraft;
  setSettingsDraft: (draft: SalonSettingsDraft) => void;
  addBooking: (booking: DemoBooking) => void;
  addEvent: (event: Omit<DemoEvent, "id" | "time">) => void;
  events: DemoEvent[];
};

const DEMO_STATE_KEY = "saloni-pro-demo-state-v4";

function createEventId() {
  return `EV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialDemoState(): DemoPlatformState {
  return {
    bookings,
    statuses: Object.fromEntries(bookings.map((booking) => [booking.id, booking.status as BookingStatus])),
    events: [
      { id: "EV-1", time: "11:42", title: "حجز مؤكد", body: "أفنان الدوسري دفعت العربون وتم تثبيت الموعد.", type: "booking" },
      { id: "EV-2", time: "11:10", title: "رسالة واتساب", body: "لمى العتيبي تحتاج رابط دفع جديد.", type: "whatsapp" },
      { id: "EV-3", time: "10:58", title: "تنبيه مخزون", body: "شامبو بوتانيك وصل حد الطلب.", type: "staff" },
    ],
    settingsDraft: {
      salonName: salon.arabicName,
      depositPercent: salon.depositPercent,
      hours: salon.hours,
      branch: salon.district,
    },
  };
}

function sanitizeDemoState(parsed: DemoPlatformState): DemoPlatformState {
  const seen = new Set<string>();
  return {
    bookings: parsed.bookings,
    statuses: parsed.statuses,
    settingsDraft: parsed.settingsDraft ?? createInitialDemoState().settingsDraft,
    events: parsed.events.map((event, index) => {
      const id = event.id && !seen.has(event.id) ? event.id : `${createEventId()}-${index}`;
      seen.add(id);
      return { ...event, id };
    }),
  };
}

function eventTime() {
  return new Intl.DateTimeFormat("ar-SA", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function useDemoPlatformState() {
  const [state, setState] = useState<DemoPlatformState>(createInitialDemoState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DEMO_STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoPlatformState;
        if (Array.isArray(parsed.bookings) && parsed.statuses && Array.isArray(parsed.events)) {
          setState(sanitizeDemoState(parsed));
        }
      }
    } catch {
      setState(createInitialDemoState());
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
    } catch {
      // Local demo persistence is best-effort; the UI still works without storage.
    }
  }, [state]);

  function addEvent(event: Omit<DemoEvent, "id" | "time">) {
    setState((current) => ({
      ...current,
      events: [{ ...event, id: createEventId(), time: eventTime() }, ...current.events].slice(0, 12),
    }));
  }

  function addBooking(booking: DemoBooking) {
    setState((current) => ({
      ...current,
      bookings: [booking, ...current.bookings.filter((item) => item.id !== booking.id)],
      statuses: { ...current.statuses, [booking.id]: booking.status as BookingStatus },
      events: [
        {
          id: createEventId(),
          time: eventTime(),
          title: "حجز جديد",
          body: `${booking.client} - ${booking.service} مع ${booking.staff}`,
          type: "booking" as const,
        },
        ...current.events,
      ].slice(0, 12),
    }));
  }

  function setBookingStatus(id: string, status: BookingStatus) {
    setState((current) => ({
      ...current,
      statuses: { ...current.statuses, [id]: status },
      events: [
        {
          id: createEventId(),
          time: eventTime(),
          title: "تحديث حالة الحجز",
          body: `${current.bookings.find((item) => item.id === id)?.client ?? id}: ${status}`,
          type: "booking" as const,
        },
        ...current.events,
      ].slice(0, 12),
    }));
  }

  function setSettingsDraft(settingsDraft: SalonSettingsDraft) {
    setState((current) => ({ ...current, settingsDraft }));
  }

  function resetDemo() {
    const initial = createInitialDemoState();
    setState(initial);
    try {
      window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(initial));
    } catch {
      // Ignore local storage failures in demo mode.
    }
  }

  return { ...state, addBooking, setBookingStatus, setSettingsDraft, addEvent, resetDemo };
}

function useSystemReadiness() {
  const [readiness, setReadiness] = useState<SystemReadinessSnapshot | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setError("");
      const response = await fetch("/api/system/readiness", { cache: "no-store" });
      if (!response.ok) throw new Error("readiness request failed");
      setReadiness((await response.json()) as SystemReadinessSnapshot);
    } catch {
      setError("تعذر قراءة فحص الجاهزية من الخادم المحلي.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { readiness, error, refresh };
}

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
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#211d24] text-[#f3c7ce] shadow-[0_14px_34px_rgba(33,29,36,0.16)]">
        <Crown size={21} strokeWidth={1.8} />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-semibold leading-6 text-[#211d24]">Saloni Pro</p>
          <p className="text-xs font-medium text-[#6f6871]">منصة تشغيل الصالونات</p>
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
    <section className={cx("saloni-panel overflow-hidden rounded-xl", className)}>
      {(title || action) && (
        <div className="saloni-panel-header flex items-center justify-between gap-4 px-5 py-4">
          {title && <h2 className="text-base font-semibold text-[#211d24]">{title}</h2>}
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
    dark: "border-[#211d24] bg-[#211d24] text-white hover:bg-[#312b34]",
    light: "border-[#e8e1dc] bg-white text-[#211d24] hover:bg-[#fbf8f6]",
    outline: "border-[#ded6d1] bg-white/55 text-[#211d24] hover:bg-white",
    green: "border-[#cfe4d6] bg-[#eef8f1] text-[#176f3e] hover:bg-[#e2f1e7]",
    danger: "border-[#f1c7cc] bg-[#fff2f4] text-[#b2384a] hover:bg-[#ffe8ec]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "saloni-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c44f64]/25",
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
    <div className="saloni-panel rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#6f6871]">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8e8eb] text-[#b9465a]">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#211d24]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#24784a]">{note}</p>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#211d24] text-sm font-semibold text-[#f4c9d0] shadow-[0_10px_24px_rgba(33,29,36,0.12)]">
      {initials}
    </span>
  );
}

function OperationsMetricCard({
  label,
  value,
  suffix,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <div className="saloni-panel rounded-xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#726b73]">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8e8eb] text-[#b9465a]">
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1">
        <strong className="font-mono text-2xl font-semibold tracking-normal text-[#211d24]">{value}</strong>
        {suffix && <span className="pb-1 text-xs font-semibold text-[#675d68]">{suffix}</span>}
      </div>
      <p className="mt-1 text-xs font-semibold text-[#24784a]">{note}</p>
    </div>
  );
}

function OperationsCalendarBoard({ onSelect }: { onSelect?: (message: string) => void }) {
  const hours = ["09:00", "10:30", "12:00", "13:30", "15:00", "17:00"];
  const staff = staffMembers.slice(0, 4);

  return (
    <Panel
      title="تقويم اليوم"
      action={
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6f6571]">
          <button type="button" className="saloni-button rounded-lg border border-[#e8e1dc] bg-[#211d24] px-3 py-1.5 text-white">
            يوم
          </button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-[#817982] transition hover:bg-white">
            أسبوع
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto p-4">
        <div className="saloni-soft-grid min-w-[760px] overflow-hidden rounded-xl border border-[#e8e1dc] bg-white/86">
          <div className="grid grid-cols-[68px_repeat(4,minmax(132px,1fr))] border-b border-[#e8e1dc] bg-white/86">
            <div className="px-3 py-3 text-xs font-semibold text-[#7c727c]">الوقت</div>
            {staff.map((member) => (
              <div key={member.id} className="border-r border-[#eee8e4] px-3 py-3">
                <div className="flex items-center gap-2">
                  <Avatar initials={member.initials} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{member.name.split(" ")[0]}</p>
                    <p className="truncate text-xs text-[#7c727c]">{member.role}</p>
                  </div>
                  <span className="mr-auto h-2 w-2 rounded-full bg-[#20a65a]" />
                </div>
              </div>
            ))}
          </div>
          {hours.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-[68px_repeat(4,minmax(132px,1fr))] border-b border-[#f0eae6] last:border-b-0">
              <div className="px-3 py-3 font-mono text-xs text-[#7c727c]">{hour}</div>
              {staff.map((member, staffIndex) => {
                const booking = bookings[(hourIndex + staffIndex) % bookings.length];
                const booked = (hourIndex + staffIndex) % 3 !== 1;
                const blocked = (hourIndex + staffIndex) % 7 === 0;
                return (
                  <div key={`${hour}-${member.id}`} className="min-h-[74px] border-r border-[#f0eae6] p-2">
                    <button
                      type="button"
                      onClick={() => onSelect?.(booked ? `تم اختيار موعد ${booking.client} مع ${member.name} الساعة ${hour}.` : `تم اختيار خانة متاحة مع ${member.name} الساعة ${hour}.`)}
                      className={cx(
                        "h-full min-h-[56px] w-full rounded-lg border px-3 py-2 text-right text-xs transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,32,41,0.08)] active:translate-y-0",
                        booked
                          ? blocked
                            ? "border-[#eadbc5] bg-[#fff9ef] text-[#6f4d20]"
                            : "border-[#f0cbd1] bg-[#fff3f5] text-[#793645]"
                          : "border-[#dce8df] bg-[#f4faf6] text-[#4f725d]",
                      )}
                    >
                      <span className="block font-semibold">{booked ? booking.client : "متاح"}</span>
                      <span className="mt-1 block text-[11px] text-current/70">{booked ? booking.service : "قابل للتحويل من الانتظار"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ActiveClientPanel() {
  const customer = customers[3] ?? customers[0];

  return (
    <Panel title="العميل الحالي">
      <div className="p-5">
        <div className="flex items-center gap-4">
          <Avatar initials="أ" />
          <div>
            <h3 className="text-lg font-semibold">{customer.name}</h3>
            <p className="mt-1 text-sm text-[#7c727c]" dir="ltr">{customer.phone}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <MiniStat label="رقم العميل" value={customer.id} />
          <MiniStat label="المستوى" value={customer.tier} />
          <MiniStat label="النقاط" value={String(customer.points)} />
          <MiniStat label="الإنفاق" value={customer.spend} />
        </div>
        <div className="mt-4 rounded-lg border border-[#e8dfdc] bg-[#fbf8f6] p-3 text-sm leading-6 text-[#514753]">
          {customer.nextAction}. تظهر هذه الملاحظة للفريق قبل بدء الخدمة.
        </div>
      </div>
    </Panel>
  );
}

function WhatsAppInboxPanel({ onAction }: { onAction?: (message: string) => void }) {
  return (
    <Panel
      title="صندوق الوارد - واتساب"
      action={<StatusPill status="تجريبي" />}
    >
      <div className="grid gap-3 p-4">
        {conversationFeed.map((item) => (
          <button
            key={`${item.time}-${item.name}`}
            type="button"
            onClick={() => onAction?.(`تم فتح محادثة ${item.name}: ${item.body}`)}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#e8dfdc] bg-white p-3 text-right transition hover:border-[#d7c8c4]"
          >
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-[#7c727c]">{item.body}</p>
            </div>
            <div className="text-left">
              <p className="font-mono text-xs text-[#7c727c]">{item.time}</p>
              <span className="mt-1 inline-flex rounded-md bg-[#edf8ef] px-2 py-1 text-[11px] font-semibold text-[#17733a]">{item.status}</span>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function WaitlistPanel({ onAction }: { onAction?: (message: string) => void }) {
  return (
    <Panel title="قائمة الانتظار">
      <div className="divide-y divide-[#f0e8e5]">
        {waitlistEntries.map((entry) => (
          <div key={entry.name} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-semibold">{entry.name}</p>
              <p className="mt-1 text-xs text-[#7c727c]">{entry.service} - {entry.fit}</p>
            </div>
            <button
              type="button"
              onClick={() => onAction?.(`تم تجهيز خانة انتظار ${entry.name} الساعة ${entry.preferred}.`)}
              className="rounded-md border border-[#e8dfdc] px-3 py-1.5 text-xs font-semibold hover:bg-[#fbf8f6]"
            >
              {entry.preferred}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PaymentAndInventoryPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="المدفوعات والعربون">
        <div className="grid gap-3 p-4">
          {paymentQueue.map((item) => (
            <div key={item.label} className="rounded-lg border border-[#e8dfdc] bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">{item.label}</span>
                <strong>{item.amount}</strong>
              </div>
              <ProgressBar value={item.value} tone={item.tone} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="تنبيهات المخزون">
        <div className="grid gap-3 p-4">
          {inventoryAlerts.map((item) => (
            <div key={item.item} className="flex items-center justify-between gap-3 rounded-lg border border-[#e8dfdc] bg-white p-3 text-sm">
              <div>
                <p className="font-semibold">{item.item}</p>
                <p className="mt-1 text-xs text-[#7c727c]">{item.stock}</p>
              </div>
              <StatusPill status={item.status} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function PublicHome() {
  const platform = useDemoPlatformState();
  const [selectedLayer, setSelectedLayer] = useState("الصالون");

  return (
    <main dir="rtl" className="saloni-page min-h-screen overflow-x-hidden text-[#211d24]">
      <header className="sticky top-0 z-30 border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandMark />
          <nav className="hidden items-center rounded-xl border border-[#e8e1dc] bg-white/84 p-1 text-sm font-semibold shadow-[0_16px_44px_rgba(37,32,41,0.045)] md:flex">
            {[
              ["المنصة", "/admin"],
              ["الصالون", "/dashboard"],
              ["العميل", "/client"],
              ["الموظفة", "/staff"],
            ].map(([label, href]) => (
              <AppLink
                key={label}
                href={href}
                className={cx(
                  "rounded-lg px-3 py-2 transition",
                  selectedLayer === label ? "bg-[#211d24] text-white shadow-sm" : "text-[#5f5363] hover:bg-[#f7f3f0]",
                )}
              >
                {label}
              </AppLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                platform.resetDemo();
                setSelectedLayer("الصالون");
              }}
              className="saloni-button hidden rounded-xl border border-[#e8e1dc] bg-white px-3 py-2 text-sm font-semibold text-[#5f5363] sm:inline-flex"
            >
              إعادة بيانات التجربة
            </button>
            <AppLink href="/auth/login" className="saloni-button inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#211d24] px-4 text-sm font-semibold text-white">
              دخول علي
              <LogIn size={16} />
            </AppLink>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[260px_minmax(0,1fr)_330px]">
        <aside className="grid gap-4 xl:sticky xl:top-20 xl:self-start">
          <Panel className="p-5">
            <p className="text-sm font-semibold text-[#b9465a]">طبقة تشغيل موحدة</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-balance">صالون، عميل، فريق، ورسائل في تدفق واحد.</h1>
            <p className="mt-3 text-sm leading-7 text-[#675d68]">
              تجربة مصممة لتقليل الفوضى اليومية: حجز واضح، متابعة دفع، ملف عميل، وتنبيهات قابلة للتجربة.
            </p>
            <div className="mt-5 grid gap-2">
              {[
                { label: "المنصة", icon: Building2, href: "/admin" },
                { label: "الصالون", icon: LayoutDashboard, href: "/dashboard" },
                { label: "العميل", icon: UserRound, href: "/client" },
                { label: "الموظفة", icon: UserCheck, href: "/staff" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <AppLink
                    key={item.label}
                    href={item.href}
                    className="saloni-button flex min-h-11 items-center justify-between rounded-xl border border-[#e8e1dc] bg-white/86 px-3 text-sm font-semibold text-[#211d24]"
                  >
                    <span className="flex items-center gap-2"><Icon size={16} />{item.label}</span>
                    <ArrowLeft size={15} />
                  </AppLink>
                );
              })}
            </div>
          </Panel>

          <Panel title="حساب الاختبار">
            <div className="grid gap-3 p-4 text-sm">
              <MiniStat label="البريد" value={demoOwner.email} />
              <MiniStat label="كلمة المرور" value={demoOwner.password} />
              <MiniStat label="OTP" value={demoOwner.otp} />
            </div>
          </Panel>

          <WhatsAppInboxPanel onAction={(message) => platform.addEvent({ title: "واتساب", body: message, type: "whatsapp" })} />
        </aside>

        <section className="min-w-0">
          <div className="mb-5 rounded-xl border border-[#e8e1dc] bg-white/62 p-5 shadow-[0_18px_55px_rgba(37,32,41,0.045)] backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#b9465a]">مركز العمليات</p>
              <h2 className="mt-1 max-w-3xl text-3xl font-semibold leading-[1.18] text-balance sm:text-4xl 2xl:text-[44px]">مركز تشغيل يومي للحجوزات، المدفوعات، والعميل.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#675d68]">
                واجهة واحدة تربط التقويم، العربون، الانتظار، محادثات واتساب، وتنبيهات المخزون بدون قفز بين أدوات منفصلة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AppLink href="/auth/register" className="saloni-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e8e1dc] bg-white px-4 text-sm font-semibold">
                <UserPlus size={16} />
                إضافة صالون
              </AppLink>
              <AppLink href="/dashboard" className="saloni-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#211d24] px-4 text-sm font-semibold text-white">
                فتح النظام
                <ArrowLeft size={16} />
              </AppLink>
            </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {operatingMetrics.map((metric, index) => (
              <OperationsMetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                suffix={metric.suffix}
                note={metric.note}
                icon={[WalletCards, CalendarCheck, Gauge, CreditCard, Clock3, AlertTriangle][index] ?? BarChart3}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5">
            <OperationsCalendarBoard onSelect={(message) => platform.addEvent({ title: "تقويم", body: message, type: "booking" })} />

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Panel title="حجوزات متصلة بالنظام">
                <BookingTable
                  context={{
                    bookings: platform.bookings,
                    statuses: platform.statuses,
                    setBookingStatus: platform.setBookingStatus,
                    statusFilter: "الكل",
                    setStatusFilter: () => undefined,
                    selectedCustomerId: customers[0].id,
                    setSelectedCustomerId: () => undefined,
                    selectedServiceId: services[0].id,
                    setSelectedServiceId: () => undefined,
                    actionLog: "",
                    logAction: (message) => platform.addEvent({ title: "إجراء", body: message, type: "booking" }),
                    settingsDraft: {
                      salonName: salon.arabicName,
                      depositPercent: salon.depositPercent,
                      hours: salon.hours,
                      branch: salon.district,
                    },
                    setSettingsDraft: () => undefined,
                    addBooking: platform.addBooking,
                    addEvent: platform.addEvent,
                    events: platform.events,
                  }}
                  compact
                />
              </Panel>
              <WaitlistPanel onAction={(message) => platform.addEvent({ title: "قائمة الانتظار", body: message, type: "booking" })} />
            </div>

            <PaymentAndInventoryPanel />
          </div>
        </section>

        <aside className="grid gap-4 xl:sticky xl:top-20 xl:self-start">
          <ActiveClientPanel />

          <Panel title="إجراءات سريعة">
            <div className="grid gap-2 p-4">
              {[
                { label: "حجز جديد", icon: Plus, event: "تم فتح حجز جديد من مركز العمليات.", href: "/client" },
                { label: "متابعة عدم حضور", icon: PhoneCall, event: "تم تجهيز رسالة متابعة عدم حضور.", href: "/dashboard/bookings" },
                { label: "حملة تسويقية", icon: Send, event: "تم إنشاء مسودة حملة واتساب.", href: "/dashboard/whatsapp" },
                { label: "عرض التقارير", icon: BarChart3, event: "تم فتح تقارير الأداء.", href: "/dashboard/reports" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <AppLink
                    key={item.label}
                    href={item.href}
                    className="saloni-button flex min-h-11 items-center justify-between rounded-xl border border-[#e8e1dc] bg-white/86 px-3 text-sm font-semibold"
                  >
                    <span className="flex items-center gap-2"><Icon size={16} />{item.label}</span>
                    <ArrowLeft size={14} />
                  </AppLink>
                );
              })}
            </div>
          </Panel>

          <Panel title="سجل الأحداث">
            <div className="divide-y divide-[#f0e8e5]">
              {platform.events.slice(0, 7).map((event) => (
                <div key={event.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{event.title}</p>
                    <span className="font-mono text-xs text-[#7c727c]">{event.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#675d68]">{event.body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="حالة الربط الحقيقي">
            <div className="grid gap-3 p-4">
              <div className="rounded-lg border border-[#d7e7dc] bg-[#f1faf3] p-3">
                <p className="font-semibold text-[#17733a]">النسخة المحلية مترابطة</p>
                <p className="mt-1 text-xs leading-5 text-[#57725d]">الحجوزات والحالات والأحداث تحفظ محليًا بين الصفحات.</p>
              </div>
              <div className="rounded-lg border border-[#f0dfb8] bg-[#fff8e7] p-3">
                <p className="font-semibold text-[#7d5a10]">WhatsApp / Payment Demo</p>
                <p className="mt-1 text-xs leading-5 text-[#846d3d]">الدفع الحقيقي يحتاج مفاتيح Moyasar، وواتساب معطل في النشر الحالي.</p>
              </div>
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

export function ClientExperience() {
  const platform = useDemoPlatformState();
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
    const bookingId = `B-${String(Date.now()).slice(-5)}`;
    platform.addBooking({
      id: bookingId,
      time: slot,
      dateLabel: dateOptions[dateIndex],
      client: "أفنان الدوسري",
      phone,
      serviceId: selectedService.id,
      service: selectedService.name,
      staffId: selectedStaff.id,
      staff: selectedStaff.name,
      status: "مؤكد",
      payment: `عربون ${money(selectedService.deposit)}`,
      source: "بوابة العميل",
      price: selectedService.price,
      notes: "تم إنشاء الحجز من بوابة العميل التجريبية",
    });
    platform.addEvent({
      title: "دفع عربون",
      body: `تم تسجيل عربون ${money(selectedService.deposit)} لحجز ${bookingId}.`,
      type: "payment",
    });
    setConfirmed(true);
    setNotice(`تم تثبيت الحجز ${bookingId}. سيظهر الآن في لوحة المدير ومركز العمليات.`);
  }

  return (
    <main dir="rtl" className="saloni-page min-h-screen text-[#211d24]">
      <header className="border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <AppLink href={`/${salon.slug}/profile`} className="saloni-button hidden rounded-xl border border-[#e8e1dc] bg-white px-3 py-2 text-sm font-semibold text-[#211d24] sm:inline-flex">
              حسابي
            </AppLink>
            <AppLink href="/manager" className="saloni-button rounded-xl bg-[#211d24] px-3 py-2 text-sm font-semibold text-white">
              المدير
            </AppLink>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <Panel className="overflow-hidden">
            <div className="saloni-panel-header border-b border-[#eee8e4] p-5">
              <p className="text-sm font-semibold text-[#b9465a]">بوابة العميل | {salon.arabicName} - {salon.district}</p>
              <h1 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight text-balance sm:text-4xl">احجزي موعدك وتابعي رصيد الولاء من نفس الصفحة.</h1>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {["الخدمة", "الموظفة", "التاريخ والوقت", "التأكيد"].map((step, index) => (
                  <div key={step} className={cx("rounded-xl border px-3 py-2 text-sm font-semibold", index === 0 || confirmed ? "border-[#f0cbd1] bg-[#fff3f5] text-[#8d2f42]" : "border-[#e8e1dc] bg-white/74 text-[#6f6871]")}>
                    <span className={cx("ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", index === 0 || confirmed ? "bg-[#c44f64] text-white" : "bg-[#f4efeb] text-[#6f6871]")}>{index + 1}</span>
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
                        "saloni-button rounded-xl border p-4 text-right",
                        selectedService.id === service.id
                          ? "border-[#f0cbd1] bg-[#fff5f6] shadow-[0_14px_34px_rgba(196,79,100,0.12)]"
                          : "border-[#e8e1dc] bg-white/86",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="mt-1 text-sm text-[#7f7482]">{service.duration} مع {service.specialist}</p>
                        </div>
                        {selectedService.id === service.id ? <CheckCircle2 className="text-[#c44f64]" size={20} /> : <ChevronLeft className="text-[#9b8e98]" size={18} />}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold">{money(service.price)}</span>
                        <span className="text-[#6f6871]">عربون {money(service.deposit)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4 shadow-[0_12px_34px_rgba(37,32,41,0.035)]">
                <h3 className="font-semibold">ملخص الحجز</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6f6871]">الخدمة</span>
                    <strong>{selectedService.name}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6f6871]">الموظفة</span>
                    <strong>{selectedStaff.name}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6f6871]">الموعد</span>
                    <strong>{dateOptions[dateIndex]} - {slot}</strong>
                  </div>
                  <div className="border-t border-[#e8e1dc] pt-3">
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
                    <p className="mt-2 text-xs text-[#6f6871]">المتبقي عند زيارة الصالون: {money(total - selectedService.deposit)}</p>
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
                      className={cx("saloni-button flex items-center justify-between rounded-xl border p-3 text-right", selectedStaff.id === staff.id ? "border-[#f0cbd1] bg-[#fff5f6]" : "border-[#e8e1dc] bg-white/86")}
                    >
                      <span className="flex items-center gap-3">
                        <Avatar initials={staff.initials} />
                        <span>
                          <span className="block font-semibold">{staff.name}</span>
                          <span className="text-sm text-[#6f6871]">{staff.role} - تقييم {staff.rating}</span>
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
                      className={cx("saloni-button rounded-xl border px-3 py-3 text-sm font-semibold", dateIndex === index ? "border-[#211d24] bg-[#211d24] text-white" : "border-[#e8e1dc] bg-white text-[#211d24]")}
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
                      className={cx("saloni-button rounded-xl border px-3 py-3 text-sm font-semibold", slot === time ? "border-[#f0cbd1] bg-[#fff3f5] text-[#9a3548]" : "border-[#e8e1dc] bg-white text-[#211d24]")}
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
                    className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 text-right font-semibold outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
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
                    className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 text-center text-lg font-semibold tracking-normal outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
                  />
                </label>
                <ActionButton icon={CheckCircle2} variant="dark" onClick={confirmBooking} disabled={!otpSent}>
                  تأكيد الحجز
                </ActionButton>
                <div className={cx("rounded-xl border p-4 text-sm", confirmed ? "border-[#cfe4d6] bg-[#eef8f1] text-[#17733a]" : "border-[#eadbc5] bg-[#fff9ef] text-[#7d5a10]")}>
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
                <p className="text-sm font-semibold text-[#b9465a]">حساب العميل</p>
                <h2 className="mt-1 text-xl font-semibold">أهلا أفنان</h2>
              </div>
              <Avatar initials="أ" />
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4">
                <p className="text-sm text-[#6f6871]">الحجوزات القادمة</p>
                <p className="mt-2 font-semibold">{selectedService.name}</p>
                <p className="mt-1 text-sm text-[#6f6871]">{dateOptions[dateIndex]} - {slot}</p>
              </div>
              <div className="rounded-xl border border-[#e8e1dc] bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">نقاط الولاء</span>
                  <Gem className="text-[#b9465a]" size={18} />
                </div>
                <p className="mt-3 text-3xl font-semibold">1,250</p>
                <ProgressBar value={72} tone="bg-[#c44f64]" />
                <p className="mt-2 text-xs text-[#6f6871]">باقي 250 نقطة للوصول لمكافأة ذهبية.</p>
              </div>
              <AppLink href={`/${salon.slug}/profile`} className="saloni-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8e1dc] bg-white px-4 text-sm font-semibold text-[#211d24]">
                فتح حساب العميل
                <ArrowLeft size={16} />
              </AppLink>
            </div>
          </Panel>

          {confirmed && (
            <Panel className="border-[#cfe4d6] bg-[#f6fff7] p-5">
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
    <main dir="rtl" className="saloni-page min-h-screen text-[#211d24]">
      <header className="border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/client" className="saloni-button rounded-xl bg-[#211d24] px-4 py-2 text-sm font-semibold text-white">
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
            <div className="rounded-xl bg-[#fbf8f6] p-4">
              <p className="text-sm text-[#7f7482]">المستوى</p>
              <p className="mt-1 font-semibold">{customer.tier}</p>
            </div>
            <div className="rounded-xl bg-[#fbf8f6] p-4">
              <p className="text-sm text-[#7f7482]">الزيارات</p>
              <p className="mt-1 font-semibold">{customer.visits}</p>
            </div>
          </div>
        </Panel>
        <div className="grid gap-5">
          <Panel title="موعدك القادم">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-xl border border-[#e8e1dc] p-4">
                <p className="text-sm text-[#7f7482]">الخدمة</p>
                <p className="mt-2 font-semibold">صبغة شعر احترافية</p>
              </div>
              <div className="rounded-xl border border-[#e8e1dc] p-4">
                <p className="text-sm text-[#7f7482]">الموعد</p>
                <p className="mt-2 font-semibold">الأحد 18 مايو - 16:30</p>
              </div>
              <div className="rounded-xl border border-[#e8e1dc] p-4">
                <p className="text-sm text-[#7f7482]">الحالة</p>
                <div className="mt-2"><StatusPill status="مؤكد" /></div>
              </div>
            </div>
          </Panel>
          <Panel title="الولاء والمحفظة">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              {loyaltyRows.map((row) => (
                <div key={row.tier} className="rounded-xl border border-[#e8e1dc] p-4">
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
  const platform = useDemoPlatformState();
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const [actionLog, setActionLog] = useState("جاهز: كل العمليات هنا تعمل محليا للتجربة.");

  const meta = pageMeta[page] ?? pageMeta.dashboard;

  function logAction(message: string) {
    setActionLog(message);
    platform.addEvent({ title: "إجراء مدير", body: message, type: "staff" });
  }

  function setBookingStatus(id: string, status: BookingStatus) {
    platform.setBookingStatus(id, status);
    setActionLog(`تم تحديث الحجز ${id} إلى "${status}".`);
  }

  const context: DashboardContext = {
    bookings: platform.bookings,
    statuses: platform.statuses,
    setBookingStatus,
    statusFilter,
    setStatusFilter,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedServiceId,
    setSelectedServiceId,
    actionLog,
    logAction,
    settingsDraft: platform.settingsDraft,
    setSettingsDraft: platform.setSettingsDraft,
    addBooking: platform.addBooking,
    addEvent: platform.addEvent,
    events: platform.events,
  };

  return (
    <main dir="rtl" className="saloni-page min-h-screen text-[#211d24]">
      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-l border-[#e8e1dc] bg-white/86 text-[#211d24] backdrop-blur-xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#eee8e4] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#211d24] text-[#f3c7ce] shadow-[0_14px_34px_rgba(33,29,36,0.14)]">
                  <Crown size={21} />
                </div>
                <div>
                  <p className="font-semibold">Saloni Pro</p>
                  <p className="text-xs text-[#6f6871]">مركز التشغيل</p>
                </div>
              </div>
              <StatusPill status="Live" />
            </div>

            <nav className="mt-5 grid gap-1.5 overflow-y-auto pl-1">
              {dashboardNav.map((item) => {
                const Icon = item.icon;
                const active = item.page === page;
                return (
                  <AppLink
                    key={item.page}
                    href={item.href}
                    className={cx(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                      active ? "bg-[#f7d9de] text-[#8d2f42] shadow-sm" : "text-[#5f5861] hover:bg-[#f8f5f2] hover:text-[#211d24]",
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </AppLink>
                );
              })}
            </nav>

            <div className="mt-auto rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4 text-sm">
              <p className="font-semibold text-[#b9465a]">حساب الاختبار</p>
              <p className="mt-2 text-[#5f5861]" dir="ltr">{demoOwner.email}</p>
              <p className="mt-1 text-[#5f5861]">كلمة المرور: {demoOwner.password}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3 lg:hidden">
                <BrandMark compact />
                <strong>Saloni Pro</strong>
              </div>
              <CommandSearch context={context} />
              <div className="flex items-center gap-2">
                <AppLink href="/client" className="saloni-button rounded-xl border border-[#e8e1dc] bg-white px-3 py-2 text-sm font-semibold text-[#211d24]">
                  تجربة العميل
                </AppLink>
                <AppLink href="/auth/login" className="saloni-button rounded-xl bg-[#211d24] px-3 py-2 text-sm font-semibold text-white">
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
                      "shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold",
                      active ? "border-[#211d24] bg-[#211d24] text-white" : "border-[#e8e1dc] bg-white text-[#211d24]",
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
                <p className="text-sm font-semibold text-[#b9465a]">{managerMode ? "لوحة المدير" : "مركز التشغيل"}</p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight text-balance sm:text-4xl">{meta.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6871]">{meta.description}</p>
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

            <div className="mb-5 rounded-xl border border-[#e8e1dc] bg-white/82 px-4 py-3 text-sm text-[#5f5861] shadow-[0_14px_34px_rgba(37,32,41,0.035)]">
              <span className="font-semibold text-[#211d24]">آخر إجراء:</span> {actionLog}
            </div>

            <OperationsReadinessStrip context={context} />

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

      <GrowthOperationsPanel context={context} />

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
                          {booked ? context.bookings[(rowIndex + slotIndex) % context.bookings.length]?.service ?? "حجز" : "متاح"}
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
            className={cx(
              "saloni-button rounded-xl border px-4 py-2 text-sm font-semibold",
              context.statusFilter === filter ? "border-[#211d24] bg-[#211d24] text-white" : "border-[#e8e1dc] bg-white/88 text-[#211d24]",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="إدارة الحجوزات">
          <BookingTable context={context} />
        </Panel>
        <ClientFocusPanel context={context} />
      </div>
    </div>
  );
}

function BookingTable({ context, compact = false }: { context: DashboardContext; compact?: boolean }) {
  const visibleBookings = context.bookings.filter((booking) => context.statusFilter === "الكل" || context.statuses[booking.id] === context.statusFilter);

  return (
    <div className="overflow-x-auto">
      <table className="saloni-data-table w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#e8e1dc] bg-[#fbf8f6] text-[#6f6871]">
            {["الوقت", "العميلة", "الخدمة", "الموظفة", "الدفع", "الحالة", compact ? "المصدر" : "إجراءات"].map((head) => (
              <th key={head} className="px-4 py-3 text-right text-xs font-semibold">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleBookings.map((booking) => {
            const status = context.statuses[booking.id];
            const linkedCustomer = customers.find((customer) => customer.phone === booking.phone || customer.name === booking.client);
            return (
              <tr key={booking.id} className="border-b border-[#f0eae6]">
                <td className="px-4 py-4 font-semibold">{booking.time}</td>
                <td className="px-4 py-4">
                  {compact || !linkedCustomer ? (
                    <p className="font-semibold">{booking.client}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        context.setSelectedCustomerId(linkedCustomer.id);
                        context.logAction(`تم فتح ملف ${linkedCustomer.name} من جدول الحجوزات.`);
                      }}
                      className="text-right font-semibold text-[#211d24] underline-offset-4 hover:text-[#b9465a] hover:underline"
                    >
                      {booking.client}
                    </button>
                  )}
                  <p className="mt-1 font-mono text-[11px] font-semibold text-[#b9465a]" dir="ltr">{booking.id}</p>
                  <p className="text-xs text-[#6f6871]" dir="ltr">{booking.phone}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold">{booking.service}</p>
                  <p className="mt-1 text-xs text-[#6f6871]">{booking.source}</p>
                  {booking.notes && <p className="mt-1 text-[11px] leading-5 text-[#9b5a63]">{booking.notes}</p>}
                </td>
                <td className="px-4 py-4">{booking.staff}</td>
                <td className="px-4 py-4">{booking.payment}</td>
                <td className="px-4 py-4"><StatusPill status={status} /></td>
                <td className="px-4 py-4">
                  {compact ? (
                    booking.source
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "مؤكد")} className="saloni-button rounded-lg border border-[#cfe4d6] bg-white px-2 py-1 text-xs font-semibold text-[#17733a]">تأكيد</button>
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "وصلت")} className="saloni-button rounded-lg border border-[#e6d8ff] bg-white px-2 py-1 text-xs font-semibold text-[#6550b9]">وصلت</button>
                      <button type="button" onClick={() => context.setBookingStatus(booking.id, "ملغي")} className="saloni-button rounded-lg border border-[#f1c7cc] bg-white px-2 py-1 text-xs font-semibold text-[#b2384a]">إلغاء</button>
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

function ClientFocusPanel({ context }: { context: DashboardContext }) {
  const selectedCustomer = customers.find((customer) => customer.id === context.selectedCustomerId) ?? customers[0];
  const customerBookings = context.bookings.filter((booking) => booking.phone === selectedCustomer.phone || booking.client === selectedCustomer.name);
  const nextBooking = customerBookings[0];

  return (
    <Panel title="ملف العميل النشط">
      <div className="grid gap-4 p-5">
        <div className="flex items-center gap-3">
          <Avatar initials={selectedCustomer.name.slice(0, 1)} />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{selectedCustomer.name}</h2>
            <p className="mt-1 text-sm text-[#6f6871]" dir="ltr">{selectedCustomer.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="المستوى" value={selectedCustomer.tier} />
          <MiniStat label="الزيارات" value={String(selectedCustomer.visits)} />
          <MiniStat label="النقاط" value={String(selectedCustomer.points)} />
          <MiniStat label="الإنفاق" value={selectedCustomer.spend} />
        </div>

        <div className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4">
          <p className="text-sm font-semibold text-[#b9465a]">الإجراء التالي</p>
          <p className="mt-2 text-sm leading-6 text-[#5f5861]">{selectedCustomer.nextAction}</p>
          {nextBooking && (
            <div className="mt-3 rounded-lg border border-[#eee8e4] bg-white p-3 text-sm">
              <p className="font-semibold">{nextBooking.service}</p>
              <p className="mt-1 text-xs text-[#6f6871]">{nextBooking.dateLabel} - {nextBooking.time} | {context.statuses[nextBooking.id]}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedCustomer.tags.map((tag) => (
            <span key={tag} className="rounded-lg bg-[#fff3f5] px-3 py-1 text-xs font-semibold text-[#8d2f42]">{tag}</span>
          ))}
        </div>

        <div className="grid gap-2">
          <ActionButton icon={MessageCircle} variant="green" onClick={() => context.logAction(`تم تجهيز رسالة متابعة إلى ${selectedCustomer.name}.`)}>
            رسالة متابعة
          </ActionButton>
          <ActionButton icon={UserRound} variant="outline" onClick={() => context.logAction(`تم فتح سجل زيارات ${selectedCustomer.name}.`)}>
            سجل الزيارات
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}

function CommandSearch({ context }: { context: DashboardContext }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeDigits(query).trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 1;
  const bookingResults = hasQuery
    ? context.bookings
        .filter((booking) => `${booking.id} ${booking.client} ${booking.phone} ${booking.service} ${booking.staff}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 3)
        .map((booking) => ({
          id: `booking-${booking.id}`,
          label: `${booking.client} - ${booking.time}`,
          detail: `${booking.service} | ${context.statuses[booking.id]}`,
          href: "/dashboard/bookings",
          action: () => {
            context.setStatusFilter("الكل");
            context.logAction(`تم فتح نتيجة البحث للحجز ${booking.id}.`);
          },
        }))
    : [];
  const customerResults = hasQuery
    ? customers
        .filter((customer) => `${customer.id} ${customer.name} ${customer.phone} ${customer.tags.join(" ")}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map((customer) => ({
          id: `customer-${customer.id}`,
          label: customer.name,
          detail: `${customer.tier} | ${customer.nextAction}`,
          href: "/dashboard/customers",
          action: () => {
            context.setSelectedCustomerId(customer.id);
            context.logAction(`تم فتح ملف العميل ${customer.name} من البحث.`);
          },
        }))
    : [];
  const serviceResults = hasQuery
    ? services
        .filter((service) => `${service.id} ${service.name} ${service.category} ${service.specialist}`.toLowerCase().includes(normalizedQuery))
        .slice(0, 2)
        .map((service) => ({
          id: `service-${service.id}`,
          label: service.name,
          detail: `${money(service.price)} | عربون ${money(service.deposit)}`,
          href: "/dashboard/services",
          action: () => {
            context.setSelectedServiceId(service.id);
            context.logAction(`تم فتح إعدادات خدمة ${service.name} من البحث.`);
          },
        }))
    : [];
  const results = [...bookingResults, ...customerResults, ...serviceResults].slice(0, 5);

  return (
    <div className="relative hidden min-w-[360px] max-w-[520px] flex-1 lg:block">
      <div className="flex h-11 items-center gap-2 rounded-xl border border-[#e8e1dc] bg-white/90 px-3 text-sm text-[#6f6871] shadow-[0_14px_34px_rgba(37,32,41,0.035)]">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="بحث عن حجز، عميلة، خدمة..."
          className="h-full min-w-0 flex-1 bg-transparent text-[#211d24] outline-none placeholder:text-[#8f858d]"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="rounded-lg px-2 py-1 text-xs font-semibold text-[#8f3547] hover:bg-[#fff3f5]">
            مسح
          </button>
        )}
      </div>
      {hasQuery && (
        <div className="absolute left-0 right-0 top-[52px] z-40 overflow-hidden rounded-xl border border-[#e8e1dc] bg-white shadow-[0_24px_70px_rgba(37,32,41,0.13)]">
          {results.length ? (
            results.map((result) => (
              <Link
                key={result.id}
                href={result.href}
                prefetch={false}
                onClick={() => {
                  result.action();
                  setQuery("");
                }}
                className="block border-b border-[#f0eae6] px-4 py-3 text-right last:border-b-0 hover:bg-[#fbf8f6]"
              >
                <span className="block text-sm font-semibold text-[#211d24]">{result.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#6f6871]">{result.detail}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-[#6f6871]">لا توجد نتيجة مطابقة. جرّب اسم عميلة أو رقم حجز.</div>
          )}
        </div>
      )}
    </div>
  );
}

function OperationsReadinessStrip({ context }: { context: DashboardContext }) {
  const readinessItems = [
    {
      title: "الحجوزات",
      detail: `${context.bookings.length} حجوزات مرتبطة بالحالات`,
      status: "جاهز",
      tone: "green",
      action: "تمت مراجعة حالة محرك الحجوزات المحلي.",
    },
    {
      title: "الإعدادات",
      detail: `${context.settingsDraft.salonName} | عربون ${context.settingsDraft.depositPercent}%`,
      status: "محلي",
      tone: "rose",
      action: "تم فتح ملخص إعدادات الصالون الحالية.",
    },
    {
      title: "واتساب",
      detail: "مستثنى من النشر الحالي",
      status: "معطل",
      tone: "rose",
      action: "واتساب معطل في هذا النشر ولا يرسل رسائل حقيقية.",
    },
    {
      title: "الدفع",
      detail: "روابط العربون جاهزة للمحاكاة",
      status: "Pending",
      tone: "amber",
      action: "الدفع الحقيقي ينتظر مفاتيح Moyasar أو Tap.",
    },
  ];

  return (
    <div className="mb-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
      {readinessItems.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => context.logAction(item.action)}
          className="saloni-button rounded-xl border border-[#e8e1dc] bg-white/82 p-4 text-right shadow-[0_14px_34px_rgba(37,32,41,0.035)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#211d24]">{item.title}</span>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6f6871]">{item.detail}</p>
        </button>
      ))}
    </div>
  );
}

function GrowthOperationsPanel({ context }: { context: DashboardContext }) {
  return (
    <Panel
      title="طبقة النمو والأتمتة"
      action={<StatusPill status="مستوحاة من السوق" />}
    >
      <div className="grid gap-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {growthLevers.map((lever) => (
            <button
              key={lever.label}
              type="button"
              aria-label={`فتح مؤشر ${lever.label}`}
              onClick={() => context.logAction(`تم فتح مؤشر ${lever.label}: ${lever.detail}.`)}
              className="saloni-button rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4 text-right"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#746b73]">{lever.label}</p>
                <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-[#b9465a]">{lever.trend}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold text-[#211d24]">
                {lever.value} <span className="text-xs font-semibold text-[#6f6571]">{lever.unit}</span>
              </p>
              <p className="mt-2 text-xs leading-5 text-[#6f6871]">{lever.detail}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          {automationPlaybooks.map((playbook, index) => {
            const Icon = [Clock3, ShieldCheck, CalendarCheck, UsersRound, Send][index] ?? Sparkles;
            return (
              <div key={playbook.id} className="flex min-h-[220px] flex-col rounded-xl border border-[#e8e1dc] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#211d24] text-[#f4c9d0]">
                    <Icon size={18} />
                  </span>
                  <StatusPill status={playbook.status} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#211d24]">{playbook.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#6f6871]">{playbook.trigger}</p>
                <div className="mt-3 grid gap-2 text-xs">
                  <MiniStat label="القناة" value={playbook.channel} />
                  <MiniStat label="الشريحة" value={playbook.audience} />
                </div>
                <p className="mt-3 text-xs leading-5 text-[#8d4652]">{playbook.result}</p>
                <button
                  type="button"
                  aria-label={`تشغيل ${playbook.title}`}
                  onClick={() => context.logAction(`${playbook.action}: ${playbook.result}.`)}
                  className="saloni-button mt-auto rounded-lg border border-[#eadfdd] bg-[#fbf8f6] px-3 py-2 text-xs font-semibold text-[#211d24] hover:bg-white"
                >
                  تشغيل
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
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
            <p className="font-semibold text-[#7d5a10]">معطل في النشر الحالي</p>
            <p className="mt-2 text-sm leading-6 text-[#846d3d]">
              رموز التحقق والحملات تظهر كنموذج عمل فقط. النظام لا يرسل من رقم واتساب حقيقي حتى يتم تفعيل WHATSAPP_ENABLED=true وإضافة مفاتيح Meta.
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
                <StatusPill status={env === "WHATSAPP_ENABLED=true" ? "اختياري" : "لاحقا"} />
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

        <Panel title="أتمتة الرسائل">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {automationPlaybooks.filter((playbook) => playbook.channel.includes("WhatsApp") || playbook.channel.includes("واتساب")).map((playbook) => (
              <button
                key={playbook.id}
                type="button"
                aria-label={`فتح أتمتة ${playbook.title}`}
                onClick={() => context.logAction(`${playbook.action}: ${playbook.trigger}.`)}
                className="saloni-button rounded-xl border border-[#eadfdd] bg-white p-4 text-right"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{playbook.title}</p>
                  <StatusPill status={playbook.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6f6571]">{playbook.result}</p>
                <p className="mt-3 text-xs font-semibold text-[#b9465a]">{playbook.audience}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsPage({ context }: { context: DashboardContext }) {
  const savedDraft = context.settingsDraft;
  const [draft, setDraft] = useState(savedDraft);
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  useEffect(() => {
    setDraft(context.settingsDraft);
  }, [context.settingsDraft]);

  function saveSettings() {
    context.setSettingsDraft(draft);
    context.logAction(`تم حفظ إعدادات ${draft.salonName}: الفرع ${draft.branch}، العربون ${draft.depositPercent}%.`);
  }

  function restoreSettings() {
    setDraft(savedDraft);
    context.logAction("تم استرجاع آخر نسخة محفوظة من إعدادات الصالون.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="إعدادات الصالون" action={<StatusPill status={hasUnsavedChanges ? "غير محفوظ" : "محفوظ"} />}>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className={cx("md:col-span-2 rounded-xl border p-4 text-sm leading-6", hasUnsavedChanges ? "border-[#eadbc5] bg-[#fff9ef] text-[#7d5a10]" : "border-[#d7e7dc] bg-[#f1faf3] text-[#17733a]")}>
            {hasUnsavedChanges ? "هناك تغييرات غير محفوظة. احفظها أو استرجع آخر نسخة محفوظة قبل مغادرة الصفحة." : "الإعدادات الحالية محفوظة محليا للتجربة، وتظهر مباشرة في شريط جاهزية النظام."}
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            اسم الصالون
            <input
              value={draft.salonName}
              onChange={(event) => setDraft({ ...draft, salonName: event.target.value })}
              className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            الفرع
            <input
              value={draft.branch}
              onChange={(event) => setDraft({ ...draft, branch: event.target.value })}
              className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            ساعات العمل
            <input
              value={draft.hours}
              onChange={(event) => setDraft({ ...draft, hours: event.target.value })}
              className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            نسبة العربون
            <input
              type="number"
              min={0}
              max={100}
              value={draft.depositPercent}
              onChange={(event) => {
                const value = Number(event.target.value || 0);
                setDraft({ ...draft, depositPercent: Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)) });
              }}
              className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
            />
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <ActionButton icon={CheckCircle2} variant="dark" onClick={saveSettings} disabled={!hasUnsavedChanges}>
              حفظ الإعدادات
            </ActionButton>
            <ActionButton icon={ArrowLeft} variant="outline" onClick={restoreSettings} disabled={!hasUnsavedChanges}>
              استرجاع آخر حفظ
            </ActionButton>
          </div>
        </div>
      </Panel>
      <div className="grid gap-5">
        <Panel title="أقسام الإعداد">
          <div className="grid gap-3 p-5">
            <div className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4">
              <p className="text-sm font-semibold text-[#b9465a]">معاينة التشغيل</p>
              <h3 className="mt-2 text-lg font-semibold">{draft.salonName}</h3>
              <p className="mt-1 text-sm leading-6 text-[#6f6871]">{draft.branch} | {draft.hours}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat label="نسبة العربون" value={`${draft.depositPercent}%`} />
                <MiniStat label="الحالة" value={hasUnsavedChanges ? "مسودة" : "محفوظ"} />
              </div>
            </div>
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
        <DailyOperationsChecklistPanel context={context} />
      </div>
    </div>
  );
}

function DailyOperationsChecklistPanel({ context }: { context: DashboardContext }) {
  const { readiness, error, refresh } = useSystemReadiness();
  const modeLabel = readiness?.productionReady ? "Production" : "Demo Ready";

  return (
    <Panel title="جاهزية التشغيل اليومي" action={<StatusPill status={modeLabel} />}>
      <div className="grid gap-3 p-5">
        <div className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4">
          <p className="text-sm font-semibold text-[#b9465a]">قرار التشغيل</p>
          <p className="mt-2 text-sm leading-6 text-[#5f5861]">
            {readiness?.decision ?? salesReadinessSummary.dailyUse}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat label="فحص البيئة" value={readiness ? `${readiness.score}%` : "يقرأ..."} />
            <MiniStat label="الموانع" value={readiness ? String(readiness.blockers.length) : "-"} />
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-[#b2384a]">{error}</p>}
          <button
            type="button"
            onClick={() => {
              void refresh();
              context.logAction("تم تحديث فحص جاهزية التشغيل اليومي.");
            }}
            className="saloni-button mt-3 rounded-lg border border-[#eadfdd] bg-white px-3 py-2 text-xs font-semibold text-[#211d24]"
          >
            تحديث الفحص
          </button>
        </div>

        {dailyOperationsChecklist.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => context.logAction(`تمت مراجعة خطوة ${item.title}: ${item.detail}`)}
            className="saloni-button rounded-xl border border-[#eadfdd] bg-white p-4 text-right"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{item.title}</p>
              <StatusPill status={item.ready ? "جاهز" : "ينتظر إنتاج"} />
            </div>
            <p className="mt-1 text-xs font-semibold text-[#b9465a]">{item.owner}</p>
            <p className="mt-2 text-sm leading-6 text-[#6f6571]">{item.detail}</p>
          </button>
        ))}
      </div>
    </Panel>
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
    <main dir="rtl" className="saloni-page grid min-h-screen place-items-center px-4 py-8 text-[#211d24]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><BrandMark /></div>
        <Panel className="p-6">
          <h1 className="text-2xl font-semibold">دخول المدير</h1>
          <p className="mt-2 text-sm text-[#7f7482]">حساب الاختبار جاهز باسم علي.</p>
          <form onSubmit={submitLogin} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              البريد الإلكتروني
              <input dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-xl border border-[#e8e1dc] px-3 text-left outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              كلمة المرور
              <input dir="ltr" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-xl border border-[#e8e1dc] px-3 text-left outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15" />
            </label>
            <ActionButton type="submit" icon={LogIn} variant="dark" disabled={loading}>
              {loading ? "جار الدخول..." : "دخول لوحة التحكم"}
            </ActionButton>
          </form>
          <div className="mt-5 rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4 text-sm text-[#5f5861]">{message}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppLink href="/client" className="saloni-button rounded-xl border border-[#e8e1dc] bg-white px-3 py-2 text-sm font-semibold">تجربة العميل</AppLink>
            <AppLink href="/dashboard" className="saloni-button rounded-xl border border-[#e8e1dc] bg-white px-3 py-2 text-sm font-semibold">لوحة التحكم</AppLink>
          </div>
        </Panel>
      </div>
    </main>
  );
}

export function RegisterExperience() {
  const platform = useDemoPlatformState();
  const [created, setCreated] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("professional");
  const [form, setForm] = useState({
    salonName: "صالون لمسة علي",
    ownerName: demoOwner.name,
    email: demoOwner.email,
    phone: "+966 5X XXX XXXX",
    city: "الرياض",
    slug: "lamset-ali",
  });

  const selectedPlan = subscriptionPlans.find((plan) => plan.slug === selectedPlanSlug) ?? subscriptionPlans[1];
  const readiness = created ? 100 : Math.round(((activeStep + 1) / onboardingSteps.length) * 100);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function nextStep() {
    setActiveStep((current) => Math.min(current + 1, onboardingSteps.length - 1));
  }

  function createSalonTrial() {
    setCreated(true);
    platform.addEvent({
      title: "صالون جديد",
      body: `${form.salonName} على خطة ${selectedPlan.name}: تم تجهيز تجربة محلية وربط أولي.`,
      type: "tenant",
    });
  }

  return (
    <main dir="rtl" className="saloni-page min-h-screen px-4 py-6 text-[#211d24] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BrandMark />
          <div className="flex gap-2">
            <AppLink href="/admin" className="saloni-button rounded-xl border border-[#e8e1dc] bg-white px-4 py-2 text-sm font-semibold">إدارة المنصة</AppLink>
            <AppLink href="/auth/login" className="saloni-button rounded-xl bg-[#211d24] px-4 py-2 text-sm font-semibold text-white">تسجيل الدخول</AppLink>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <Panel className="p-5">
            <p className="text-sm font-semibold text-[#b9465a]">تجربة مجانية 14 يوم</p>
            <h1 className="mt-2 text-3xl font-semibold">إنشاء صالون جديد</h1>
            <p className="mt-3 text-sm leading-7 text-[#6f6571]">
              هذه رحلة التهيئة التي يحتاجها أي صالون قبل تشغيل الحجز، CRM، الدفع، الواتساب، والرابط الخاص.
            </p>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">جاهزية التهيئة</span>
                <strong>{readiness}%</strong>
              </div>
              <div className="mt-2"><ProgressBar value={readiness} tone="bg-[#8f9d84]" /></div>
            </div>

            <div className="mt-6 grid gap-2">
              {onboardingSteps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={cx(
                    "rounded-lg border p-3 text-right transition",
                    activeStep === index ? "border-[#211d24] bg-[#211d24] text-white" : "border-[#e8e1dc] bg-white text-[#211d24] hover:border-[#d8c7c3]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cx("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold", activeStep === index ? "bg-white text-[#211d24]" : "bg-[#fbf8f6] text-[#6f6571]")}>{index + 1}</span>
                    <span>
                      <span className="block font-semibold">{step.title}</span>
                      <span className={cx("text-xs", activeStep === index ? "text-white/70" : "text-[#7f7482]")}>{step.description}</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5">
            <Panel className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{onboardingSteps[activeStep].title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6f6571]">{onboardingSteps[activeStep].description}</p>
                </div>
                <StatusPill status={created ? "تم إنشاء الصالون" : "قيد التهيئة"} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["salonName", "اسم الصالون"],
                  ["ownerName", "اسم المالك"],
                  ["email", "البريد الإلكتروني"],
                  ["phone", "رقم الجوال"],
                  ["city", "المدينة"],
                  ["slug", "رابط الصالون"],
                ].map(([key, label]) => (
                  <label key={key} className="grid gap-2 text-sm font-semibold">
                    {label}
                    <input
                      dir={key === "email" || key === "slug" || key === "phone" ? "ltr" : "rtl"}
                      value={form[key as keyof typeof form]}
                      onChange={(event) => updateField(key as keyof typeof form, event.target.value)}
                      className="h-11 rounded-xl border border-[#e8e1dc] bg-white px-3 outline-none transition focus:border-[#c44f64] focus:ring-2 focus:ring-[#c44f64]/15"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {subscriptionPlans.map((plan) => (
                  <button
                    key={plan.slug}
                    type="button"
                    onClick={() => setSelectedPlanSlug(plan.slug)}
                    className={cx("saloni-button rounded-xl border p-4 text-right", selectedPlanSlug === plan.slug ? "border-[#f0cbd1] bg-[#fff5f6]" : "border-[#e8e1dc] bg-white")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong>{plan.name}</strong>
                    {selectedPlanSlug === plan.slug && <CheckCircle2 size={18} className="text-[#c44f64]" />}
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{plan.price} <span className="text-xs text-[#7f7482]">ر.س / شهر</span></p>
                    <p className="mt-2 text-xs leading-5 text-[#6f6571]">{plan.bestFor}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-4">
                <p className="font-semibold">حقول هذه المرحلة</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {onboardingSteps[activeStep].fields.map((field) => (
                    <span key={field} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#6f6571]">{field}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <ActionButton icon={Rocket} variant="dark" onClick={activeStep === onboardingSteps.length - 1 ? createSalonTrial : nextStep}>
                  {activeStep === onboardingSteps.length - 1 ? "إنشاء النسخة التجريبية" : "حفظ والمتابعة"}
                </ActionButton>
                <ActionButton icon={CheckCircle2} variant="green" onClick={createSalonTrial}>
                  إنشاء سريع للتجربة
                </ActionButton>
              </div>
            </Panel>

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Panel title="معاينة الاشتراك">
                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <MiniStat label="الخطة" value={selectedPlan.name} />
                  <MiniStat label="السعر الشهري" value={`${selectedPlan.price} ر.س`} />
                  <MiniStat label="التجربة" value={selectedPlan.trial} />
                  <MiniStat label="الموظفات" value={selectedPlan.staffLimit} />
                  <MiniStat label="الفروع" value={selectedPlan.branchLimit} />
                  <MiniStat label="الرابط" value={`${form.slug || "salon"}.saloni.sa`} />
                </div>
              </Panel>

              <Panel title="حالة الإنشاء">
                <div className="grid gap-3 p-5">
                  {[
                    created ? "تم تجهيز Tenant + Trial" : "بانتظار إنشاء Tenant",
                    "RLS يعتمد tenant_id",
                    "WhatsApp يحتاج مفاتيح Meta",
                    "Moyasar يحتاج مفاتيح إنتاج",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-xl border border-[#e8e1dc] bg-white p-3 text-sm">
                      <span className="font-semibold">{item}</span>
                      {index === 0 && created ? <CheckCircle2 size={18} className="text-[#17733a]" /> : <ShieldCheck size={18} className="text-[#8f9d84]" />}
                    </div>
                  ))}
                  {created && (
                    <AppLink href="/dashboard" className="saloni-button inline-flex min-h-11 items-center justify-center rounded-xl bg-[#211d24] px-4 text-sm font-semibold text-white">
                      فتح لوحة الصالون
                    </AppLink>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function StaffExperience() {
  const platform = useDemoPlatformState();
  const [checkedIn, setCheckedIn] = useState(false);
  const nextBookings = bookings.filter((booking) => booking.staffId === "noura" || booking.staffId === "sarah").slice(0, 3);

  return (
    <main dir="rtl" className="saloni-page min-h-screen text-[#211d24]">
      <header className="border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/dashboard/staff" className="saloni-button rounded-xl bg-[#211d24] px-4 py-2 text-sm font-semibold text-white">
            بوابة الموظفة
          </AppLink>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr]">
        <Panel className="p-5">
          <p className="text-sm font-semibold text-[#b9465a]">بوابة الموظفة</p>
          <Avatar initials="ن" />
          <h1 className="mt-4 text-2xl font-semibold">نورة العتيبي</h1>
          <p className="mt-1 text-sm text-[#7f7482]">خبيرة شعر - جدول اليوم</p>
          <div className="mt-5">
            <ActionButton
              icon={Clock3}
              variant={checkedIn ? "green" : "dark"}
              onClick={() => {
                setCheckedIn((value) => !value);
                platform.addEvent({
                  title: "بوابة الموظفة",
                  body: checkedIn ? "نورة العتيبي ألغت تسجيل الحضور التجريبي." : "نورة العتيبي سجلت حضورها لجدول اليوم.",
                  type: "staff",
                });
              }}
            >
              {checkedIn ? "تم تسجيل الحضور" : "تسجيل الحضور"}
            </ActionButton>
          </div>
        </Panel>
        <Panel title="مواعيدي القادمة">
          <div className="grid gap-3 p-5">
            {nextBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-[#e8e1dc] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{booking.client}</p>
                    <p className="mt-1 text-sm text-[#7f7482]">{booking.service} - {booking.time}</p>
                  </div>
                  <StatusPill status={booking.status} />
                </div>
                <p className="mt-3 rounded-xl bg-[#fbf8f6] p-3 text-sm text-[#5f5861]">{booking.notes}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

export function AdminExperience() {
  const platform = useDemoPlatformState();
  const [actionLog, setActionLog] = useState("جاهز: راقب الاشتراكات والتجارب والربط من لوحة مالك المنصة.");

  function logPlatformAction(message: string) {
    setActionLog(message);
    platform.addEvent({ title: "مالك المنصة", body: message, type: "tenant" });
  }

  return (
    <main dir="rtl" className="saloni-page min-h-screen text-[#211d24]">
      <header className="border-b border-[#e8e1dc] bg-[#fdfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark />
          <AppLink href="/dashboard" className="saloni-button rounded-xl bg-[#211d24] px-4 py-2 text-sm font-semibold text-white">
            لوحة الصالون
          </AppLink>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#b9465a]">لوحة مالك المنصة</p>
            <h1 className="mt-1 text-3xl font-semibold">إدارة الصالونات، الاشتراكات، والجاهزية</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6571]">
              هذه هي طبقة SaaS العليا: تتابع الصالونات، التجارب المجانية، حدود الخطط، حالة الربط، ومراحل المنتج قبل البيع الفعلي.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppLink href="/auth/register" className="saloni-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#211d24] px-4 text-sm font-semibold text-white">
              <UserPlus size={17} />
              إضافة صالون
            </AppLink>
            <ActionButton icon={ReceiptText} variant="light" onClick={() => logPlatformAction("تم تجهيز تقرير الاشتراكات الشهري للتصدير.")}>
              تقرير الاشتراكات
            </ActionButton>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-[#e8e1dc] bg-white/82 px-4 py-3 text-sm text-[#5f5861] shadow-[0_14px_34px_rgba(37,32,41,0.035)]">
          <span className="font-semibold text-[#211d24]">آخر إجراء:</span> {actionLog}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {platformMetrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              icon={[Building2, Gift, ReceiptText, ShieldCheck][index] ?? BarChart3}
            />
          ))}
        </div>

        <ProductionReadinessPanel onAction={logPlatformAction} />

        <MarketBenchmarkPanel onAction={logPlatformAction} />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
          <Panel title="الصالونات المشتركة" action={<ActionButton icon={Building2} variant="outline" onClick={() => logPlatformAction("تم تطبيق فلتر الصالونات التي تحتاج متابعة.")}>تحتاج متابعة</ActionButton>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#eadfdd] bg-[#fbf7f6] text-[#7f7482]">
                    {["الصالون", "الخطة", "الحالة", "التجربة/الدفع", "MRR", "الرابط", "الجاهزية", "إجراء"].map((head) => (
                      <th key={head} className="px-4 py-3 text-right font-semibold">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {platformTenants.map((tenant) => (
                    <tr key={tenant.subdomain} className="border-b border-[#f0e7e4]">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{tenant.name}</p>
                        <p className="mt-1 text-xs text-[#7f7482]">المالك: {tenant.owner}</p>
                      </td>
                      <td className="px-4 py-4">{tenant.plan}</td>
                      <td className="px-4 py-4"><StatusPill status={tenant.status} /></td>
                      <td className="px-4 py-4">{tenant.trial}</td>
                      <td className="px-4 py-4 font-semibold">{tenant.mrr}</td>
                      <td className="px-4 py-4" dir="ltr">{tenant.subdomain}</td>
                      <td className="px-4 py-4">
                        <div className="min-w-28">
                          <div className="mb-2 flex justify-between text-xs"><span>جاهزية</span><strong>{tenant.readiness}%</strong></div>
                          <ProgressBar value={tenant.readiness} tone={tenant.readiness > 80 ? "bg-[#8f9d84]" : "bg-[#d88782]"} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => logPlatformAction(`تم فتح ملف ${tenant.name}. الملاحظة: ${tenant.issues}.`)}
                          className="rounded-md border border-[#eadfdd] px-3 py-1.5 text-xs font-semibold"
                        >
                          فتح الملف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="صحة الربط">
            <div className="grid gap-3 p-5">
              {integrationChecks.map((check) => (
                <div key={check.name} className="rounded-lg border border-[#eadfdd] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{check.name}</p>
                      <p className="mt-1 text-xs leading-5 text-[#7f7482]">{check.note}</p>
                    </div>
                    <StatusPill status={check.status} />
                  </div>
                  <div className="mt-3"><ProgressBar value={check.value} tone={check.value > 80 ? "bg-[#8f9d84]" : "bg-[#d88782]"} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="خطط الاشتراك وحدود الميزات">
            <div className="grid gap-4 p-5 md:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <div key={plan.slug} className="rounded-lg border border-[#eadfdd] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{plan.name}</h2>
                      <p className="mt-1 text-xs leading-5 text-[#7f7482]">{plan.bestFor}</p>
                    </div>
                    <CreditCard size={19} className="text-[#b87776]" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{plan.price} <span className="text-xs text-[#7f7482]">ر.س</span></p>
                  <div className="mt-4 grid gap-2 text-xs">
                    <MiniStat label="الموظفات" value={plan.staffLimit} />
                    <MiniStat label="الفروع" value={plan.branchLimit} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="مراحل المنتج">
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {implementationPhases.map((phase) => (
                <div key={phase.phase} className="rounded-lg border border-[#eadfdd] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#211829] text-xs font-semibold text-white">{phase.phase}</span>
                      <strong>{phase.title}</strong>
                    </div>
                    <StatusPill status={phase.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#6f6571]">{phase.detail}</p>
                  <div className="mt-3"><ProgressBar value={phase.progress} tone="bg-[#b87776]" /></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function ProductionReadinessPanel({ onAction }: { onAction: (message: string) => void }) {
  const { readiness, error, refresh } = useSystemReadiness();
  const score = readiness?.score ?? Number(salesReadinessSummary.score.replace("%", ""));
  const blockers = readiness?.blockers ?? ["Supabase", "WhatsApp", "Payment"];
  const checks = readiness?.checks ?? [];

  return (
    <Panel
      title="جاهزية البيع والاستخدام اليومي"
      action={<StatusPill status={readiness?.productionReady ? "جاهز إنتاج" : "Demo Ready"} />}
      className="mt-5"
    >
      <div className="grid gap-5 p-5 xl:grid-cols-[340px_1fr]">
        <div className="rounded-xl border border-[#e8e1dc] bg-[#fbf8f6] p-5">
          <p className="text-sm font-semibold text-[#b9465a]">قرار الإطلاق</p>
          <p className="mt-3 text-4xl font-semibold text-[#211d24]">{score}%</p>
          <p className="mt-3 text-sm leading-6 text-[#5f5861]">
            {readiness?.decision ?? salesReadinessSummary.decision}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniStat label="موانع الإنتاج" value={String(blockers.length)} />
            <MiniStat label="وضع النظام" value={readiness?.mode === "production_ready" ? "Production" : "Demo"} />
          </div>
          {blockers.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#eadbc5] bg-[#fff9ef] p-3">
              <p className="text-xs font-semibold text-[#7d5a10]">لا تسلّم كتشغيل حي قبل إغلاق:</p>
              <p className="mt-2 text-xs leading-5 text-[#846d3d]">{blockers.join("، ")}</p>
            </div>
          )}
          {error && <p className="mt-3 text-xs font-semibold text-[#b2384a]">{error}</p>}
          <button
            type="button"
            onClick={() => {
              void refresh();
              onAction("تم تحديث فحص جاهزية البيع والاستخدام اليومي من API النظام.");
            }}
            className="saloni-button mt-4 w-full rounded-lg border border-[#eadfdd] bg-white px-3 py-2 text-xs font-semibold text-[#211d24]"
          >
            فحص الجاهزية الآن
          </button>
        </div>

        <div className="grid gap-4">
          {checks.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {checks.map((check) => (
                <button
                  key={check.id}
                  type="button"
                  onClick={() => onAction(`تمت مراجعة ${check.label}: ${check.ready ? "جاهز" : `ينقص ${check.missing.join("، ")}`}.`)}
                  className="saloni-button rounded-xl border border-[#e8e1dc] bg-white p-4 text-right"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{check.label}</p>
                    <StatusPill status={check.status} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#6f6571]">{check.detail}</p>
                  {check.missing.length > 0 && <p className="mt-2 break-words text-left text-[11px] font-semibold text-[#b2384a]" dir="ltr">{check.missing.join(", ")}</p>}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {launchReadinessItems.map((item) => (
              <button
                key={item.area}
                type="button"
                onClick={() => onAction(`خطوة جاهزية ${item.area}: ${item.action}`)}
                className="saloni-button rounded-xl border border-[#e8e1dc] bg-white p-4 text-right"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{item.area}</h3>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-1 text-xs font-semibold text-[#b9465a]">{item.owner}</p>
                <p className="mt-3 text-sm leading-6 text-[#5f5861]">{item.proof}</p>
                <p className="mt-3 rounded-lg bg-[#fbf8f6] p-3 text-xs leading-5 text-[#6f6571]">{item.action}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MarketBenchmarkPanel({ onAction }: { onAction: (message: string) => void }) {
  return (
    <Panel
      title="معايير المنافسين التي طبقناها"
      action={<StatusPill status="بحث سوق" />}
      className="mt-5"
    >
      <div className="grid gap-3 p-5 lg:grid-cols-5">
        {marketBenchmarks.map((benchmark) => (
          <button
            key={benchmark.vendor}
            type="button"
            aria-label={`تثبيت معيار ${benchmark.vendor}`}
            onClick={() => onAction(`تم تثبيت معيار ${benchmark.vendor}: ${benchmark.applied}.`)}
            className="saloni-button flex min-h-[220px] flex-col rounded-xl border border-[#e8e1dc] bg-white p-4 text-right"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbf0f2] text-[#b9465a]">
                <LifeBuoy size={18} />
              </span>
              <StatusPill status={benchmark.status} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#211d24]">{benchmark.vendor}</h3>
            <p className="mt-2 text-xs leading-5 text-[#6f6571]">{benchmark.lesson}</p>
            <div className="mt-3 rounded-lg border border-[#eee8e4] bg-[#fbf8f6] p-3">
              <p className="text-xs font-semibold text-[#b9465a]">التطبيق داخل Saloni Pro</p>
              <p className="mt-2 text-xs leading-5 text-[#5f5861]">{benchmark.applied}</p>
            </div>
            <p className="mt-auto pt-3 text-[11px] font-semibold text-[#7f7482]">{benchmark.surface}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}
