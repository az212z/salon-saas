// ============================================================
// منصة SaaS لحجوزات الصالونات — أنواع TypeScript الكاملة
// ============================================================

// ==============================
// Enums
// ==============================
export type UserRole = 'platform_owner' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'apple_pay' | 'mada' | 'wallet' | 'gift_card';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';
export type GiftCardStatus = 'active' | 'redeemed' | 'expired';
export type CouponType = 'percentage' | 'fixed_amount' | 'free_service';
export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'vip';
export type StaffPermission = 'full_access' | 'limited' | 'view_only';
export type WhatsAppMessageType =
  | 'booking_confirmation'
  | 'booking_reminder_24h'
  | 'booking_reminder_2h'
  | 'booking_completed_thankyou'
  | 'review_request'
  | 'missed_you'
  | 'birthday_greeting'
  | 'custom_campaign'
  | 'waitlist_notification'
  | 'no_show_warning'
  | 'subscription_reminder';
export type BookingPaymentType = 'full' | 'deposit' | 'in_salon';

// ==============================
// Localized Text
// ==============================
export interface LocalizedText {
  ar: string;
  en?: string;
}

// ==============================
// Core Models
// ==============================
export interface Plan {
  id: string;
  name: LocalizedText;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  max_staff: number;
  max_branches: number;
  features: PlanFeatures;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  bookings: boolean;
  crm: boolean;
  whatsapp_reminders: boolean;
  loyalty: boolean;
  gift_cards: boolean;
  campaigns: boolean;
  custom_domain: boolean;
  advanced_reports: boolean;
  priority_support: boolean;
}

