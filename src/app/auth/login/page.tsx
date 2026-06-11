'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 'input') {
        if (mode === 'phone') {
          // Send OTP via WhatsApp
          const res = await fetch('/api/auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });
          if (!res.ok) {
            const data = await res.json();
            setError(data.error || 'خطأ في إرسال الرمز');
            return;
          }
          setStep('otp');
        } else {
          // Email/password login
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const data = await res.json();
            setError(data.error || 'بيانات الدخول غير صحيحة');
            return;
          }
          router.push('/dashboard');
        }
      } else {
        // Verify OTP
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code: otp }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'الرمز غير صحيح');
          return;
        }
        router.push('/dashboard');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-bl from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">س</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">مرحباً بك</h1>
          <p className="text-gray-500 mt-2">سجّلي دخولك للمتابعة</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('phone'); setStep('input'); setError(''); }}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              mode === 'phone' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'
            )}
          >
            📱 رقم الجوال
          </button>
          <button
            onClick={() => { setMode('email'); setStep('input'); setError(''); }}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              mode === 'email' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'
            )}
          >
            📧 البريد الإلكتروني
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'input' && (
            <>
              {mode === 'phone' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-600">
                      🇸🇦 +966
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5XXXXXXXX"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">سنرسل رمز التحقق عبر واتساب</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {step === 'otp' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رمز التحقق</label>
              <p className="text-sm text-gray-500 mb-3">
                أرسلنا رمز ٦ أرقام إلى واتساب {phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="٠٠٠٠٠٠"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-center text-2xl tracking-[1em]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => { setStep('input'); setOtp(''); }}
                className="text-sm text-purple-600 hover:underline mt-2"
              >
                إعادة إرسال الرمز
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-l from-purple-600 to-pink-500 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                جاري التحقق...
              </span>
            ) : step === 'otp' ? 'تأكيد الرمز' : mode === 'phone' ? 'إرسال رمز التحقق' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            عندك صالون وتبغى تشترك؟{' '}
            <a href="/register" className="text-purple-600 font-medium hover:underline">
              سجّل صالونك مجاناً
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}