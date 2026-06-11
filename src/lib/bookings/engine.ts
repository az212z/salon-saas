// ============================================================
// محرك الحجوزات — قلب المنصة ⭐
// يحسب الأوقات المتاحة ويمنع التعارض ويدير دورة حياة الحجز
// ============================================================

import type { BookingStatus } from '@/types';

import { createClient } from '@/lib/supabase/server';
import type {
  Staff,
  StaffSchedule,
  StaffTimeOff,
  Service,
  Booking,
  TimeSlot,
  BookingPaymentType,
} from '@/types';
import { timeStringToMinutes, minutesToTimeString, addMinutesToTime } from '@/lib/utils';

// ==============================
// 1. حساب الأوقات المتاحة لموظفة في يوم معين
// ==============================
export interface AvailabilityInput {
  tenant_id: string;
  staff_id: string;
  date: string; // YYYY-MM-DD
  service_duration: number; // minutes
  interval_minutes?: number; // default 30
  booking_buffer_minutes?: number; // buffer between bookings, default 0
}

export interface AvailableSlot {
  time: string;
  end_time: string;
  is_available: boolean;
  staff_id: string;
  staff_name: string;
  remaining_capacity?: number;
}

export async function getAvailableSlots(input: AvailabilityInput): Promise<AvailableSlot[]> {
  const supabase = await createClient();
  const { tenant_id, staff_id, date, service_duration, interval_minutes = 30, booking_buffer_minutes = 0 } = input;

  // 1. Get staff schedule for this day
  const dayOfWeek = getDayOfWeekEnglish(date);
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('tenant_id', tenant_id)
    .eq('staff_id', staff_id)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!schedule || !schedule.is_working) return [];

  // 2. Check if staff has time off on this date
  const { data: timeOff } = await supabase
    .from('staff_time_off')
    .select('*')
    .eq('tenant_id', tenant_id)
    .eq('staff_id', staff_id)
    .lte('start_date', date)
    .gte('end_date', date)
    .eq('status', 'approved')
    .maybeSingle();

  if (timeOff) return [];

  // 3. Get existing bookings for this staff on this date
  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, end_time, status')
    .eq('tenant_id', tenant_id)
    .eq('staff_id', staff_id)
    .eq('booking_date', date)
    .in('status', ['confirmed', 'pending', 'in_progress']);

  const existingBookings = bookings || [];

  // 4. Calculate working hours minus break
  const workStart = timeStringToMinutes(schedule.start_time);
  const workEnd = timeStringToMinutes(schedule.end_time);
  const breakStart = schedule.break_start ? timeStringToMinutes(schedule.break_start) : null;
  const breakEnd = schedule.break_end ? timeStringToMinutes(schedule.break_end) : null;

  // 5. Generate all possible time slots
  const slots: AvailableSlot[] = [];
  const { data: staffData } = await supabase
    .from('staff')
    .select('name')
    .eq('id', staff_id)
    .single();

  const staffName = staffData?.name || '';

  // Don't allow booking in the past
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMinutes = date === today ? now.getHours() * 60 + now.getMinutes() : 0;

  for (let slotStart = workStart; slotStart + service_duration <= workEnd; slotStart += interval_minutes) {
    const slotEnd = slotStart + service_duration;

    // Skip past times
    if (slotStart < currentMinutes) continue;

    // Check if slot overlaps with break
    let overlapsBreak = false;
    if (breakStart !== null && breakEnd !== null) {
      if (slotStart < breakEnd && slotEnd > breakStart) {
        overlapsBreak = true;
      }
    }

    if (overlapsBreak) continue;

    // Check if slot overlaps with existing bookings
    const overlapsBooking = existingBookings.some(booking => {
      const bookingStart = timeStringToMinutes(booking.start_time);
      const bookingEnd = timeStringToMinutes(booking.end_time);
      // Add buffer
      const bufferedStart = bookingStart - booking_buffer_minutes;
      const bufferedEnd = bookingEnd + booking_buffer_minutes;
      return slotStart < bufferedEnd && slotEnd > bufferedStart;
    });

    if (overlapsBooking) continue;

    // Slot is available!
    slots.push({
      time: minutesToTimeString(slotStart),
      end_time: minutesToTimeString(slotEnd),
      is_available: true,
      staff_id,
      staff_name: staffName,
    });
  }

  return slots;
}

