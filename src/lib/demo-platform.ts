export const demoOwner = {
  name: "علي",
  email: "ali212@icloud.com",
  password: "123123",
  phoneLabel: "يضاف رقم المالك من إعدادات WhatsApp Business",
  otp: "123123",
};

export const salon = {
  name: "Saloni Pro",
  arabicName: "صالوني برو",
  slug: "luxe-beauty",
  city: "الرياض",
  district: "العليا",
  rating: "4.9",
  address: "طريق الأمير محمد بن عبدالعزيز، العليا",
  hours: "10:00 ص - 10:00 م",
  depositPercent: 30,
  vatPercent: 15,
};

export const services = [
  {
    id: "hair-color",
    name: "صبغة شعر احترافية",
    category: "الشعر",
    duration: "120 دقيقة",
    durationMinutes: 120,
    price: 350,
    deposit: 120,
    specialist: "نورة العتيبي",
    staff: ["noura", "sarah"],
    demand: 88,
    status: "نشطة",
  },
  {
    id: "hair-cut",
    name: "قص واستايل",
    category: "الشعر",
    duration: "60 دقيقة",
    durationMinutes: 60,
    price: 180,
    deposit: 60,
    specialist: "سارة الشهري",
    staff: ["sarah", "noura"],
    demand: 71,
    status: "نشطة",
  },
  {
    id: "facial-advanced",
    name: "تنظيف بشرة متقدم",
    category: "العناية",
    duration: "75 دقيقة",
    durationMinutes: 75,
    price: 260,
    deposit: 90,
    specialist: "ريم الحربي",
    staff: ["reem", "lina"],
    demand: 64,
    status: "نشطة",
  },
  {
    id: "gel-nails",
    name: "مانيكير جل",
    category: "الأظافر",
    duration: "55 دقيقة",
    durationMinutes: 55,
    price: 145,
    deposit: 45,
    specialist: "هند المالكي",
    staff: ["hind"],
    demand: 79,
    status: "نشطة",
  },
  {
    id: "bridal",
    name: "تحضير مناسبة",
    category: "باقة",
    duration: "150 دقيقة",
    durationMinutes: 150,
    price: 690,
    deposit: 220,
    specialist: "فريق الصالون",
    staff: ["noura", "reem", "sarah"],
    demand: 46,
    status: "موسمية",
  },
];

export const timeSlots = ["10:00", "11:30", "13:00", "16:30", "18:00", "19:30"];

export const staffMembers = [
  {
    id: "noura",
    name: "نورة العتيبي",
    role: "خبيرة شعر",
    initials: "ن",
    status: "متاحة",
    load: 78,
    bookings: 7,
    revenue: 7240,
    next: "16:30 صبغة شعر",
    rating: "4.9",
    skills: ["صبغة", "قص", "معالجة"],
  },
  {
    id: "sarah",
    name: "سارة الشهري",
    role: "ستايلست",
    initials: "س",
    status: "موعد الآن",
    load: 67,
    bookings: 6,
    revenue: 5360,
    next: "17:00 قص واستايل",
    rating: "4.8",
    skills: ["استايل", "قص", "هايلايت"],
  },
  {
    id: "reem",
    name: "ريم الحربي",
    role: "أخصائية بشرة",
    initials: "ر",
    status: "متاحة",
    load: 56,
    bookings: 5,
    revenue: 4180,
    next: "18:00 تنظيف بشرة",
    rating: "4.9",
    skills: ["بشرة", "مساج", "عناية"],
  },
  {
    id: "hind",
    name: "هند المالكي",
    role: "أظافر",
    initials: "هـ",
    status: "استراحة",
    load: 42,
    bookings: 4,
    revenue: 2160,
    next: "19:30 مانيكير جل",
    rating: "4.7",
    skills: ["جل", "عناية يدين", "تصميم"],
  },
  {
    id: "lina",
    name: "لينا القحطاني",
    role: "مساعدة",
    initials: "ل",
    status: "متاحة",
    load: 33,
    bookings: 3,
    revenue: 1280,
    next: "تجهيز غرفة 2",
    rating: "4.6",
    skills: ["تجهيز", "استقبال", "متابعة"],
  },
];

