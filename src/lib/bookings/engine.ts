import { bookings, services, staffMembers, timeSlots } from "@/lib/demo-platform";

export type AvailabilityInput = {
  tenant_id: string;
  staff_id: string;
  date: string;
  service_duration: number;
  interval_minutes?: number;
};

export type AvailableSlot = {
  time: string;
  staff_id?: string;
  staff_name?: string;
  available: boolean;
};

export async function getAvailableSlots(input: AvailabilityInput): Promise<AvailableSlot[]> {
  const unavailable = new Set(input.staff_id === "hind" ? ["13:00"] : ["11:30"]);
  return timeSlots.map((time) => ({
    time,
    staff_id: input.staff_id,
    staff_name: staffMembers.find((staff) => staff.id === input.staff_id)?.name,
    available: !unavailable.has(time),
  }));
}

export async function getAvailableSlotsForAnyStaff(
  tenantId: string,
  date: string,
  serviceId: string,
  intervalMinutes = 30,
): Promise<AvailableSlot[]> {
  void tenantId;
  void date;
  void serviceId;
  void intervalMinutes;

  return timeSlots.flatMap((time, index) =>
    staffMembers.slice(0, 3).map((staff, staffIndex) => ({
      time,
      staff_id: staff.id,
      staff_name: staff.name,
      available: (index + staffIndex) % 3 !== 0,
    })),
  );
}

export type CreateBookingInput = {
  tenant_id: string;
  customer_id: string;
  staff_id?: string | null;
  booking_date: string;
  start_time: string;
  items: Array<{ service_id: string; quantity?: number }>;
  payment_type: string;
  notes?: string;
  coupon_code?: string;
  gift_card_code?: string;
  points_to_redeem?: number;
};

type BookingActionResult<T> = {
  success: boolean;
  error?: string;
} & T;

export async function createBooking(input: CreateBookingInput): Promise<
  BookingActionResult<{
    booking?: Record<string, unknown>;
  }>
> {
  const selectedServices = input.items.map((item) => services.find((service) => service.id === item.service_id) ?? services[0]);
  const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0);
  const depositAmount = selectedServices.reduce((sum, service) => sum + service.deposit, 0);
  const assignedStaff = staffMembers.find((staff) => staff.id === input.staff_id) ?? staffMembers[0];
  const paymentRequired = input.payment_type === "deposit" || input.payment_type === "full";

  return {
    success: true,
    booking: {
      id: `B-DEMO-${Date.now()}`,
      tenant_id: input.tenant_id,
      customer_id: input.customer_id,
      staff_id: assignedStaff.id,
      staff_name: assignedStaff.name,
      booking_date: input.booking_date,
      start_time: input.start_time,
      total_amount: totalAmount,
      total_duration: totalDuration,
      deposit_amount: depositAmount,
      payment_type: input.payment_type,
      payment_status: paymentRequired ? "unpaid" : "paid_in_salon",
      status: paymentRequired ? "pending_payment" : "confirmed",
      notes: input.notes ?? null,
      items: selectedServices,
    },
  };
}

export async function updateBookingStatus(
  bookingId: string,
  tenantId: string | null | undefined,
  status: string,
  reason?: string,
): Promise<
  BookingActionResult<{
    booking?: Record<string, unknown>;
  }>
> {
  const booking = bookings.find((item) => item.id === bookingId);

  return {
    success: true,
    booking: {
      id: bookingId,
      tenant_id: tenantId,
      previous_status: booking?.status ?? "unknown",
      status,
      reason: reason ?? null,
      updated_at: new Date().toISOString(),
    },
  };
}

export async function checkWaitlistOnCancellation(
  tenantId: string,
  serviceId: string,
  bookingDate: string,
  startTime: string,
): Promise<
  BookingActionResult<{
    notified: number;
    tenant_id: string;
    service_id: string;
    booking_date: string;
    start_time: string;
  }>
> {
  return {
    success: true,
    notified: 0,
    tenant_id: tenantId,
    service_id: serviceId,
    booking_date: bookingDate,
    start_time: startTime,
  };
}
