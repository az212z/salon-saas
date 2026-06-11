import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Crown,
  Gift,
  LayoutDashboard,
  MessageCircle,
  Scissors,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";

export type PortalKey = "platform" | "salon" | "client" | "staff";

export type NavItem = {
  label: string;
  hint: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "الرئيسية", hint: "مؤشرات اليوم", icon: LayoutDashboard },
  { label: "الحجوزات", hint: "Timeline حي", icon: CalendarDays },
  { label: "العميلات", hint: "CRM وملفات الجمال", icon: UsersRound },
  { label: "الخدمات", hint: "أسعار ومدة", icon: Scissors },
  { label: "واتساب", hint: "قوالب وحملات", icon: MessageCircle },
  { label: "الولاء والهدايا", hint: "نقاط وبطاقات", icon: Gift },
  { label: "الفوترة", hint: "اشتراكات SaaS", icon: CreditCard },
  { label: "الإعدادات", hint: "هوية وسياسات", icon: Settings },
];

export const portalTabs: Array<{ key: PortalKey; label: string; icon: LucideIcon }> = [
  { key: "salon", label: "إدارة الصالون", icon: ClipboardList },
  { key: "client", label: "بوابة العميلة", icon: Sparkles },
  { key: "staff", label: "بوابة الموظفة", icon: BadgeCheck },
  { key: "platform", label: "مالك المنصة", icon: Crown },
];

export const tenantStats = [
  { label: "حجوزات اليوم", value: "42", delta: "+18%", tone: "mint" },
  { label: "إيرادات مؤكدة", value: "18.4K", delta: "+12%", tone: "amber" },
  { label: "إشغال الموظفات", value: "76%", delta: "متوازن", tone: "blush" },
  { label: "عميلات جدد", value: "11", delta: "+4", tone: "lilac" },
];

export const platformStats = [
  { label: "صالونات نشطة", value: "28", delta: "3 تجارب مجانية" },
  { label: "MRR", value: "36.8K", delta: "+9.5%" },
  { label: "استخدام واتساب", value: "12.4K", delta: "رسالة/شهر" },
  { label: "معدل التحويل", value: "64%", delta: "من التجربة" },
];

export const revenueData = [
  { day: "السبت", revenue: 9200, bookings: 24 },
  { day: "الأحد", revenue: 11800, bookings: 31 },
  { day: "الاثنين", revenue: 10400, bookings: 28 },
  { day: "الثلاثاء", revenue: 14200, bookings: 35 },
  { day: "الأربعاء", revenue: 13200, bookings: 33 },
  { day: "الخميس", revenue: 18400, bookings: 42 },
  { day: "الجمعة", revenue: 15600, bookings: 37 },
];

export const services = [
  {
    id: "color",
    name: "صبغة جذور + عناية",
    duration: 95,
    price: 320,
    category: "الشعر",
    demand: 88,
  },
  {
    id: "facial",
    name: "جلسة تنظيف بشرة VIP",
    duration: 70,
    price: 260,
    category: "العناية",
    demand: 73,
  },
  {
    id: "nails",
    name: "مانيكير جل فاخر",
    duration: 55,
    price: 145,
    category: "الأظافر",
    demand: 81,
  },
  {
    id: "package",
    name: "باقة العروس المصغرة",
    duration: 180,
    price: 790,
    category: "الباقات",
    demand: 64,
  },
];

export const staff = [
  {
    id: "nora",
    name: "نورة",
    role: "خبيرة شعر",
    occupancy: 84,
    commission: 1260,
    status: "متاحة حتى 6:00 م",
  },
  {
    id: "reem",
    name: "ريم",
    role: "أخصائية بشرة",
    occupancy: 68,
    commission: 940,
    status: "استراحة 2:30 م",
  },
  {
    id: "sara",
    name: "سارة",
    role: "أظافر وعناية",
    occupancy: 91,
    commission: 1480,
    status: "جدول ممتلئ",
  },
];

export const bookingSteps = [
  { label: "الخدمة", value: "صبغة جذور + عناية", state: "done" },
  { label: "الموظفة", value: "نورة أو أي متاحة", state: "done" },
  { label: "الوقت", value: "الخميس 4:30 م", state: "active" },
  { label: "الدفع", value: "عربون 30%", state: "next" },
];