export const dashboardStats = [
  { label: "حجوزات اليوم", value: "56", note: "+7 عن أمس", tone: "green" },
  { label: "إيراد مؤكد", value: "24,580", note: "ر.س +18%", tone: "green" },
  { label: "نسبة الإشغال", value: "78%", note: "ضمن الهدف", tone: "amber" },
  { label: "عملاء جدد", value: "14", note: "+3 اليوم", tone: "blue" },
  { label: "رسائل واتساب", value: "352", note: "58 ردود", tone: "pink" },
];

export const bookings = [
  {
    id: "B-1042",
    time: "10:00",
    dateLabel: "اليوم",
    client: "أفنان الدوسري",
    phone: "+966 50 123 4567",
    serviceId: "hair-color",
    service: "صبغة شعر",
    staffId: "noura",
    staff: "نورة العتيبي",
    status: "مؤكد",
    payment: "عربون مدفوع",
    source: "تطبيق العميل",
    price: 350,
    notes: "تفضّل درجة شوكولاتة باردة",
  },
  {
    id: "B-1043",
    time: "11:30",
    dateLabel: "اليوم",
    client: "غدير المالكي",
    phone: "+966 55 481 1200",
    serviceId: "hair-cut",
    service: "قص واستايل",
    staffId: "sarah",
    staff: "سارة الشهري",
    status: "وصلت",
    payment: "مدفوع كامل",
    source: "رابط واتساب",
    price: 180,
    notes: "طلبت صور قبل وبعد",
  },
  {
    id: "B-1044",
    time: "13:00",
    dateLabel: "اليوم",
    client: "وجدان الشهراني",
    phone: "+966 54 810 2219",
    serviceId: "gel-nails",
    service: "مانيكير جل",
    staffId: "hind",
    staff: "هند المالكي",
    status: "قيد الانتظار",
    payment: "بانتظار العربون",
    source: "الموقع",
    price: 145,
    notes: "تأكيد قبل 12:30",
  },
  {
    id: "B-1045",
    time: "15:30",
    dateLabel: "اليوم",
    client: "حصة السبيعي",
    phone: "+966 56 320 9021",
    serviceId: "facial-advanced",
    service: "تنظيف بشرة",
    staffId: "reem",
    staff: "ريم الحربي",
    status: "مؤكد",
    payment: "عربون مدفوع",
    source: "تطبيق العميل",
    price: 260,
    notes: "بشرة حساسة",
  },
  {
    id: "B-1046",
    time: "17:00",
    dateLabel: "اليوم",
    client: "منيرة آل سعود",
    phone: "+966 53 210 8844",
    serviceId: "bridal",
    service: "تحضير مناسبة",
    staffId: "noura",
    staff: "فريق الصالون",
    status: "مؤكد",
    payment: "عربون مدفوع",
    source: "إحالة",
    price: 690,
    notes: "مناسبة عائلية مساء الخميس",
  },
];

export const customers = [
  {
    id: "C-221",
    name: "سارة العبدالله",
    phone: "+966 55 248 1900",
    tier: "ذهبي",
    last: "قبل 8 أيام",
    spend: "8,240 ر.س",
    points: 1250,
    visits: 18,
    nextAction: "إرسال عرض عناية بالشعر",
    tags: ["VIP", "صبغات", "تحضر مبكرا"],
  },
  {
    id: "C-222",
    name: "لمى الحربي",
    phone: "+966 54 880 4102",
    tier: "فضي",
    last: "قبل 31 يوم",
    spend: "2,160 ر.س",
    points: 420,
    visits: 7,
    nextAction: "تذكير بزيارة شهرية",
    tags: ["بشرة", "تحتاج متابعة"],
  },
  {
    id: "C-223",
    name: "جود المالكي",
    phone: "+966 50 720 7750",
    tier: "VIP",
    last: "اليوم",
    spend: "14,380 ر.س",
    points: 2410,
    visits: 29,
    nextAction: "دعوة برنامج المناسبات",
    tags: ["ولاء عالي", "مناسبات"],
  },
  {
    id: "C-224",
    name: "أفنان الدوسري",
    phone: "+966 50 123 4567",
    tier: "ذهبي",
    last: "اليوم",
    spend: "6,980 ر.س",
    points: 980,
    visits: 15,
    nextAction: "متابعة لون الشعر بعد 10 أيام",
    tags: ["صبغات", "واتساب"],
  },
];

