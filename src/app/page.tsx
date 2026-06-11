'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// بيانات الشهادات (Testimonials)
// ==========================================
const testimonials = [
  {
    salon: 'لوكس بيوتي',
    owner: 'منال الشمري',
    city: 'جدة',
    quote: 'سالوني غيّر طريقة إدارتنا تماماً. الحجوزات صارت أسهل، العملاء أسعد، والإيرادات زادت 40% خلال الشهر الأول!',
    rating: 5,
    color: '#8B5CF6',
    avatar: 'ML',
    benefit: '+40% إيرادات',
  },
  {
    salon: 'صالون نورة',
    owner: 'نورة العتيبي',
    city: 'جدة',
    quote: 'أخيراً صار عندي نظام يدير كل شي — من الحجوزات للواتساب للنقاط. العملاء يحبون نظام الولاء ويرجعون أكثر!',
    rating: 5,
    color: '#EC4899',
    avatar: 'Nع',
    benefit: '+65% عملاء راجعين',
  },
  {
    salon: 'غلام ستوديو',
    owner: 'لمياء الحربي',
    city: 'الرياض',
    quote: 'نظام واتساب الذكي وفر عليّ ساعات من المتابعة. التذكيرات التلقائية قلّلت عدم الحضور بنسبة 70%. كل صالون يحتاج هذا!',
    rating: 5,
    color: '#F59E0B',
    avatar: 'لح',
    benefit: '-70% عدم حضور',
  },
];

// ==========================================
// مزايا التطوير والتحسين
// ==========================================
const improvements = [
  {
    icon: '🧠',
    title: 'نظام ذكي متطور',
    items: [
      'محرك حجوزات ذكي بمنع التعارض',
      'توزيع تلقائي على الموظفات',
      'قائمة انتظار ذكية مع إشعار تلقائي',
      'تحليلات تنبؤية للطلب',
    ],
  },
  {
    icon: '📱',
    title: 'واتساب بزنس متكامل',
    items: [
      '7 رسائل تلقائية (تأكيد، تذكير، شكر، تقييم...)',
      'حملات تسويقية موجهة',
      'قوالب قابلة للتخصيص',
      'تقارير وصول وقراءة',
    ],
  },
  {
    icon: '💎',
    title: 'نظام ولاء متقدم',
    items: [
      '4 مستويات: برونزي، فضي، ذهبي، VIP',
      'نقاط لكل ريال تنفق',
      'بطاقات هدايا رقمية',
      'كوبونات وعروض ذكية',
      'برنامج إحالة مع مكافآت',
    ],
  },
  {
    icon: '🎨',
    title: 'هوية قابلة للتخصيص',
    items: [
      'نطاق فرعي خاص (salon.saloni.sa)',
      'ألوان وشعار مخصصة',
      'صفحة صالون احترافية',
      'دعم عربي/إنجليزي',
    ],
  },
  {
    icon: '📊',
    title: 'تحليلات متقدمة',
    items: [
      'لوحة قائد مع KPIs حية',
      'تتبع MTBF/MTTR للموظفات',
      'تقارير مخصصة بالـ PDF',
      'رسوم بيانية تفاعلية',
    ],
  },
  {
    icon: '💳',
    title: 'دفع سعودي متكامل',
    items: [
      'مدى، فيزا، ماستركارد',
      'Apple Pay و STC Pay',
      'عربون أو دفع كامل حسب سياسة الصالون',
      'مزامنة تلقائية مع الحجوزات',
    ],
  },
];