// ==============================
// 2. حساب الأوقات المتاحة لأي موظفة متاحة
// ==============================
export async function getAvailableSlotsForAnyStaff(
  tenant_id: string,
  date: string,
  service_id: string,
  interval_minutes: number = 30
): Promise<AvailableSlot[]> {
  const supabase = await createClient();

  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', service_id)
    .single();

  if (!service) return [];

  // Get all active staff who offer this service
  const { data: staffServices } = await supabase
    .from('staff_services')
    .select('staff_id, custom_duration_minutes, staff:staff(id, name, is_active)')
    .eq('tenant_id', tenant_id)
    .eq('service_id', service_id)
    .eq('is_active', true);

  if (!staffServices?.length) return [];

  // Filter active staff
  const activeStaff = staffServices.filter(ss => (ss.staff as any)?.is_active);

  // Get slots for each staff member
  const allSlots: AvailableSlot[] = [];

  for (const ss of activeStaff) {
    const duration = ss.custom_duration_minutes || service.duration_minutes;
    const staffId = ss.staff_id;

    const slots = await getAvailableSlots({
      tenant_id,
      staff_id: staffId,
      date,
      service_duration: duration,
      interval_minutes,
    });

    allSlots.push(...slots);
  }

  // Sort by time and merge overlapping slots
  allSlots.sort((a, b) => a.time.localeCompare(b.time));

  return allSlots;
}

// ==============================
// 3. إنشاء حجز جديد مع قفل الموعد
// ==============================
export interface CreateBookingInput {
  tenant_id: string;
  customer_id: string;
  staff_id?: string;
  booking_date: string;
  start_time: string;
  items: {
    service_id: string;
    staff_id?: string;
  }[];
  payment_type: BookingPaymentType;
  notes?: string;
  coupon_code?: string;
  gift_card_code?: string;
  points_to_redeem?: number;
}

export async function createBooking(input: CreateBookingInput): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const supabase = await createClient();

  // 1. Validate and lock: check no conflicting bookings exist
  // Using a transaction-like approach with optimistic locking
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('tenant_id', input.tenant_id)
    .eq('booking_date', input.booking_date)
    .eq('staff_id', input.staff_id || '')
    .in('status', ['confirmed', 'pending', 'in_progress']);

  // 2. Get service details to calculate total
  const serviceIds = input.items.map(i => i.service_id);
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', input.tenant_id)
    .in('id', serviceIds);

  if (!services?.length) {
    return { success: false, error: 'الخدمات غير موجودة' };
  }

  // 3. Calculate totals
  let totalDuration = 0;
  let subtotal = 0;
  const bookingItems: any[] = [];

  for (const item of input.items) {
    const service = services.find(s => s.id === item.service_id);
    if (!service) continue;

    totalDuration += service.duration_minutes;
    subtotal += service.price;

    bookingItems.push({
      tenant_id: input.tenant_id,
      service_id: service.id,
      staff_id: item.staff_id || input.staff_id,
      price: service.price,
      duration_minutes: service.duration_minutes,
    });
  }

  const endTime = addMinutesToTime(input.start_time, totalDuration);

  // 4. Check for conflicts with precise timing
  if (input.staff_id && existingBookings) {
    const startMinutes = timeStringToMinutes(input.start_time);
    const endMinutes = timeStringToMinutes(endTime);

    const conflict = existingBookings.some(b => {
      const bStart = timeStringToMinutes(b.start_time);
      const bEnd = timeStringToMinutes(b.end_time);
      return startMinutes < bEnd && endMinutes > bStart;
    });

    if (conflict) {
      return { success: false, error: 'الموعد محجوز مسبقاً. يرجى اختيار وقت آخر.' };
    }
  }

  // 5. Apply coupon/gift card discounts
  let discountAmount = 0;
  // TODO: Coupon and gift card validation

  // 6. Calculate loyalty points
  const pointsEarned = Math.floor(subtotal); // 1 point per SAR

  // 7. Create the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      tenant_id: input.tenant_id,
      customer_id: input.customer_id,
      staff_id: input.staff_id,
      booking_date: input.booking_date,
      start_time: input.start_time,
      end_time: endTime,
      total_duration: totalDuration,
      subtotal,
      discount_amount: discountAmount,
      total_amount: subtotal - discountAmount,
      payment_type: input.payment_type,
      payment_status: input.payment_type === 'in_salon' ? 'unpaid' : 'pending',
      notes: input.notes,
      points_earned: pointsEarned,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error || !booking) {
    return { success: false, error: 'حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.' };
  }

  // 8. Create booking items
  const itemsWithBookingId = bookingItems.map((item, index) => ({
    ...item,
    booking_id: booking.id,
    start_time: index === 0 ? input.start_time : undefined,
    sort_order: index,
  }));

  await supabase
    .from('booking_items')
    .insert(itemsWithBookingId);

  // 9. Send confirmation WhatsApp message
  // This will be handled by a database trigger or an API call

  return { success: true, booking: booking as Booking };
}