export const loyaltyRows = [
  { tier: "VIP", customers: 42, points: "2,000+", reward: "جلسة عناية مجانية", color: "bg-[#211829]" },
  { tier: "ذهبي", customers: 118, points: "900+", reward: "خصم 20% على العناية", color: "bg-[#b87776]" },
  { tier: "فضي", customers: 260, points: "300+", reward: "ترقية خدمة مختارة", color: "bg-[#8f9d84]" },
];

export const coupons = [
  { code: "RETURN20", title: "عودة العميلات", audience: "لم تزُر منذ 30 يوم", discount: "20%", used: 58, revenue: "12,400 ر.س", status: "نشط" },
  { code: "BRIDE120", title: "حجز المناسبات", audience: "باقة تحضير مناسبة", discount: "120 ر.س", used: 19, revenue: "18,900 ر.س", status: "نشط" },
  { code: "NAILS15", title: "منتصف الأسبوع", audience: "الأظافر الثلاثاء/الأربعاء", discount: "15%", used: 44, revenue: "6,180 ر.س", status: "مجدول" },
];

export const campaigns = [
  { title: "عرض الصبغة", channel: "WhatsApp", sent: 352, delivered: 320, replies: 58, revenue: "9,840 ر.س", status: "نشطة" },
  { title: "تذكير المواعيد", channel: "WhatsApp", sent: 89, delivered: 86, replies: 17, revenue: "حماية الحضور", status: "تلقائية" },
  { title: "بعد الزيارة", channel: "WhatsApp", sent: 41, delivered: 40, replies: 12, revenue: "تقييمات", status: "تلقائية" },
];

export const whatsappTemplates = [
  { name: "رمز تحقق العميل", type: "OTP", status: "جاهز للتجربة", sample: "رمز التحقق لحجزك هو 123123" },
  { name: "تأكيد الموعد", type: "Transactional", status: "بانتظار موافقة Meta", sample: "تم تأكيد موعدك في صالوني برو" },
  { name: "تذكير قبل الزيارة", type: "Reminder", status: "بانتظار موافقة Meta", sample: "نذكرك بموعدك غدا الساعة 5:00" },
  { name: "حملة ولاء", type: "Marketing", status: "مسودة", sample: "لديك نقاط تكفي لمكافأة جديدة" },
];

export const reportMetrics = [
  { label: "الإيراد الأسبوعي", value: "142,800 ر.س", change: "+16%", progress: 82 },
  { label: "متوسط قيمة الحجز", value: "438 ر.س", change: "+12%", progress: 74 },
  { label: "عودة العميلات", value: "41%", change: "+6%", progress: 61 },
  { label: "إلغاء المواعيد", value: "3.8%", change: "-2%", progress: 18 },
];

export const weeklyRevenue = [
  { day: "السبت", revenue: 18400, bookings: 39 },
  { day: "الأحد", revenue: 21200, bookings: 44 },
  { day: "الاثنين", revenue: 19800, bookings: 41 },
  { day: "الثلاثاء", revenue: 24800, bookings: 52 },
  { day: "الأربعاء", revenue: 22600, bookings: 48 },
  { day: "الخميس", revenue: 36000, bookings: 61 },
];

export const calendarPlan = [
  { hour: "10:00", noura: "أفنان - صبغة", sarah: "متاح", reem: "تجهيز", hind: "متاح" },
  { hour: "11:30", noura: "متابعة لون", sarah: "غدير - قص", reem: "متاح", hind: "تجهيز" },
  { hour: "13:00", noura: "متاح", sarah: "استراحة", reem: "استشارة", hind: "وجدان - جل" },
  { hour: "15:30", noura: "متاح", sarah: "هايلايت", reem: "حصة - بشرة", hind: "متاح" },
  { hour: "17:00", noura: "منيرة - مناسبة", sarah: "قص", reem: "تعقيم", hind: "تصميم" },
  { hour: "19:30", noura: "تأكيد غد", sarah: "متاح", reem: "تنظيف", hind: "هند - جل" },
];

export const settingsGroups = [
  { title: "هوية الصالون", items: ["اسم الصالون", "الشعار", "رابط الحجز", "الفرع الافتراضي"] },
  { title: "سياسات الحجز", items: ["نسبة العربون", "مدة قفل الموعد", "سياسة الإلغاء", "الضريبة"] },
  { title: "التشغيل", items: ["ساعات العمل", "تقسيم المواعيد", "الموظفة الافتراضية", "إشعارات الإدارة"] },
  { title: "الربط", items: ["Supabase", "Moyasar", "WhatsApp Cloud API", "Netlify"] },
];

