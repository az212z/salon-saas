// ============================================================
// واتساب بزنس API — محرك الإرسال والاستقبال 📱
// WhatsApp Cloud API (Meta) Integration
// ============================================================

import { createClient } from '@/lib/supabase/server';

const WHATSAPP_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

function getConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_BUSINESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !phoneNumberId || !businessAccountId) {
    throw new Error('WhatsApp Business API credentials not configured');
  }

  return { accessToken, phoneNumberId, businessAccountId };
}

// ==========================================
// إرسال رسالة نصية
// ==========================================
export async function sendTextMessage(
  to: string,
  text: string,
  tenantId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig();
    
    // Normalize phone number (add Saudi prefix if needed)
    const normalizedPhone = normalizePhoneNumber(to);
    
    const response = await fetch(`${BASE_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedPhone,
        type: 'text',
        text: { body: text },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('WhatsApp send error:', data.error);
      await logMessage(tenantId, to, text, 'failed', null, data.error.message);
      return { success: false, error: data.error.message };
    }

    const messageId = data.messages?.[0]?.id;
    await logMessage(tenantId, to, text, 'sent', messageId);
    
    return { success: true, messageId };
  } catch (error: any) {
    console.error('WhatsApp send exception:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// إرسال رسالة من قالب (Template)
// ==========================================
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'ar',
  parameters: Record<string, string>[] = [],
  tenantId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig();
    const normalizedPhone = normalizePhoneNumber(to);

    const components: any[] = [];
    if (parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: parameters.map(p => ({
          type: 'text',
          text: Object.values(p)[0],
        })),
      });
    }

    const response = await fetch(`${BASE_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('WhatsApp template error:', data.error);
      return { success: false, error: data.error.message };
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (error: any) {
    console.error('WhatsApp template exception:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// رسائل الحجوزات التلقائية
// ==========================================

export async function sendBookingConfirmation(
  phone: string,
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  date: string,
  time: string,
  staffName?: string,
  tenantId?: string
) {
  const staffText = staffName ? `\n👩‍🎨 الموظفة: ${staffName}` : '';
  const text = `✅ تأكيد حجزك في سالوني\n\n📋 رقم الحجز: ${bookingNumber}\n💆 الخدمة: ${serviceName}\n📅 التاريخ: ${date}\n🕐 الوقت: ${time}${staffText}\n\nنستقبلك بإذن الله! 🌟`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendBookingReminder24h(
  phone: string,
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  date: string,
  time: string,
  tenantId?: string
) {
  const text = `⏰ تذكير: عندك حجز بكرة!\n\n📋 رقم الحجز: ${bookingNumber}\n💆 الخدمة: ${serviceName}\n📅 التاريخ: ${date}\n🕐 الوقت: ${time}\n\nعندك استفسار؟ ردي على هالرسالة 😊`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendBookingReminder2h(
  phone: string,
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  time: string,
  tenantId?: string
) {
  const text = `🔔 حجزك بعد ساعتين!\n\n📋 رقم الحجز: ${bookingNumber}\n💆 الخدمة: ${serviceName}\n🕐 الوقت: ${time}\n\nلا تنسين موعدك 💕`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendBookingThankYou(
  phone: string,
  customerName: string,
  serviceName: string,
  tenantId?: string
) {
  const text = `🌟 شكراً لزيارتك!\n\nأتمنى عجبتك الخدمة: ${serviceName}\n\n⭐ تبي تقيمنا؟ ردي برقم من 1-5\n\nنورتي الصالون دايماً 💕`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendReviewRequest(
  phone: string,
  customerName: string,
  salonName: string,
  reviewLink: string,
  tenantId?: string
) {
  const text = `⭐ شاركينا رأيك!\n\nكيف كانت تجربتك في ${salonName}؟\n\nتقييمك يهمنا ويخلي خدماتنا أحسن 💪\n\n📝 قيّمينا من هنا:\n${reviewLink}`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendMissedYou(
  phone: string,
  customerName: string,
  salonName: string,
  daysSinceLastVisit: number,
  tenantId?: string
) {
  const text = `💜 اشتقنالك!\n\nصار ${daysSinceLastVisit} يوم ما زرتينا في ${salonName}\n\nعندنا عروض حلوة تنتظرك 🎁\n\nحجزي موعدك الآن من التطبيق!`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendBirthdayGreeting(
  phone: string,
  customerName: string,
  salonName: string,
  discountCode: string,
  tenantId?: string
) {
  const text = `🎂 عيد ميلاد سعيد ${customerName}!\n\nكل سنة وأنتِ بخير من ${salonName} 💕\n\n🎁 كود خصم خاص بمناسبة عيد ميلادك:\n${discountCode}\n\nصالح لمدة 7 أيام — لا تفوتيه!`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendNoShowWarning(
  phone: string,
  customerName: string,
  bookingNumber: string,
  tenantId?: string
) {
  const text = `⚠️ تنبيه: عدم حضور الحجز\n\nلم تحضري لحجزك رقم ${bookingNumber}\n\nالرجاء إلغاء الحجز مسبقاً إذا ما قدرتي تحضرين عشان نخصص الوقت لعميلة ثانية 💛`;
  
  return sendTextMessage(phone, text, tenantId);
}

export async function sendWaitlistNotification(
  phone: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string,
  bookingLink: string,
  tenantId?: string
) {
  const text = `🎉 انفتح موعد!\n\nالخدمة: ${serviceName}\n📅 التاريخ: ${date}\n🕐 الوقت: ${time}\n\nاحجزي الآن قبل ما يكمل:\n${bookingLink}`;
  
  return sendTextMessage(phone, text, tenantId);
}

// ==========================================
// إدارة القوالب (Templates)
// ==========================================

export async function getWhatsAppTemplates(businessAccountId?: string) {
  const config = getConfig();
  const accountId = businessAccountId || config.businessAccountId;
  
  const response = await fetch(
    `${BASE_URL}/${accountId}/message_templates?access_token=${config.accessToken}`
  );
  
  return response.json();
}

export async function createWhatsAppTemplate(template: {
  name: string;
  category: string;
  body: string;
  language: string;
}) {
  const config = getConfig();
  
  const response = await fetch(`${BASE_URL}/${config.businessAccountId}/message_templates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: template.name,
      category: template.category,
      components: [
        {
          type: 'BODY',
          text: template.body,
        },
      ],
      language: template.language,
    }),
  });
  
  return response.json();
}

// ==========================================
// معالجة Webhook (استقبال الرسائل)
// ==========================================

export function verifyWebhook(mode: string, token: string): boolean {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  return mode === 'subscribe' && token === verifyToken;
}

export interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        text?: { body: string };
        type: string;
        timestamp: string;
      }>;
      statuses?: Array<{
        id: string;
        status: string;
        recipient_id: string;
        timestamp: string;
      }>;
    };
    field: string;
  }>;
}

export function parseWebhookPayload(body: any): WebhookEntry[] {
  return body?.entry || [];
}

// ==========================================
// أدوات مساعدة
// ==========================================

function normalizePhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Saudi numbers
  if (cleaned.startsWith('05')) {
    cleaned = '966' + cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '966' + cleaned;
  } else if (cleaned.startsWith('+966')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
}

async function logMessage(
  tenantId: string | undefined,
  phone: string,
  content: string,
  status: string,
  externalMessageId: string | null,
  error?: string
) {
  if (!tenantId) return;
  
  try {
    const supabase = await createClient();
    await supabase.from('whatsapp_messages').insert({
      tenant_id: tenantId,
      content,
      status,
      external_message_id: externalMessageId,
      type: 'custom_campaign', // will be overridden by caller
    });
  } catch (e) {
    console.error('Failed to log WhatsApp message:', e);
  }
}

// ==========================================
// حملات واتساب (Bulk Campaigns)
// ==========================================

export async function sendCampaign(
  phones: string[],
  message: string,
  tenantId: string,
  campaignId: string,
  delayMs: number = 200 // Rate limit: ~5 messages/second
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const phone of phones) {
    const result = await sendTextMessage(phone, message, tenantId);
    
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    
    // Rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Update campaign stats
  try {
    const supabase = await createClient();
    await supabase
      .from('whatsapp_campaigns')
      .update({ 
        sent_count: sent, 
        status: 'completed',
      })
      .eq('id', campaignId);
  } catch (e) {
    console.error('Failed to update campaign stats:', e);
  }

  return { sent, failed };
}