// ==========================================
// مقارنة الخطط
// ==========================================
const plans = [
  {
    name: 'أساسية',
    nameEn: 'Basic',
    price: 299,
    yearly: 2990,
    color: '#6B7280',
    popular: false,
    features: [
      { text: 'حجوزات غير محدودة', included: true },
      { text: 'نظام CRM كامل', included: true },
      { text: 'واتساب تذكيرات', included: true },
      { text: 'صفحة صالون', included: true },
      { text: 'حتى 2 موظفات', included: true },
      { text: 'نظام ولاء', included: false },
      { text: 'بطاقات هدايا', included: false },
      { text: 'حملات واتساب', included: false },
      { text: 'تقارير متقدمة', included: false },
      { text: 'دعم أولوية', included: false },
    ],
  },
  {
    name: 'احترافية',
    nameEn: 'Professional',
    price: 599,
    yearly: 5990,
    color: '#8B5CF6',
    popular: true,
    features: [
      { text: 'كل مزايا الأساسية', included: true },
      { text: 'موظفات غير محدودات', included: true },
      { text: 'نظام ولاء متقدم', included: true },
      { text: 'بطاقات هدايا رقمية', included: true },
      { text: 'حملات واتساب تسويقية', included: true },
      { text: 'كوبونات وعروض', included: true },
      { text: 'تقارير متقدمة', included: false },
      { text: 'دعم أولوية', included: false },
      { text: 'فرع واحد فقط', included: true },
    ],
  },
  {
    name: 'متقدمة',
    nameEn: 'Advanced',
    price: 999,
    yearly: 9990,
    color: '#F59E0B',
    popular: false,
    features: [
      { text: 'كل مزايا الاحترافية', included: true },
      { text: 'حتى 5 فروع', included: true },
      { text: 'تقارير متقدمة + PDF', included: true },
      { text: 'دعم أولوية VIP', included: true },
      { text: 'نطاق مخصص', included: true },
      { text: 'API متكامل', included: true },
      { text: 'تحليلات تنبؤية', included: true },
      { text: 'مدير حساب مخصص', included: true },
    ],
  },
];

// ==========================================
// FAQ
// ==========================================
const faqs = [
  { q: 'هل أحتاج خبرة تقنية لاستخدام سالوني؟', a: 'لا! سالوني مصمم ليكون سهل الاستخدام. تقدري تبدأين خلال 5 دقايق بدون أي خبرة تقنية.' },
  { q: 'هل العملاء يحتاجون تحميل تطبيق؟', a: 'لا، العملاء يحجزون من رابط الصالون مباشرة في المتصفح. الصفحة تعمل كتطبيق على الجوال.' },
  { q: 'كم مدة التجربة المجانية؟', a: '14 يوم مجاناً بدون بطاقة ائتمان. وبعدها تختارين الخطة المناسبة.' },
  { q: 'هل يدعم سالوني أكثر من فرع؟', a: 'نعم! خطة متقدمة تدعم حتى 5 فروع مع إدارة مركزية لكل فروعك.' },
  { q: 'كيف تختلفون عن المنافسين؟', a: 'سالوني مصمم خصيصاً للسوق السعودي — دعم عربي كامل، واتساب بزنس، مدى، Apple Pay، وخدمة عملاء محلية.' },
  { q: 'هل أقدر ألغي اشتراكي بأي وقت؟', a: 'طبعاً! تقدري تلغين بأي وقت بدون رسوم إضافية. بياناتك تظل محفوظة 30 يوم بعد الإلغاء.' },
];

// ==========================================
// أرقام المنصة
// ==========================================
const stats = [
  { number: '500+', label: 'صالون نشط' },
  { number: '50K+', label: 'حجز شهرياً' },
  { number: '98%', label: 'رضا العملاء' },
  { number: '40%', label: 'زيادة الإيرادات' },
];