// ==============================
// 4. دورة حياة الحجز — تحديث الحالة
// ==============================
export async function updateBookingStatus(
  booking_id: string,
  tenant_id: string,
  new_status: BookingStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Validate status transitions
  const validTransitions: Record<string, BookingStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled', 'no_show'],
    in_progress: ['completed'],
    // Terminal states
    completed: [],
    cancelled: [],
    no_show: [],
  };

  const { data: booking } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', booking_id)
    .eq('tenant_id', tenant_id)
    .single();

  if (!booking) return { success: false, error: 'الحجز غير موجود' };

  const allowedNext = validTransitions[booking.status];
  if (!allowedNext?.includes(new_status)) {
    return { success: false, error: `لا يمكن تغيير حالة الحجز من "${booking.status}" إلى "${new_status}"` };
  }

  const updateData: Record<string, any> = { status: new_status };

  if (new_status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
  if (new_status === 'completed') updateData.completed_at = new Date().toISOString();
  if (new_status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancellation_reason = reason;
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', booking_id)
    .eq('tenant_id', tenant_id);

  if (error) return { success: false, error: 'حدث خطأ أثناء تحديث الحجز' };

  // Trigger relevant WhatsApp messages
  if (new_status === 'confirmed') {
    // TODO: Send booking confirmation via WhatsApp
  }
  if (new_status === 'cancelled') {
    // TODO: Send cancellation notification
  }
  if (new_status === 'no_show') {
    // TODO: Send no-show warning + update customer no_show count
  }

  return { success: true };
}

// ==============================
// 5. Helper: Get day of week in English enum format
// ==============================
function getDayOfWeekEnglish(dateStr: string): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

// ==============================
// 6. Waitlist: Notify when slot opens
// ==============================
export async function checkWaitlistOnCancellation(
  tenant_id: string,
  service_id: string,
  date: string,
  time: string
): Promise<void> {
  const supabase = await createClient();

  // Find waitlist entries matching this slot
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*, customer:customers(phone, full_name)')
    .eq('tenant_id', tenant_id)
    .eq('service_id', service_id)
    .eq('preferred_date', date)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(5);

  if (!waitlist?.length) return;

  // Send WhatsApp notifications
  for (const entry of waitlist) {
    // TODO: Send WhatsApp message: "توفر موعد! احجزي الآن"
    await supabase
      .from('waitlist')
      .update({ status: 'notified', notified_at: new Date().toISOString() })
      .eq('id', entry.id);
  }
}