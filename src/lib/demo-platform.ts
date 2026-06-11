export const demoOwner = {
  name: "علي",
  email: "ali212@icloud.com",
  password: "123123",
  phoneLabel: "رقم المالك غير محفوظ داخل الكود",
  otp: "123123",
};

export const salon = {
  name: "لوكس بيوتي",
  slug: "luxe-beauty",
  city: "الرياض",
  district: "العليا",
  rating: "4.9",
};

export const services = [
  { id: "color", name: "لون جذور وعناية", duration: "95 دقيقة", price: 320, specialist: "نورة" },
  { id: "facial", name: "تنظيف بشرة متقدم", duration: "70 دقيقة", price: 260, specialist: "ريم" },
  { id: "nails", name: "مانيكير جل", duration: "55 دقيقة", price: 145, specialist: "سارة" },
  { id: "bride", name: "تحضير مناسبة", duration: "150 دقيقة", price: 690, specialist: "فريق الصالون" },
];

export const timeSlots = ["10:00", "11:30", "13:00", "16:30", "18:00"];

export const dashboardStats = [
  { label: "حجوزات اليوم", value: "42", note: "+18%" },
  { label: "إيراد مؤكد", value: "18.4K", note: "ر.س" },
  { label: "إشغال الفريق", value: "76%", note: "متوازن" },
  { label: "عملاء يحتاجون متابعة", value: "9", note: "واتساب" },
];

export const bookings = [
  { time: "10:00", client: "لمياء", service: "لون جذور", staff: "نورة", status: "مؤكد" },
  { time: "11:30", client: "دلال", service: "تنظيف بشرة", staff: "ريم", status: "وصلت" },
  { time: "13:00", client: "هيا", service: "قص أطراف", staff: "نورة", status: "انتظار" },
  { time: "16:30", client: "سارة", service: "لون + عناية", staff: "نورة", status: "عربون" },
];

export const customers = [
  { name: "سارة العبدالله", phone: "+966 55 248 1900", tier: "ذهبي", last: "قبل 8 أيام", spend: "8,240 ر.س" },
  { name: "لمى الحربي", phone: "+966 54 880 4102", tier: "فضي", last: "قبل 31 يوم", spend: "2,160 ر.س" },
  { name: "جود المالكي", phone: "+966 50 720 7750", tier: "VIP", last: "اليوم", spend: "14,380 ر.س" },
];

export const whatsappStatus = {
  mode: "demo",
  sender: "WhatsApp Business Cloud API",
  verificationCode: demoOwner.otp,
  requiredEnv: [
    "WHATSAPP_BUSINESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
  ],
};

export const pageMeta: Record<string, { title: string; description: string }> = {
  bookings: {
    title: "الحجوزات",
    description: "تقويم يومي واضح مع حالات الوصول، العربون، والتأكيد.",
  },
  calendar: {
    title: "التقويم",
    description: "عرض زمني للفريق مع منع التعارض وقفل الموعد أثناء الدفع.",
  },
  customers: {
    title: "العملاء",
    description: "CRM عملي: آخر زيارة، مستوى الولاء، الإنفاق، وملاحظات الجمال.",
  },
  services: {
    title: "الخدمات",
    description: "أسعار ومدد وخيارات قابلة للتعديل بدون فوضى تشغيلية.",
  },
  staff: {
    title: "الفريق",
    description: "جداول، إشغال، عمولات، وصلاحيات لكل موظفة.",
  },
  whatsapp: {
    title: "واتساب",
    description: "رموز تحقق، تذكيرات، رسائل ما بعد الزيارة، وحملات منظمة.",
  },
  loyalty: {
    title: "الولاء",
    description: "نقاط، مستويات، محافظ، وهدايا رقمية قابلة للقياس.",
  },
  reports: {
    title: "التقارير",
    description: "إيرادات، إشغال، عودة العملاء، ومؤشرات قرار أسبوعية.",
  },
  settings: {
    title: "الإعدادات",
    description: "هوية الصالون، سياسات العربون، وربط مزودي الخدمة.",
  },
  coupons: {
    title: "العروض",
    description: "كوبونات ذكية حسب الغياب، المناسبة، أو مستوى الولاء.",
  },
};