export const subscriptionPlans = [
  {
    slug: "basic",
    name: "أساسية",
    price: 299,
    yearly: 2990,
    staffLimit: "موظفتان",
    branchLimit: "فرع واحد",
    trial: "14 يوم تجربة مجانية",
    bestFor: "صالون صغير يبدأ بالحجز وCRM",
    features: ["الحجوزات", "CRM العملاء", "تذكيرات واتساب", "رابط حجز مستقل"],
    locked: ["الحملات", "بطاقات الهدايا", "دومين خاص"],
  },
  {
    slug: "professional",
    name: "احترافية",
    price: 599,
    yearly: 5990,
    staffLimit: "موظفات بلا حد",
    branchLimit: "فرع واحد",
    trial: "14 يوم تجربة مجانية",
    bestFor: "أفضل خيار لإطلاق SaaS مدفوع",
    features: ["كل مزايا الأساسية", "الولاء والنقاط", "الهدايا الرقمية", "حملات واتساب segmented"],
    locked: ["فروع متعددة", "تقارير متقدمة جدًا"],
  },
  {
    slug: "advanced",
    name: "متقدمة",
    price: 999,
    yearly: 9990,
    staffLimit: "بلا حد",
    branchLimit: "حتى 5 فروع",
    trial: "14 يوم تجربة مجانية",
    bestFor: "سلاسل الصالونات والفروع",
    features: ["كل مزايا الاحترافية", "دومين خاص", "تقارير متقدمة", "دعم أولوية", "فروع متعددة"],
    locked: [],
  },
];

export const platformMetrics = [
  { label: "الصالونات المشتركة", value: "198", note: "8 صالونات جديدة هذا الشهر" },
  { label: "التجارب الجارية", value: "23", note: "تنتهي خلال 7 أيام" },
  { label: "MRR المتوقع", value: "47,850 ر.س", note: "+12.4% عن الشهر السابق" },
  { label: "متوسط جاهزية الربط", value: "94%", note: "Supabase وVercel جاهزة" },
];

export const platformTenants = [
  {
    name: "صالوني برو - الرياض",
    owner: "علي",
    plan: "احترافية",
    status: "نشط",
    trial: "ينتهي بعد 11 يوم",
    mrr: "599 ر.س",
    subdomain: "luxe-beauty.saloni.sa",
    readiness: 98,
    issues: "لا يوجد",
  },
  {
    name: "Belleza Spa",
    owner: "نورة",
    plan: "متقدمة",
    status: "نشط",
    trial: "اشتراك مدفوع",
    mrr: "999 ر.س",
    subdomain: "belleza.saloni.sa",
    readiness: 93,
    issues: "قالبان بانتظار Meta",
  },
  {
    name: "Lume Nails",
    owner: "سارة",
    plan: "أساسية",
    status: "تجربة",
    trial: "3 أيام متبقية",
    mrr: "299 ر.س",
    subdomain: "lume.saloni.sa",
    readiness: 76,
    issues: "Moyasar غير مفعّل",
  },
  {
    name: "Glow Beauty",
    owner: "ريم",
    plan: "احترافية",
    status: "مراجعة",
    trial: "تمديد 7 أيام",
    mrr: "599 ر.س",
    subdomain: "glow.saloni.sa",
    readiness: 64,
    issues: "بيانات الخدمات ناقصة",
  },
];

export const integrationChecks = [
  { name: "Supabase PostgreSQL + Auth + RLS", status: "جاهز بالبنية", value: 100, note: "tenant_id وRLS في المخطط" },
  { name: "Vercel Wildcard Subdomains", status: "جاهز للنشر", value: 92, note: "يتطلب ربط الدومين النهائي" },
  { name: "WhatsApp Business Cloud API", status: "ينتظر مفاتيح Meta", value: 54, note: "OTP والحملات تعمل Demo" },
  { name: "Moyasar / Tap Payments", status: "ينتظر مفاتيح الدفع", value: 58, note: "موجود في الكود كتكامل قابل للتهيئة" },
  { name: "PWA + Mobile RTL", status: "جاهز", value: 88, note: "manifest وواجهة متجاوبة" },
];

