export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LocalizedText = {
  ar?: string;
  en?: string;
  [locale: string]: string | undefined;
};

export type LoyaltyTier = "bronze" | "silver" | "gold" | "vip";

export type LoyaltyTierThresholds = {
  bronze: number;
  silver: number;
  gold: number;
  vip: number;
};

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "failed";

export type UserRole = "platform_admin" | "salon_owner" | "manager" | "staff" | "customer" | "salon_admin";

export interface Customer {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  loyalty_tier?: LoyaltyTier;
  loyalty_points?: number;
  total_visits?: number;
  lifetime_value?: number;
}

export interface ServiceCategory {
  id: string;
  name: LocalizedText;
}

export interface Service {
  id: string;
  tenant_id?: string;
  category_id?: string | null;
  category?: ServiceCategory | null;
  name: LocalizedText;
  description?: LocalizedText | null;
  duration_minutes: number;
  price: number;
  original_price?: number | null;
  is_active: boolean;
  [key: string]: unknown;
}

export interface Staff {
  id: string;
  tenant_id?: string;
  name: string;
  avatar_url?: string | null;
  specializations: string[];
  rating?: number;
  rating_avg: number;
  total_reviews: number;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface TimeSlot {
  time: string;
  label?: string;
  available?: boolean;
  [key: string]: unknown;
}

export interface AvailableSlot {
  time: string;
  staff_id?: string;
  staff_name?: string;
  available: boolean;
  [key: string]: unknown;
}

export interface BookingFlowState {
  step: string;
  selectedServices: Service[];
  selectedStaff?: Staff;
  selectedDate?: Date;
  selectedTime?: string;
  customer?: Partial<Customer>;
  [key: string]: unknown;
}

export interface Booking {
  id: string;
  customer_id?: string | null;
  customer?: Customer | null;
  date?: string;
  start_time: string;
  end_time?: string;
  total_duration: number;
  total_amount: number;
  status: BookingStatus;
  payment_status?: PaymentStatus;
}

export interface DashboardStats {
  today_bookings: number;
  bookings_change?: number;
  today_revenue: number;
  revenue_change?: number;
  occupancy_rate: number;
  new_customers: number;
  [key: string]: string | number | undefined;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
