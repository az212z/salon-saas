// ============================================================
// WhatsApp Integration — إرسال الرسائل التلقائية والحملات
// ============================================================

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_BUSINESS_TOKEN = process.env.WHATSAPP_BUSINESS_TOKEN;

interface WhatsAppMessage {
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  text?: {
    body: string;
  };
}

// ============================================================
// Send a WhatsApp message
// ============================================================
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to.startsWith('+') ? message.to : `+966${message.to}`,
    };

    if (message.type === 'template') {
      payload.type = 'template';
      payload.template = message.template;
    } else {
      payload.type = 'text';
      payload.text = message.text;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_BUSINESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.error) {
      console.error('WhatsApp API error:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: 'خطأ في إرسال الرسالة' };
  }
}

// ============================================================
// Pre-built message templates
// ============================================================
export async function sendBookingConfirmation(
  phone: string,
  data: {
    customer_name: string;
    salon_name: string;
    booking_number: string;
    date: string;
    time: string;
    services: string[];
    total: number;
  }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `✅ *تأكيد حجزك*\n\n` +
        `مرحباً ${data.customer_name}! 👋\n\n` +
        `تم تأكيد حجزك في *${data.salon_name}*\n\n` +
        `📅 التاريخ: ${data.date}\n` +
        `🕐 الساعة: ${data.time}\n` +
        `✂️ الخدمات: ${data.services.join('، ')}\n` +
        `💰 الإجمالي: ${data.total} ر.س\n\n` +
        `رقم الحجز: *${data.booking_number}*\n\n` +
        `نتطلع لرؤيتك! 💜`
    },
  });
}

export async function sendBookingReminder24h(
  phone: string,
  data: { customer_name: string; salon_name: string; date: string; time: string }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `⏰ *تذكير بالحجز*\n\n` +
        `${data.customer_name}، حجزك في *${data.salon_name}* يوم غد\n\n` +
        `📅 ${data.date}\n🕐 الساعة ${data.time}\n\n` +
        `نتطلع لرؤيتك! ✨`
    },
  });
}

export async function sendBookingReminder2h(
  phone: string,
  data: { customer_name: string; salon_name: string; time: string }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `🕐 *حجزك بعد ساعتين!*\n\n` +
        `${data.customer_name}، حجزك في *${data.salon_name}* الساعة ${data.time}\n\n` +
        `لا تنسي! 💜`
    },
  });
}

export async function sendThankYouAndReview(
  phone: string,
  data: { customer_name: string; salon_name: string; review_link: string }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `💜 *شكراً لزيارتك!*\n\n` +
        `${data.customer_name}، شكراً لاختيارك *${data.salon_name}*\n\n` +
        `رأيك يهمنا! شاركينا تقييمك:\n${data.review_link}\n\n` +
        `كهدية، أحصلي على ٥٠ نقطة ولاء! 🎁`
    },
  });
}

export async function sendMissedYou(
  phone: string,
  data: { customer_name: string; salon_name: string; coupon_code: string; discount: number }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `💜 *اشتقنا لك!*\n\n` +
        `${data.customer_name}، مر زمان بدون زيارتك لـ *${data.salon_name}*\n\n` +
        `عشان نعوضك، خصم *${data.discount}%* على حجزك القادم بكود:\n` +
        `*${data.coupon_code}*\n\n` +
        `احجزي الآن! ✨`
    },
  });
}

export async function sendBirthdayGreeting(
  phone: string,
  data: { customer_name: string; salon_name: string; discount: number }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `🎂 *عيد ميلاد سعيد!*\n\n` +
        `${data.customer_name}، كل سنة وأنتِ بخير! 🎉\n\n` +
        `من *${data.salon_name}* هديتك:\n` +
        `خصم *${data.discount}%* على كل الخدمات هذا الشهر! 💜\n\n` +
        `احجزي الآن وعيشي يومك! ✨`
    },
  });
}

export async function sendNoShowWarning(
  phone: string,
  data: { customer_name: string }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `⚠️ *تنبيه*\n\n` +
        `${data.customer_name}، نلاحظ عدم حضورك للحجز\n\n` +
        `للحفاظ على جودة الخدمة لجميع العملاء، الحجوزات القادمة ستتطلب تأكيد بعربون\n\n` +
        `نتطلع لرؤيتك! 🙏`
    },
  });
}

export async function sendWaitlistNotification(
  phone: string,
  data: { customer_name: string; salon_name: string; date: string; time: string; booking_link: string }
) {
  return sendWhatsAppMessage({
    to: phone,
    type: 'text',
    text: {
      body: `🎉 *توفر موعد!*\n\n` +
        `${data.customer_name}، المورد اللي كنتي تنتظرينه في *${data.salon_name}* صار متاح!\n\n` +
        `📅 ${data.date}\n🕐 الساعة ${data.time}\n\n` +
        `احجزي بسرعة قبل ما ينحجز!\n${data.booking_link}`
    },
  });
}

// ============================================================
// Webhook handler for WhatsApp status updates
// ============================================================
export function verifyWhatsAppWebhook(mode: string, token: string, challenge: string): string | null {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  return null;
}