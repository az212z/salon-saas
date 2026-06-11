import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string = 'ar-SA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatTime(time: string, locale: string = 'ar-SA'): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTime(date: string, time: string, locale: string = 'ar-SA'): string {
  return `${formatDate(date, locale)} ${formatTime(time, locale)}`;
}

export function getLocalizedText(text: LocalizedText | string | undefined, locale: string = 'ar'): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return (text as any)[locale] || text.ar || text.en || '';
}

export function getLoyaltyTier(points: number, thresholds: LoyaltyTierThresholds): LoyaltyTier {
  if (points >= thresholds.vip) return 'vip';
  if (points >= thresholds.gold) return 'gold';
  if (points >= thresholds.silver) return 'silver';
  return 'bronze';
}

export function getLoyaltyTierLabel(tier: LoyaltyTier): string {
  const labels: Record<LoyaltyTier, string> = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    vip: 'VIP',
  };
  return labels[tier];
}

export function getLoyaltyTierColor(tier: LoyaltyTier): string {
  const colors: Record<LoyaltyTier, string> = {
    bronze: 'text-amber-700 bg-amber-50',
    silver: 'text-gray-600 bg-gray-50',
    gold: 'text-yellow-600 bg-yellow-50',
    vip: 'text-purple-700 bg-purple-50',
  };
  return colors[tier];
}

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    in_progress: 'جاري التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    no_show: 'لم تحضر',
  };
  return labels[status];
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    no_show: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[status];
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const totalMinutes = timeStringToMinutes(time) + minutes;
  return minutesToTimeString(totalMinutes);
}

export function getDayNameAr(dayIndex: number): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayIndex];
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنة`;
}

// Import types used above
import type { LocalizedText, LoyaltyTier, LoyaltyTierThresholds, BookingStatus } from '@/types';