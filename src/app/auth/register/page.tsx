'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: '📅', label: 'حجوزات ذكية' },
  { icon: '👥', label: 'CRM متكامل' },
  { icon: '💬', label: 'واتساب تلقائي' },
  { icon: '🏆', label: 'نظام ولاء' },
  { icon: '📊', label: 'تقارير' },
  { icon: '💳', label: 'دفع إلكتروني' },
];

const PLANS = [
  { slug: 'basic', name: 'أساسية', price: 299, period: 'شهري', features: ['حجوزات غير محدودة', 'CRM عملاء', 'موظفتان', 'تذكيرات واتساب'] },
  { slug: 'professional', name: 'احترافية', price: 599, period: 'شهري', features: ['كل مميزات الأساسية', 'نقاط ولاء وهدايا', 'موظفات بلا حد', 'حملات واتساب'], highlight: true },
  { slug: 'advanced', name: 'متقدمة', price: 999, period: 'شهري', features: ['كل مميزات الاحترافية', 'فروع متعددة', 'دومين خاص', 'تقارير متقدمة + AI'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_password: '',
    salon_name: '',
    salon_slug: '',
    plan_id: '',
    primary_color: '#8B5CF6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'خطأ في التسجيل');
        return;
      }

      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                s <= step ? 'bg-gradient-to-bl from-purple-600 to-pink-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
              )}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={cn('w-12 h-1', s < step ? 'bg-purple-500' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">معلوماتك الشخصية</h2>
              <p className="text-gray-500 mb-6">الخطوة ١ من ٣ — بيانات مالك الصالون</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={(e) => setForm(prev => ({ ...prev, owner_name: e.target.value }))}
                    placeholder="مثال: سارة محمد"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={form.owner_email}
                    onChange={(e) => setForm(prev => ({ ...prev, owner_email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-600">🇸🇦 +966</div>
                    <input
                      type="tel"
                      value={form.owner_phone}
                      onChange={(e) => setForm(prev => ({ ...prev, owner_phone: e.target.value }))}
                      placeholder="5XXXXXXXX"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={form.owner_password}
                    onChange={(e) => setForm(prev => ({ ...prev, owner_password: e.target.value }))}
                    placeholder="٨ أحرف على الأقل"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    minLength={8}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">معلومات الصالون</h2>
              <p className="text-gray-500 mb-6">الخطوة ٢ من ٣ — هوية صالونك على المنصة</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الصالون</label>
                  <input
                    type="text"
                    value={form.salon_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0621-\u064A-]/g, '');
                      setForm(prev => ({ ...prev, salon_name: name, salon_slug: slug }));
                    }}
                    placeholder="مثال: لوكس بيوتي"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصالون</label>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">saloni.sa/</span>
                    <input
                      type="text"
                      value={form.salon_slug}
                      onChange={(e) => setForm(prev => ({ ...prev, salon_slug: e.target.value.replace(/[^a-z0-9-]/g, '') }))}
                      placeholder="luxe-beauty"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      dir="ltr"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">هذا سيكون رابط صفحة حجزك</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">لون العلامة التجارية</label>
                  <div className="flex gap-3">
                    {['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setForm(prev => ({ ...prev, primary_color: color }))}
                        className={cn(
                          'w-10 h-10 rounded-xl transition-all',
                          form.primary_color === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : ''
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">اختاري خطتك</h2>
              <p className="text-gray-500 mb-6">الخطوة ٣ من ٣ — ١٤ يوم تجربة مجانية</p>
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.slug}
                    onClick={() => setForm(prev => ({ ...prev, plan_id: plan.slug }))}
                    className={cn(
                      'w-full text-right p-5 rounded-2xl border-2 transition-all',
                      form.plan_id === plan.slug
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-100 hover:border-purple-200'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-extrabold text-purple-700">{plan.price}</span>
                          <span className="text-sm text-gray-500">ريال/{plan.period}</span>
                        </div>
                      </div>
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        form.plan_id === plan.slug ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      )}>
                        {form.plan_id === plan.slug && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-xs bg-white text-gray-600 px-2 py-1 rounded-full">{f}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                → رجوع
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || (step === 3 && !form.plan_id)}
              className={cn(
                'bg-gradient-to-l from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50',
                step === 1 && 'mr-auto'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  جاري التسجيل...
                </span>
              ) : step === 3 ? 'ابدأ التجربة المجانية 🎉' : 'التالي ←'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          عندك حساب بالفعل؟ <a href="/auth/login" className="text-purple-600 hover:underline">سجّلي دخولك</a>
        </p>
      </div>
    </div>
  );
}