export const implementationPhases = [
  { phase: "0", title: "البنية متعددة المستأجرين", status: "مكتملة", progress: 100, detail: "مخطط Supabase، خطط الاشتراك، tenant_id، RLS، الأدوار." },
  { phase: "1", title: "محرك الحجوزات", status: "مكتملة جزئيا", progress: 72, detail: "منع التعارض وقفل الموعد موجودان في migration؛ واجهة demo تعمل." },
  { phase: "2", title: "بوابة العميل", status: "جاهزة للعرض", progress: 82, detail: "حجز متعدد الخطوات، OTP تجريبي، ملف عميلة وولاء." },
  { phase: "3", title: "لوحة الصالون + CRM", status: "جاهزة للعرض", progress: 84, detail: "تقويم، حجوزات، عملاء، خدمات، فريق، تقارير، واتساب." },
  { phase: "4", title: "بوابة الموظفات", status: "MVP", progress: 62, detail: "جدول اليوم وتسجيل حضور وملاحظات الخدمة." },
  { phase: "5", title: "واتساب والأتمتة", status: "ينتظر ربط حقيقي", progress: 55, detail: "القوالب والحملات موجودة؛ الإرسال يحتاج Meta." },
  { phase: "6", title: "الولاء والهدايا والعروض", status: "جاهزة للعرض", progress: 76, detail: "نقاط، مستويات، كوبونات، بطاقات هدايا في المخطط." },
  { phase: "7", title: "طبقة SaaS والدفع", status: "قيد التقوية", progress: 68, detail: "لوحة مالك المنصة، التجارب، الخطط، الفوترة، Subdomains." },
];

export const onboardingSteps = [
  {
    title: "هوية الصالون",
    description: "الاسم، الشعار، المدينة، رابط الحجز، والألوان.",
    fields: ["اسم الصالون", "اسم المالك", "البريد", "الجوال", "المدينة", "العنوان"],
  },
  {
    title: "اختيار الخطة",
    description: "أساسية أو احترافية أو متقدمة مع تجربة مجانية 14 يوم.",
    fields: ["حد الموظفات", "حد الفروع", "ميزات الولاء", "الحملات", "الدومين الخاص"],
  },
  {
    title: "الخدمات والموظفات",
    description: "استيراد الخدمات، ربط الموظفات بالخدمات، وجدولة الدوام.",
    fields: ["تصنيفات", "أسعار", "مدد", "عمولات", "إجازات"],
  },
  {
    title: "الدفع والعربون",
    description: "Moyasar أو Tap، طرق الدفع، العربون، وسياسة الإلغاء.",
    fields: ["مدى", "Apple Pay", "دفع كامل", "عربون", "في الصالون"],
  },
  {
    title: "واتساب والإشعارات",
    description: "OTP، تأكيد الحجز، التذكيرات، الشكر، الاسترجاع، والحملات.",
    fields: ["Phone Number ID", "Verify Token", "قوالب Meta", "موافقة تسويقية"],
  },
  {
    title: "Subdomain والدومين",
    description: "رابط salon-name.saloni.sa أو دومين خاص للخطة المتقدمة.",
    fields: ["Slug", "Custom domain", "SSL", "Vercel rewrite"],
  },
];

export const whatsappStatus = {
  mode: "demo",
  sender: "WhatsApp Business Cloud API",
  verificationCode: demoOwner.otp,
  requiredEnv: [
    "WHATSAPP_BUSINESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_APP_SECRET",
  ],
};

export const pageMeta: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: "لوحة التحكم",
    description: "ملخص حي للحجوزات، الإيراد، الفريق، والرسائل من مكان واحد.",
  },
  bookings: {
    title: "الحجوزات",
    description: "إدارة كاملة للحجز من التأكيد حتى الوصول والدفع.",
  },
  calendar: {
    title: "التقويم",
    description: "عرض زمني للفريق يمنع التعارض ويكشف الفجوات التشغيلية.",
  },
  customers: {
    title: "العملاء",
    description: "CRM عملي: آخر زيارة، مستوى الولاء، الإنفاق، وملاحظات الجمال.",
  },
  services: {
    title: "الخدمات",
    description: "أسعار ومدد وعربون وطاقم لكل خدمة بدون فوضى تشغيلية.",
  },
  staff: {
    title: "الفريق",
    description: "جداول، إشغال، صلاحيات، وأداء لكل موظفة.",
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
