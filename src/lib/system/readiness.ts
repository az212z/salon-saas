type RequiredFor = "sales_demo" | "daily_use" | "production";

type ReadinessCheck = {
  id: string;
  label: string;
  requiredFor: RequiredFor;
  ready: boolean;
  status: string;
  detail: string;
  missing: string[];
};

const placeholderFragments = [
  "your-",
  "example",
  "dummy",
  "localhost",
  "test-key",
  "changeme",
  "replace",
];

function envLooksConfigured(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return false;
  return !placeholderFragments.some((fragment) => value.toLowerCase().includes(fragment));
}

function envFlagEnabled(name: string, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return !["0", "false", "off", "disabled", "no"].includes(value);
}

function missing(names: string[]) {
  return names.filter((name) => !envLooksConfigured(name));
}

function checkRequired(id: string, label: string, requiredFor: RequiredFor, names: string[], detail: string): ReadinessCheck {
  const missingKeys = missing(names);
  const ready = missingKeys.length === 0;

  return {
    id,
    label,
    requiredFor,
    ready,
    status: ready ? "جاهز" : "ينتظر إعداد",
    detail,
    missing: missingKeys,
  };
}

function checkWhatsApp(): ReadinessCheck {
  const enabled = envFlagEnabled("WHATSAPP_ENABLED", false);

  if (!enabled) {
    return {
      id: "whatsapp",
      label: "WhatsApp Business Cloud API",
      requiredFor: "production",
      ready: true,
      status: "معطل بطلبك",
      detail: "واتساب مستثنى من التشغيل الحالي. لن يحاول النظام إرسال OTP أو حملات من Meta حتى يتم تفعيل WHATSAPP_ENABLED=true.",
      missing: [],
    };
  }

  return checkRequired(
    "whatsapp",
    "WhatsApp Business Cloud API",
    "production",
    ["WHATSAPP_BUSINESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_APP_SECRET"],
    "مطلوب لإرسال OTP والتذكيرات والحملات من رقم واتساب أعمال معتمد.",
  );
}

export function getSystemReadiness() {
  const moyasarReady = envLooksConfigured("MOYASAR_SECRET_KEY") && envLooksConfigured("MOYASAR_PUBLIC_KEY");
  const checks: ReadinessCheck[] = [
    {
      id: "demo",
      label: "العرض التجريبي",
      requiredFor: "sales_demo",
      ready: true,
      status: "جاهز",
      detail: "صفحات العرض والعميل والمدير والموظفة تعمل ببيانات demo محلية.",
      missing: [],
    },
    checkRequired(
      "supabase",
      "قاعدة البيانات والمصادقة",
      "daily_use",
      ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      "مطلوبة لأي تشغيل يومي حقيقي حتى تحفظ الحجوزات والعملاء والصلاحيات.",
    ),
    checkWhatsApp(),
    {
      id: "payments",
      label: "بوابة الدفع Moyasar",
      requiredFor: "production",
      ready: moyasarReady,
      status: moyasarReady ? "جاهز" : "ينتظر إعداد",
      detail: "مطلوبة للعربون وحماية عدم الحضور. Tap غير منفذ حاليا؛ المسار الإنتاجي الحالي هو Moyasar.",
      missing: moyasarReady ? [] : missing(["MOYASAR_SECRET_KEY", "MOYASAR_PUBLIC_KEY"]),
    },
    checkRequired(
      "app-url",
      "رابط التطبيق والدومين",
      "production",
      ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_ROOT_DOMAIN"],
      "مطلوب للروابط، Webhooks، الرسائل، ودومينات الصالونات.",
    ),
  ];

  const requiredChecks = checks.filter((item) => item.requiredFor !== "sales_demo");
  const readyCount = checks.filter((item) => item.ready).length;
  const productionBlockers = requiredChecks.filter((item) => !item.ready);
  const score = Math.round((readyCount / checks.length) * 100);
  const productionReady = productionBlockers.length === 0;

  return {
    generatedAt: new Date().toISOString(),
    mode: productionReady ? "production_ready" : "demo_ready",
    productionReady,
    score,
    checks,
    blockers: productionBlockers.map((item) => item.label),
    decision: productionReady
      ? "جاهز لتشغيل صالون حقيقي بعد اختبار Webhooks وحجز مدفوع كامل."
      : "جاهز للبيع كعرض وتجربة، لكن التشغيل اليومي الحقيقي ينتظر مفاتيح الإنتاج الموضحة.",
  };
}
