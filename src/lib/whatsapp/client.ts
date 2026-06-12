export type WhatsAppConfig = {
  token?: string;
  phoneNumberId?: string;
  verifyToken?: string;
  appSecret?: string;
};

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    token: process.env.WHATSAPP_BUSINESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
  };
}

export function isWhatsAppConfigured() {
  const config = getWhatsAppConfig();
  return Boolean(config.token && config.phoneNumberId && config.verifyToken);
}

export async function sendWhatsAppCloudMessage(to: string, body: string) {
  const config = getWhatsAppConfig();
  if (!isWhatsAppConfigured()) {
    return {
      ok: false,
      demo: true,
      error: "WhatsApp Cloud API is not configured. Message was not sent from a real number.",
    };
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, demo: false, data };
}