export interface Tenant {
  id: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  owner_id: string;
  plan_id: string;
  logo_url?: string;
  cover_image_url?: string;
  primary_color: string;
  secondary_color: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: TenantAddress;
  social_links?: SocialLinks;
  business_hours?: Record<DayOfWeek, BusinessHours>;
  currency: string;
  locale: string;
  timezone: string;
  is_active: boolean;
  trial_ends_at?: string;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantAddress {
  street?: string;
  city?: string;
  district?: string;
  lat?: number;
  lng?: number;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  snapchat?: string;
  tiktok?: string;
}

export interface BusinessHours {
  is_working: boolean;
  start_time: string;
  end_time: string;
}

export interface TenantSettings {
  cancellation_deadline_hours?: number;
  deposit_percentage?: number;
  deposit_required?: boolean;
  payment_methods?: PaymentMethod[];
  loyalty_points_per_riyal?: number;
  loyalty_tier_thresholds?: LoyaltyTierThresholds;
  review_auto_request?: boolean;
  whatsapp_enabled?: boolean;
  booking_slot_interval_minutes?: number;
  max_future_booking_days?: number;
  no_show_limit?: number;
  no_show_deposit_required?: boolean;
}

export interface LoyaltyTierThresholds {
  bronze: number;
  silver: number;
  gold: number;
  vip: number;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancelled_at?: string;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id?: string;
  role: UserRole;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  locale: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: LocalizedText;
  description?: LocalizedText;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  category_id?: string;
  name: LocalizedText;
  description?: LocalizedText;
  duration_minutes: number;
  price: number;
  original_price?: number;
  image_url?: string;
  is_active: boolean;
  requires_consultation: boolean;
  gender: 'female' | 'male' | 'both';
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Staff {
  id: string;
  tenant_id: string;
  user_id?: string;
  name: string;
  name_en?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  bio?: LocalizedText;
  specializations: string[];
  commission_percentage: number;
  permission_level: StaffPermission;
  is_active: boolean;
  rating_avg: number;
  total_reviews: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  services?: StaffService[];
  schedules?: StaffSchedule[];
}

export interface StaffService {
  id: string;
  tenant_id: string;
  staff_id: string;
  service_id: string;
  custom_duration_minutes?: number;
  is_active: boolean;
  service?: Service;
}

export interface StaffSchedule {
  id: string;
  tenant_id: string;
  staff_id: string;
  day_of_week: DayOfWeek;
  is_working: boolean;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

export interface StaffTimeOff {
  id: string;
  tenant_id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  avatar_url?: string;
  gender: string;
  loyalty_points: number;
  loyalty_tier: LoyaltyTier;
  lifetime_value: number;
  total_visits: number;
  average_spend: number;
  wallet_balance: number;
  referral_code: string;
  referred_by?: string;
  referral_rewards_earned: number;
  // Beauty profile
  skin_type?: string;
  hair_color?: string;
  preferred_color?: string;
  allergies?: string[];
  preferred_services?: string[];
  beauty_notes?: string;
  tags: string[];
  notes?: string;
  is_active: boolean;
  last_visit_at?: string;
  acquired_source: string;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  tenant_id: string;
  customer_id: string;
  created_by: string;
  note: string;
  is_important: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  booking_number: string;
  customer_id: string;
  staff_id?: string;
  status: BookingStatus;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_duration: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_type: BookingPaymentType;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  deposit_amount?: number;
  coupon_id?: string;
  gift_card_id?: string;
  points_earned: number;
  points_redeemed: number;
  notes?: string;
  internal_notes?: string;
  is_group_booking: boolean;
  group_booking_id?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  confirmed_at?: string;
  reminder_sent_24h: boolean;
  reminder_sent_2h: boolean;
  review_request_sent: boolean;
  no_show_warning_sent: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  staff?: Staff;
  items?: BookingItem[];
}

export interface BookingItem {
  id: string;
  tenant_id: string;
  booking_id: string;
  service_id: string;
  staff_id?: string;
  price: number;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  sort_order: number;
  service?: Service;
  staffMember?: Staff;
}

export interface LoyaltyTransaction {
  id: string;
  tenant_id: string;
  customer_id: string;
  booking_id?: string;
  points: number;
  type: 'earn' | 'redeem' | 'bonus' | 'referral' | 'expire' | 'admin_adjust';
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface GiftCard {
  id: string;
  tenant_id: string;
  code: string;
  amount: number;
  remaining_balance: number;
  purchased_by?: string;
  gifted_to_name?: string;
  gifted_to_phone?: string;
  gift_message?: string;
  gift_design: string;
  status: GiftCardStatus;
  purchased_at: string;
  expires_at?: string;
  redeemed_at?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  name: LocalizedText;
  description?: LocalizedText;
  type: CouponType;
  value: number;
  min_order_amount: number;
  max_uses?: number;
  current_uses: number;
  max_uses_per_customer: number;
  valid_from: string;
  valid_until?: string;
  applicable_services: string[];
  applicable_categories: string[];
  is_auto_apply: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  tenant_id: string;
  name: LocalizedText;
  description?: LocalizedText;
  price: number;
  original_price?: number;
  image_url?: string;
  is_active: boolean;
  total_sessions?: number;
  validity_days?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  items?: PackageItem[];
}

export interface PackageItem {
  id: string;
  tenant_id: string;
  package_id: string;
  service_id: string;
  quantity: number;
  service?: Service;
}

export interface Review {
  id: string;
  tenant_id: string;
  booking_id: string;
  customer_id: string;
  staff_id?: string;
  rating: number;
  comment?: string;
  is_published: boolean;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  tenant_id: string;
  customer_id: string;
  service_id: string;
  staff_id?: string;
  preferred_date: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  status: 'waiting' | 'notified' | 'booked' | 'cancelled';
  notified_at?: string;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  tenant_id: string;
  customer_id?: string;
  booking_id?: string;
  type: WhatsAppMessageType;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  external_message_id?: string;
  campaign_id?: string;
  sent_at?: string;
  created_at: string;
}

export interface WhatsAppCampaign {
  id: string;
  tenant_id: string;
  name: string;
  content: string;
  target_filters: CampaignFilters;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduled_at?: string;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  responded_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignFilters {
  tiers?: LoyaltyTier[];
  tags?: string[];
  last_visit_days?: number;
  min_lifetime_value?: number;
  acquired_source?: string[];
}

export interface WhatsAppTemplate {
  id: string;
  tenant_id: string;
  type: WhatsAppMessageType;
  name: string;
  content_ar: string;
  content_en?: string;
  is_active: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: LocalizedText;
  body: LocalizedText;
  type: 'booking' | 'system' | 'marketing' | 'reminder';
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  booking_id?: string;
  subscription_id?: string;
  customer_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_type: 'booking' | 'deposit' | 'gift_card' | 'subscription' | 'wallet_topup';
  status: PaymentStatus;
  gateway?: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, unknown>;
  refund_amount: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: LocalizedText;
  phone?: string;
  email?: string;
  address?: TenantAddress;
  business_hours?: Record<DayOfWeek, BusinessHours>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SalonImage {
  id: string;
  tenant_id: string;
  url: string;
  caption?: LocalizedText;
  category: 'gallery' | 'before_after' | 'staff' | 'salon';
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ==============================
// App State Types
// ==============================
export interface BookingFlowState {
  step: 'services' | 'staff' | 'datetime' | 'confirm';
  selectedServices: Service[];
  selectedStaff?: Staff;
  selectedDate?: Date;
  selectedTime?: string;
  couponCode?: string;
  giftCardCode?: string;
  notes?: string;
  paymentType: BookingPaymentType;
}

export interface DashboardStats {
  today_bookings: number;
  today_revenue: number;
  occupancy_rate: number;
  new_customers: number;
  pending_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_count: number;
  revenue_change: number;
  bookings_change: number;
}

export interface TimeSlot {
  time: string;
  is_available: boolean;
  staff_id?: string;
  staff_name?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  is_available: boolean;
  staff_id?: string;
  staff_name?: string;
  duration_minutes?: number;
}

export interface CalendarEvent {
  id: string;
  booking_id: string;
  title: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  customer_name: string;
  service_names: string[];
  staff_name: string;
  color?: string;
}