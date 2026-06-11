'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn, formatCurrency } from '@/lib/utils';
import { useParams } from 'next/navigation';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Step = 'services' | 'staff' | 'datetime' | 'confirm' | 'success';

export default function ClientBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('services');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => { loadTenant(); }, [slug]);

  async function loadTenant() {
    try {
      const { data: t } = await supabase.from('tenants').select('*').eq('slug', slug).single();
      if (!t) return;
      setTenant(t);

      const [sRes, cRes, stRes] = await Promise.all([
        supabase.from('services').select('*, categories(name)').eq('tenant_id', t.id).eq('is_active', true).order('sort_order'),
        supabase.from('categories').select('*').eq('tenant_id', t.id).order('sort_order'),
        supabase.from('staff').select('*').eq('tenant_id', t.id).eq('is_active', true),
      ]);
      setServices(sRes.data || []);
      setCategories(cRes.data || []);
      setStaffList(stRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function toggleService(id: string) {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  const totalAmount = selectedServices.reduce((sum, id) => {
    const svc = services.find(s => s.id === id);
    return sum + (svc?.price || 0);
  }, 0);
  const totalDuration = selectedServices.reduce((sum, id) => {
    const svc = services.find(s => s.id === id);
    return sum + (svc?.duration_minutes || 0);
  }, 0);

  const availableTimes = Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, '0');
    return [`${h}:00`, `${h}:30`];
  }).flat().filter(t => {
    const h = parseInt(t.split(':')[0]);
    return h >= 8 && h <= 21;
  });

  async function handleBooking() {
    if (!tenant || !customerName || !customerPhone || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      // Find or create customer
      let customerId: string;
      const { data: existing } = await supabase.from('customers').select('id').eq('tenant_id', tenant.id).eq('phone', customerPhone).single();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCust } = await supabase.from('customers').insert({
          tenant_id: tenant.id,
          full_name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          gender: 'female',
          loyalty_points: 0,
          loyalty_tier: 'bronze',
          lifetime_value: 0,
          total_visits: 0,
          average_spend: 0,
          acquired_source: 'website',
          marketing_consent: true,
        }).select().single();
        customerId = newCust?.id;
      }

      const start = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const end = new Date(new Date(start).getTime() + totalDuration * 60000).toISOString();

      const { data: booking } = await supabase.from('bookings').insert({
        tenant_id: tenant.id,
        customer_id: customerId,
        staff_id: selectedStaff || null,
        start_time: start,
        end_time: end,
        total_amount: totalAmount,
        total_duration: totalDuration,
        status: 'confirmed',
        booking_source: 'website',
      }).select().single();

      if (booking) {
        setBookingId(booking.id);
        setStep('success');
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white" dir="rtl">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">الصالون غير موجود</h1>
          <p className="text-gray-500">تأكدي من الرابط الصحيح</p>
        </div>
      </div>
    );
  }

  const tName = typeof tenant.name === 'object' ? (tenant.name as any).ar : tenant.name;
  const tDesc = typeof tenant.description === 'object' ? (tenant.description as any).ar : tenant.description;
  const primaryColor = tenant.primary_color || '#8B5CF6';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
              {tName?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{tName}</p>
              <p className="text-[10px] text-gray-500">{tenant.address?.city} • {tenant.address?.district}</p>
            </div>
          </div>
          {/* Steps indicator */}
          <div className="flex items-center gap-1">
            {['services', 'staff', 'datetime', 'confirm'].map((s, i) => (
              <div key={s} className={cn(
                'w-8 h-1.5 rounded-full transition-all',
                ['services', 'staff', 'datetime', 'confirm'].indexOf(step) >= i ? '' : 'bg-gray-200'
              )} style={{ backgroundColor: ['services', 'staff', 'datetime', 'confirm'].indexOf(step) >= i ? primaryColor : undefined }} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step: Services */}
        {step === 'services' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-800">اختاري خدمتك ✨</h1>
              <p className="text-sm text-gray-500 mt-1">يمكنك اختيار أكثر من خدمة</p>
            </div>

            {categories.length > 0 ? categories.map(cat => {
              const catServices = services.filter(s => s.category_id === cat.id);
              if (catServices.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h2 className="font-bold text-gray-700 mb-3">{typeof cat.name === 'object' ? (cat.name as any).ar : cat.name}</h2>
                  <div className="space-y-2">
                    {catServices.map(svc => {
                      const isSelected = selectedServices.includes(svc.id);
                      return (
                        <button key={svc.id} onClick={() => toggleService(svc.id)} className={cn(
                          'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-right',
                          isSelected ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                        )} style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : {}}>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all', isSelected ? 'text-white' : 'bg-gray-100 text-gray-400')} style={isSelected ? { backgroundColor: primaryColor } : {}}>
                              {isSelected ? '✓' : typeof svc.name === 'object' ? (svc.name as any).ar?.charAt(0) : svc.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{typeof svc.name === 'object' ? (svc.name as any).ar : svc.name}</p>
                              <p className="text-xs text-gray-500">{svc.duration_minutes} دقيقة</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm" style={{ color: primaryColor }}>{formatCurrency(svc.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }) : (
              <div className="space-y-2">
                {services.map(svc => {
                  const isSelected = selectedServices.includes(svc.id);
                  return (
                    <button key={svc.id} onClick={() => toggleService(svc.id)} className={cn('w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-right', isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white')}>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{typeof svc.name === 'object' ? (svc.name as any).ar : svc.name}</p>
                        <p className="text-xs text-gray-500">{svc.duration_minutes} دقيقة</p>
                      </div>
                      <span className="font-bold text-purple-700">{formatCurrency(svc.price)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button onClick={() => selectedServices.length > 0 && setStep('staff')} disabled={selectedServices.length === 0} className="w-full py-4 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 text-lg" style={{ backgroundColor: primaryColor }}>
              التالي — {formatCurrency(totalAmount)} ({totalDuration} دقيقة)
            </button>
          </div>
        )}

        {/* Step: Staff */}
        {step === 'staff' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-800">اختاري الموظفة 👩‍🎨</h1>
              <p className="text-sm text-gray-500 mt-1">أو اختاري "أي موظفة متاحة"</p>
            </div>

            <button onClick={() => { setSelectedStaff(''); setStep('datetime'); }} className={cn('w-full p-4 rounded-2xl border-2 transition-all text-right', !selectedStaff ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white')}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">🔀</div>
                <div>
                  <p className="font-medium text-gray-800">أي موظفة متاحة</p>
                  <p className="text-xs text-gray-500">أفضل وقت متاح</p>
                </div>
              </div>
            </button>

            {staffList.map(s => (
              <button key={s.id} onClick={() => { setSelectedStaff(s.id); setStep('datetime'); }} className={cn('w-full p-4 rounded-2xl border-2 transition-all text-right', selectedStaff === s.id ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white')}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-bl from-amber-100 to-orange-200 flex items-center justify-center text-amber-700 font-bold text-lg">
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(s.specializations || []).map((sp: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[10px] rounded-full">{sp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button onClick={() => setStep('services')} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">→ رجوع</button>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-800">اختاري الموعد 🗓️</h1>
              <p className="text-sm text-gray-500 mt-1">التاريخ والوقت المناسب</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableTimes.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)} className={cn(
                      'py-2.5 rounded-xl text-sm font-medium border transition-all',
                      selectedTime === t ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )} style={selectedTime === t ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10`, color: primaryColor } : {}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('staff')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">→ رجوع</button>
              <button onClick={() => selectedDate && selectedTime && setStep('confirm')} disabled={!selectedDate || !selectedTime} className="flex-1 py-3 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50" style={{ backgroundColor: primaryColor }}>التالي ←</button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-800">تأكيد الحجز ✅</h1>
              <p className="text-sm text-gray-500 mt-1">راجعي بياناتك قبل التأكيد</p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-800">الخدمات</h3>
              {selectedServices.map(id => {
                const svc = services.find(s => s.id === id);
                return svc ? (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{typeof svc.name === 'object' ? (svc.name as any).ar : svc.name}</span>
                    <span className="font-bold">{formatCurrency(svc.price)}</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                <span>الإجمالي ({totalDuration} دقيقة)</span>
                <span style={{ color: primaryColor }}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-gray-800">بياناتك</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجوال *</label>
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required placeholder="05XXXXXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الإيميل (اختياري)</label>
                <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 outline-none text-sm" dir="ltr" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('datetime')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">→ رجوع</button>
              <button onClick={handleBooking} disabled={submitting || !customerName || !customerPhone} className="flex-1 py-3 text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
                {submitting ? 'جاري التأكيد...' : 'تأكيد الحجز ✅'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center py-12 space-y-6">
            <div className="text-6xl">🎉</div>
            <h1 className="text-2xl font-extrabold text-gray-800">تم الحجز بنجاح!</h1>
            <p className="text-gray-500">ستصلك رسالة واتساب بتأكيد الحجز</p>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 max-w-sm mx-auto space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">الصالون</span><span className="font-bold">{tName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">التاريخ</span><span className="font-bold">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الوقت</span><span className="font-bold">{selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">الإجمالي</span><span className="font-bold" style={{ color: primaryColor }}>{formatCurrency(totalAmount)}</span></div>
            </div>
            <button onClick={() => { setStep('services'); setSelectedServices([]); setSelectedStaff(''); setSelectedDate(''); setSelectedTime(''); }} className="px-8 py-3 text-white font-bold rounded-2xl hover:shadow-lg transition-all" style={{ backgroundColor: primaryColor }}>
              حجز آخر ➕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}