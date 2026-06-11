'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tab, setTab] = useState<'templates' | 'campaigns' | 'stats'>('templates');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single();
      if (!ud?.tenant_id) return;
      setTenantId(ud.tenant_id);
      const { data } = await supabase.from('whatsapp_templates').select('*').eq('tenant_id', ud.tenant_id).order('type');
      setTemplates(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function toggleTemplate(id: string, active: boolean) {
    await supabase.from('whatsapp_templates').update({ is_active: !active }).eq('id', id);
    loadData();
  }

  const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
    booking_confirmation: { label: 'تأكيد حجز', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    booking_reminder_24h: { label: 'تذكير 24 ساعة', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
    booking_reminder_2h: { label: 'تذكير ساعتين', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    booking_completed_thankyou: { label: 'شكر + تقييم', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    missed_you: { label: 'اشتقنالك', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200' },
    birthday_greeting: { label: 'عيد ميلاد', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    no_show_warning: { label: 'تحذير عدم حضور', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]" dir="rtl"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">💬 واتساب</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة الرسائل التلقائية والحملات</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'templates' as const, label: 'القوالب', icon: '📋' },
          { key: 'campaigns' as const, label: 'الحملات', icon: '📢' },
          { key: 'stats' as const, label: 'الإحصائيات', icon: '📊' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all', tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-bl from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">📱 7 رسائل تلقائية</h3>
            <p className="text-white/80 text-sm">قوالب جاهزة تُرسل تلقائياً حسب الحدث. فعّلي أو أوقفي أي قالب حسب حاجتك.</p>
          </div>

          <div className="grid gap-3">
            {templates.map(tmpl => {
              const typeInfo = TYPE_MAP[tmpl.type] || { label: tmpl.type, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
              return (
                <div key={tmpl.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', typeInfo.bg, typeInfo.color)}>{typeInfo.label}</span>
                      <span className="text-sm font-medium text-gray-800">{tmpl.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', tmpl.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500')}>
                        {tmpl.is_active ? '✅ مفعّل' : '⏸ متوقف'}
                      </span>
                      <button onClick={() => toggleTemplate(tmpl.id, tmpl.is_active)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', tmpl.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                        {tmpl.is_active ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{tmpl.content_ar}</p>
                  </div>
                  {tmpl.variables && (tmpl.variables as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(tmpl.variables as string[]).map((v: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-mono">{'{'}{v}{'}'}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-500">لا توجد قوالب واتساب بعد. سيتم إنشاؤها تلقائياً عند إعداد الصالون.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-bl from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">📢 حملات تسويقية</h3>
            <p className="text-white/80 text-sm">أرسلي رسائل تسويقية مخصصة لشرائح العملاء — عروض، كوبونات، تذكيرات.</p>
          </div>
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📢</div>
            <p className="text-gray-500 mb-4">ابدأ حملتك التسويقية الأولى</p>
            <button className="px-6 py-3 bg-gradient-to-l from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
              إنشاء حملة جديدة
            </button>
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📤', label: 'رسائل مرسلة', value: '0', color: 'bg-blue-50' },
            { icon: '✅', label: 'تم التوصيل', value: '0', color: 'bg-green-50' },
            { icon: '👁️', label: 'تمت القراءة', value: '0', color: 'bg-purple-50' },
            { icon: '💬', label: 'ردود العملاء', value: '0', color: 'bg-pink-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-lg mx-auto mb-2', s.color)}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}