export default function MarketingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ======== NAVBAR ======== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-bl from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              س
            </div>
            <span className="text-xl font-bold bg-gradient-to-l from-purple-600 to-pink-500 bg-clip-text text-transparent">
              سالوني
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-purple-600 transition-colors">المزايا</a>
            <a href="#improvements" className="hover:text-purple-600 transition-colors">ما الجديد</a>
            <a href="#testimonials" className="hover:text-purple-600 transition-colors">الآراء</a>
            <a href="#pricing" className="hover:text-purple-600 transition-colors">الأسعار</a>
            <a href="#faq" className="hover:text-purple-600 transition-colors">أسئلة شائعة</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">دخول</a>
            <a href="/auth/register" className="px-4 py-2 bg-gradient-to-l from-purple-600 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
              ابدأ مجاناً
            </a>
          </div>
        </div>
      </nav>

      {/* ======== HERO ======== */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-sm text-purple-700 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>الإصدار 2.0 — مزايا ذكية جديدة</span>
              <span>🎉</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              أدِري صالونك{' '}
              <span className="bg-gradient-to-l from-purple-600 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                بذكاء
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة سعودية متكاملة لإدارة الصالونات — حجوزات ذكية، واتساب تلقائي، نظام ولاء، 
              مدفوعات مدى و Apple Pay. كل ما تحتاجينه في مكان واحد.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl text-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5">
                ابدأ تجربتك المجانية — 14 يوم 🚀
              </a>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-lg hover:border-purple-300 hover:text-purple-600 transition-all">
                اكتشف المزايا ←
              </a>
            </div>

            <p className="text-sm text-gray-400">
              بدون بطاقة ائتمان • إعداد في 5 دقايق • دعم عربي كامل
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white/60 backdrop-blur rounded-xl border border-gray-100">
                <div className="text-3xl font-bold bg-gradient-to-l from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section id="features" className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              كل ما يحتاجه صالونك
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              من الحجز الأول للعميلة الـ VIP — سالوني يدير كل شيء
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📅', title: 'حجوزات ذكية', desc: 'محرك حجوزات متقدم بمنع التعارض وتوزيع تلقائي وقائمة انتظار ذكية' },
              { icon: '📱', title: 'واتساب تلقائي', desc: '7 رسائل تلقائية — تأكيد، تذكير، شكر، تقييم، إشعار انتظار، عيد ميلاد، اشتقنالك' },
              { icon: '👥', title: 'CRM متكامل', desc: 'ملف جمال لكل عميلة — بشرة، شعر، حساسيات، ملاحظات، تفضيلات' },
              { icon: '💎', title: 'نظام ولاء', desc: '4 مستويات برونزي → VIP مع نقاط وكوبونات وبطاقات هدايا وإحالات' },
              { icon: '💳', title: 'دفع سعودي', desc: 'مدى، فيزا، ماستركارد، Apple Pay، STC Pay — عربون أو دفع كامل' },
              { icon: '📊', title: 'لوحة قائد', desc: 'KPIs حية، تقارير PDF، تحليل اتجاهات، تتبع أداء الموظفات' },
              { icon: '🎨', title: 'هوية مخصصة', desc: 'نطاق فرعي، ألوان وشعار، صفحة صالون احترافية، معرض صور' },
              { icon: '👩‍🎨', title: 'بوابة موظفات', desc: 'جدول يومي، حالة الخدمة، طلبات إجازة، تقييمات وتحفيز' },
              { icon: '🏢', title: 'إدارة فروع', desc: 'حتى 5 فروع مع إدارة مركزية وتقارير موحدة' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== IMPROVEMENTS ======== */}
      <section id="improvements" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-sm text-amber-700 mb-4">
              <span>🆕</span>
              <span>الإصدار 2.0</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              مزايا تطوير وتحسين جديدة
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              طورنا المنصة بشكل كبير — هذي أبرز التحسينات
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {improvements.map((imp, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100">
                <div className="text-3xl mb-3">{imp.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{imp.title}</h3>
                <ul className="space-y-2">
                  {imp.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section id="testimonials" className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              صالونات تأكدت النتيجة 💪
            </h2>
            <p className="text-lg text-gray-600">
              3 صالونات تجريبية جرّبت سالوني — وهذي تجربتهم
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.owner}</div>
                    <div className="text-xs text-gray-500">{t.salon} — {t.city}</div>
                  </div>
                  <div className="mr-auto px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: t.color }}>
                    {t.benefit}
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, r) => (
                    <span key={r} className="text-amber-400">★</span>
                  ))}
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">"{t.quote}"</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🎁 كل صالون تجريبي يحصل على شهرين مجاناً —{' '}
              <a href="/auth/register" className="text-purple-600 font-medium hover:underline">انضمي الآن</a>
            </p>
          </div>
        </div>
      </section>

      {/* ======== PRICING ======== */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              خطط تناسب كل صالون
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              ابدئي مجاناً — بدون بطاقة ائتمان
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setBilling('monthly')}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', 
                  billing === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                )}
              >
                شهري
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', 
                  billing === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                )}
              >
                سنوي
                <span className="mr-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">وفر 17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={cn(
                'relative p-6 rounded-2xl border-2 transition-all',
                plan.popular 
                  ? 'border-purple-500 bg-purple-50/50 shadow-xl shadow-purple-500/10 scale-105' 
                  : 'border-gray-200 bg-white'
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-l from-purple-600 to-pink-500 text-white text-xs font-bold rounded-full">
                    الأكثر طلباً ⭐
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.nameEn}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {billing === 'monthly' ? plan.price : Math.round(plan.yearly / 12)}
                    </span>
                    <span className="text-gray-500"> ر.س/شهر</span>
                  </div>
                  {billing === 'yearly' && (
                    <p className="text-sm text-green-600 mt-1">
                      {plan.yearly} ر.س/سنة — وفري {plan.price * 12 - plan.yearly} ر.س
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className={cn('flex items-center gap-2 text-sm', f.included ? 'text-gray-700' : 'text-gray-400')}>
                      <span className={f.included ? 'text-green-500' : 'text-gray-300'}>
                        {f.included ? '✓' : '✗'}
                      </span>
                      <span className={f.included ? '' : 'line-through'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <a href="/auth/register" className={cn(
                  'block w-full py-3 rounded-xl text-center font-bold transition-all',
                  plan.popular
                    ? 'bg-gradient-to-l from-purple-600 to-pink-500 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}>
                  ابدأ التجربة المجانية
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            14 يوم تجربة مجانية • إلغاء بأي وقت • دعم عربي 24/7
          </p>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section id="faq" className="py-20 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              أسئلة شائعة
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-right"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <span className={cn(
                    'text-gray-400 transition-transform duration-200',
                    openFaq === i ? 'rotate-180' : ''
                  )}>
                    ▼
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative p-8 sm:p-12 bg-gradient-to-bl from-purple-600 via-purple-700 to-pink-600 rounded-3xl text-white text-center overflow-hidden">
            <div className="absolute inset-0 -z-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                جاهزة تبدأين؟
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                انضمي لأكثر من 500 صالون trust سالوني في إدارة أعمالهم. ابدئي تجربتك المجانية اليوم!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 font-bold rounded-xl text-lg hover:shadow-xl transition-all">
                  ابدأ التجربة المجانية 🚀
                </a>
                <a href="https://wa.me/966500000000" className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-xl text-lg hover:bg-white/20 transition-all">
                  تواصلي عبر واتساب 💬
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-bl from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  س
                </div>
                <span className="text-xl font-bold">سالوني</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                منصة سعودية متكاملة لإدارة الصالونات والسبا. 
                حجوزات ذكية، واتساب تلقائي، نظام ولاء، ومدفوعات سعودية.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">المنتج</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">المزايا</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">الأسعار</a></li>
                <li><a href="#" className="hover:text-white transition-colors">التحديثات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">التكاملات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الشركة</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">عن سالوني</a></li>
                <li><a href="#" className="hover:text-white transition-colors">المدونة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الوظائف</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تواصلي معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">دليل المستخدم</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">حالة النظام</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 سالوني. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a>
              <a href="#" className="hover:text-white transition-colors">ملفات الارتباط</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}