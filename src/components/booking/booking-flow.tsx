'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatCurrency, formatTime, getLocalizedText } from '@/lib/utils';
import type { Service, Staff, TimeSlot, AvailableSlot, BookingFlowState } from '@/types';

// ==============================
// Step Indicator
// ==============================
const STEPS = [
  { id: 'services', label: 'الخدمات', icon: '✂️' },
  { id: 'staff', label: 'الموظفة', icon: '👩‍💼' },
  { id: 'datetime', label: 'المويعدة', icon: '📅' },
  { id: 'confirm', label: 'التأكيد', icon: '✅' },
] as const;

function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;
        return (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              isActive && 'bg-primary text-primary-foreground shadow-lg',
              isCompleted && 'bg-green-500 text-white',
              !isActive && !isCompleted && 'bg-muted text-muted-foreground'
            )}>
              <span>{isCompleted ? '✓' : step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-1',
                i < currentIndex ? 'bg-green-500' : 'bg-muted-foreground/20'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// Service Selection Step
// ==============================
function ServiceSelection({
  services,
  selectedServices,
  onSelect,
  onRemove,
  onNext,
}: {
  services: Service[];
  selectedServices: Service[];
  onSelect: (service: Service) => void;
  onRemove: (serviceId: string) => void;
  onNext: () => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = [{ id: 'all', name: { ar: 'الكل' } }, ...Array.from(new Map(
    services.map(s => [s.category?.id, s.category])
  ).values())];

  const filtered = services.filter(s => {
    const matchCategory = categoryFilter === 'all' || s.category_id === categoryFilter;
    const matchSearch = !search || getLocalizedText(s.name, 'ar').includes(search);
    return matchCategory && matchSearch && s.is_active;
  });

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      <StepIndicator currentStep="services" />

      <h2 className="text-2xl font-bold text-gray-800">اختاري الخدمة</h2>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="ابحثي عن خدمة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from(categories).filter(Boolean).map((cat: any) => (
          <button
            key={cat?.id || 'all'}
            onClick={() => setCategoryFilter(cat?.id || 'all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              categoryFilter === (cat?.id || 'all')
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {getLocalizedText(cat?.name, 'ar')}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((service) => {
          const isSelected = selectedServices.some(s => s.id === service.id);
          return (
            <button
              key={service.id}
              onClick={() => isSelected ? onRemove(service.id) : onSelect(service)}
              className={cn(
                'text-right p-4 rounded-2xl border-2 transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-100 hover:border-primary/30'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{getLocalizedText(service.name, 'ar')}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {getLocalizedText(service.description, 'ar')}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-500">⏱ {service.duration_minutes} دقيقة</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(service.price)}
                  </div>
                  {service.original_price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatCurrency(service.original_price)}
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-primary text-sm font-medium">
                  <span>✓</span>
                  <span>تم الاختيار</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Summary */}
      {selectedServices.length > 0 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 -mx-4 sm:-mx-6 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">
                {selectedServices.length} خدمة • {totalDuration} دقيقة
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalPrice)}
              </div>
            </div>
            <button
              onClick={onNext}
              className="bg-gradient-to-l from-primary to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              التالي ← اختاري الموظفة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================
// Staff Selection Step
// ==============================
function StaffSelection({
  staff,
  selectedStaff,
  onSelect,
  onSkip,
  onBack,
}: {
  staff: Staff[];
  selectedStaff?: Staff;
  onSelect: (staff: Staff) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <StepIndicator currentStep="staff" />

      <h2 className="text-2xl font-bold text-gray-800">اختاري الموظفة</h2>
      <p className="text-gray-500">اختاري موظفة مفضلة أو دعي النظام يختار الأقرب</p>

      {/* Any Staff Option */}
      <button
        onClick={onSkip}
        className={cn(
          'w-full p-4 rounded-2xl border-2 text-right transition-all',
          !selectedStaff
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-gray-100 hover:border-primary/30'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-bl from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl">
            🎲
          </div>
          <div>
            <h3 className="font-bold text-gray-800">أي موظفة متاحة</h3>
            <p className="text-sm text-gray-500">سنختار لكِ أقرب موعد متاح</p>
          </div>
        </div>
      </button>

      {/* Staff List */}
      <div className="grid sm:grid-cols-2 gap-4">
        {staff.map((member) => {
          const isSelected = selectedStaff?.id === member.id;
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className={cn(
                'text-right p-4 rounded-2xl border-2 transition-all hover:shadow-md',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-100 hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-bl from-purple-300 to-pink-300 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                  {member.avatar_url ? (
                    <Image src={member.avatar_url} alt={member.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  {member.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.specializations.slice(0, 3).map((spec, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.rating_avg > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">{member.rating_avg}</span>
                      <span className="text-xs text-gray-400">({member.total_reviews})</span>
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 text-primary text-sm font-medium">✓ تم الاختيار</div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        → رجوع للخدمات
      </button>
    </div>
  );
}

// ==============================
// Date/Time Selection Step
// ==============================
function DateTimeSelection({
  availableSlots,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onNext,
  onBack,
}: {
  availableSlots: AvailableSlot[];
  selectedDate?: Date;
  selectedTime?: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30); // 30 days ahead

  // Generate calendar days
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  // Group available slots by time for display
  const timeSlots = availableSlots.reduce((acc, slot) => {
    // Group in 2-hour blocks for display
    const hour = parseInt(slot.time.split(':')[0]);
    const period = hour < 12 ? 'صباحاً' : 'مساءً';
    const block = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    if (!acc[block]) acc[block] = { label: '', slots: [] };
    if (block === 'morning') acc[block].label = 'صباحاً';
    else if (block === 'afternoon') acc[block].label = 'ظهراً';
    else acc[block].label = 'مساءً';
    acc[block].slots.push(slot);
    return acc;
  }, {} as Record<string, { label: string; slots: AvailableSlot[] }>);

  return (
    <div className="space-y-6">
      <StepIndicator currentStep="datetime" />

      <h2 className="text-2xl font-bold text-gray-800">اختاري الموعد</h2>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() - 1);
              if (d >= today) setCurrentMonth(d);
            }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            →
          </button>
          <h3 className="font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() + 1);
              setCurrentMonth(d);
            }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();

            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => !isPast && onDateSelect(date)}
                className={cn(
                  'aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center',
                  isPast && 'text-gray-200 cursor-not-allowed',
                  !isPast && !isSelected && 'hover:bg-primary/10 text-gray-700',
                  isSelected && 'bg-primary text-white shadow-md',
                  isToday && !isSelected && 'border-2 border-primary/30',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">
            الأوقات المتاحة — {selectedDate.toLocaleDateString('ar-SA')}
          </h3>

          {Object.keys(timeSlots).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">😔</div>
              <p>لا توجد مواعيد متاحة في هذا اليوم</p>
              <button
                onClick={() => {}}
                className="mt-3 text-primary font-medium hover:underline"
              >
                انضمي لقائمة الانتظار
              </button>
            </div>
          ) : (
            Object.entries(timeSlots).map(([block, { label, slots }]) => (
              <div key={block}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{label}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => onTimeSelect(slot.time)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-sm font-medium transition-all',
                        selectedTime === slot.time
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-primary/10 border border-gray-100'
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          → رجوع للموظفة
        </button>
        {selectedDate && selectedTime && (
          <button
            onClick={onNext}
            className="bg-gradient-to-l from-primary to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            تأكيد الحجز
          </button>
        )}
      </div>
    </div>
  );
}

// ==============================
// Booking Confirmation Step
// ==============================
function BookingConfirmation({
  services,
  staff,
  date,
  time,
  totalPrice,
  totalDuration,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  services: Service[];
  staff?: Staff;
  date: Date;
  time: string;
  totalPrice: number;
  totalDuration: number;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-6">
      <StepIndicator currentStep="confirm" />

      <h2 className="text-2xl font-bold text-gray-800">تأكيد الحجز</h2>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
        {/* Services */}
        <div>
          <h3 className="font-bold text-gray-700 mb-2">الخدمات</h3>
          {services.map((service) => (
            <div key={service.id} className="flex justify-between items-center py-2 border-b border-purple-100 last:border-0">
              <div>
                <span className="font-medium">{getLocalizedText(service.name, 'ar')}</span>
                <span className="text-sm text-gray-500 mr-2">({service.duration_minutes} دقيقة)</span>
              </div>
              <span className="font-bold text-primary">{formatCurrency(service.price)}</span>
            </div>
          ))}
        </div>

        {/* Staff */}
        <div className="flex justify-between items-center py-2 border-b border-purple-100">
          <span className="text-gray-600">الموظفة</span>
          <span className="font-medium">{staff?.name || 'أي موظفة متاحة'}</span>
        </div>

        {/* Date & Time */}
        <div className="flex justify-between items-center py-2 border-b border-purple-100">
          <span className="text-gray-600">الموعد</span>
          <span className="font-medium">
            {date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <br />
            الساعة {formatTime(time)}
          </span>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center py-2 border-b border-purple-100">
          <span className="text-gray-600">المدة الإجمالية</span>
          <span className="font-medium">{totalDuration} دقيقة</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3">
          <span className="text-lg font-bold text-gray-800">الإجمالي</span>
          <span className="text-2xl font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      {/* Payment Type */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-700">طريقة الدفع</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'in_salon', label: 'في الصالون', icon: '🏪' },
            { value: 'deposit', label: 'عربون', icon: '💳' },
            { value: 'full', label: 'دفع كامل', icon: '✅' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-primary/30 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input type="radio" name="payment" value={option.value} className="sr-only" defaultChecked={option.value === 'in_salon'} />
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
        <textarea
          placeholder="أي ملاحظات أو طلبات خاصة..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          → رجوع
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="bg-gradient-to-l from-primary to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              جاري التأكيد...
            </span>
          ) : (
            'تأكيد الحجز ✨'
          )}
        </button>
      </div>
    </div>
  );
}

// ==============================
// Main Booking Flow Component
// ==============================
export default function BookingFlow() {
  const [flow, setFlow] = useState<BookingFlowState>({
    step: 'services',
    selectedServices: [],
    paymentType: 'in_salon',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const totalPrice = flow.selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = flow.selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // API call to create booking
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated
    setIsSubmitting(false);
    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">تم الحجز بنجاح!</h2>
        <p className="text-gray-500 mb-2">
          وصلك تأكيد عبر واتساب
        </p>
        <p className="text-gray-500 mb-8">
          رقم الحجز: <span className="font-bold text-primary">BK-20250611-0001</span>
        </p>
        <div className="space-y-3">
          <button className="w-full bg-gradient-to-l from-primary to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
            حجز موعد آخر
          </button>
          <button className="w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all">
            عرض حجوزاتي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {flow.step === 'services' && (
        <ServiceSelection
          services={[]} // Will be populated from API
          selectedServices={flow.selectedServices}
          onSelect={(service) => setFlow(prev => ({
            ...prev,
            selectedServices: [...prev.selectedServices, service]
          }))}
          onRemove={(serviceId) => setFlow(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.filter(s => s.id !== serviceId)
          }))}
          onNext={() => setFlow(prev => ({ ...prev, step: 'staff' }))}
        />
      )}

      {flow.step === 'staff' && (
        <StaffSelection
          staff={[]} // Will be populated from API
          selectedStaff={flow.selectedStaff}
          onSelect={(staff) => setFlow(prev => ({ ...prev, selectedStaff: staff }))}
          onSkip={() => {
            setFlow(prev => ({ ...prev, selectedStaff: undefined }));
            setFlow(prev => ({ ...prev, step: 'datetime' }));
          }}
          onBack={() => setFlow(prev => ({ ...prev, step: 'services' }))}
        />
      )}

      {flow.step === 'datetime' && (
        <DateTimeSelection
          availableSlots={[]} // Will be populated from API
          selectedDate={flow.selectedDate}
          selectedTime={flow.selectedTime}
          onDateSelect={(date) => setFlow(prev => ({ ...prev, selectedDate: date }))}
          onTimeSelect={(time) => setFlow(prev => ({ ...prev, selectedTime: time }))}
          onNext={() => setFlow(prev => ({ ...prev, step: 'confirm' }))}
          onBack={() => setFlow(prev => ({ ...prev, step: 'staff' }))}
        />
      )}

      {flow.step === 'confirm' && flow.selectedDate && flow.selectedTime && (
        <BookingConfirmation
          services={flow.selectedServices}
          staff={flow.selectedStaff}
          date={flow.selectedDate}
          time={flow.selectedTime}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          onConfirm={handleConfirm}
          onBack={() => setFlow(prev => ({ ...prev, step: 'datetime' }))}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