export const timeline = [
  {
    staffId: "nora",
    staff: "نورة",
    appointments: [
      { time: "10:00", width: "28%", start: "4%", label: "لمياء - لون", status: "confirmed" },
      { time: "13:00", width: "22%", start: "38%", label: "هيا - قص", status: "waiting" },
      { time: "16:30", width: "30%", start: "65%", label: "سارة - صبغة", status: "deposit" },
    ],
  },
  {
    staffId: "reem",
    staff: "ريم",
    appointments: [
      { time: "11:30", width: "24%", start: "16%", label: "دلال - بشرة", status: "confirmed" },
      { time: "15:00", width: "26%", start: "55%", label: "منى - تنظيف", status: "completed" },
    ],
  },
  {
    staffId: "sara",
    staff: "سارة",
    appointments: [
      { time: "09:30", width: "20%", start: "2%", label: "جود - جل", status: "completed" },
      { time: "12:30", width: "24%", start: "32%", label: "أمل - أظافر", status: "confirmed" },
      { time: "17:00", width: "20%", start: "73%", label: "رنا - إزالة", status: "waiting" },
    ],
  },
];

export const customers = [
  {
    id: "c1",
    name: "سارة العبدالله",
    phone: "+966 55 248 1900",
    tier: "ذهبي",
    visits: 18,
    spend: 8240,
    points: 1480,
    lastVisit: "قبل 8 أيام",
    tags: ["VIP", "صبغة", "حساسية عطر"],
    beautyFile: {
      skin: "مختلطة",
      hairColor: "بني شوكولا 6.7",
      allergies: "تتحسس من العطور الثقيلة",
      favoriteServices: "صبغة جذور، عناية كيراتين",
    },
    history: [
      { date: "2026-06-03", service: "صبغة جذور + عناية", staff: "نورة", amount: 320 },
      { date: "2026-05-14", service: "جلسة عناية شعر", staff: "نورة", amount: 210 },
      { date: "2026-04-25", service: "مانيكير جل", staff: "سارة", amount: 145 },
    ],
    note: "تفضل مواعيد آخر اليوم. لا ترسل عروض صباحية.",
  },
  {
    id: "c2",
    name: "لمى الحربي",
    phone: "+966 54 880 4102",
    tier: "فضي",
    visits: 7,
    spend: 2160,
    points: 540,
    lastVisit: "قبل 31 يوم",
    tags: ["معرضة للفقدان", "بشرة"],
    beautyFile: {
      skin: "جافة",
      hairColor: "أسود طبيعي",
      allergies: "لا يوجد",
      favoriteServices: "تنظيف بشرة، ماسك ترطيب",
    },
    history: [
      { date: "2026-05-11", service: "تنظيف بشرة VIP", staff: "ريم", amount: 260 },
      { date: "2026-04-20", service: "ماسك ترطيب", staff: "ريم", amount: 160 },
    ],
    note: "مرشحة لحملة اشتقنا لك مع كوبون 15%.",
  },
  {
    id: "c3",
    name: "جود المالكي",
    phone: "+966 50 720 7750",
    tier: "VIP",
    visits: 26,
    spend: 14380,
    points: 2760,
    lastVisit: "اليوم",
    tags: ["VIP", "عروس", "هدايا"],
    beautyFile: {
      skin: "حساسة",
      hairColor: "أشقر رمادي 8.1",
      allergies: "منتجات الريتينول",
      favoriteServices: "باقة العروس، جل أظافر",
    },
    history: [
      { date: "2026-06-11", service: "باقة العروس المصغرة", staff: "سارة", amount: 790 },
      { date: "2026-05-30", service: "تجربة مكياج", staff: "نورة", amount: 450 },
    ],
    note: "تحتاج ملف مناسبة جماعي للعروس وصديقاتها.",
  },
];

export const whatsappAutomations = [
  { name: "تأكيد الحجز", active: true, sendAt: "فوري", segment: "كل الحجوزات" },
  { name: "تذكير 24 ساعة", active: true, sendAt: "قبل الموعد بيوم", segment: "مؤكد" },
  { name: "تذكير ساعتين", active: true, sendAt: "قبل الموعد بساعتين", segment: "لم يؤكد" },
  { name: "شكر + تقييم", active: true, sendAt: "بعد الاكتمال", segment: "مكتمل" },
  { name: "اشتقنا لك", active: false, sendAt: "30 يوم غياب", segment: "معرضة للفقدان" },
  { name: "عيد الميلاد", active: true, sendAt: "يوم الميلاد", segment: "مع تاريخ ميلاد" },
];

export const staffAgenda = [
  { time: "10:00", client: "لمياء", service: "صبغة جذور", prep: "خلطة 6.7 بدون عطر" },
  { time: "13:00", client: "هيا", service: "قص أطراف", prep: "تفضل مجفف بارد" },
  { time: "16:30", client: "سارة", service: "صبغة + عناية", prep: "حساسية عطر، استخدمي القناع الأخضر" },
];

export const plans = [
  { name: "أساسية", price: "299", limit: "موظفتان + تذكيرات", salons: 9 },
  { name: "احترافية", price: "599", limit: "ولاء وحملات بلا حد", salons: 14 },
  { name: "متقدمة", price: "999", limit: "فروع ودومين وتقارير", salons: 5 },
];
