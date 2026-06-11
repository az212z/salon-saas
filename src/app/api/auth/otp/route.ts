import { NextResponse } from "next/server";

import { demoOwner, whatsappStatus } from "@/lib/demo-platform";

function hasWhatsAppCredentials() {
  return Boolean(
    process.env.WHATSAPP_BUSINESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_VERIFY_TOKEN
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? "").trim();

  if (phone.length < 8) {
    return NextResponse.json({ ok: false, error: "رقم الجوال مطلوب" }, { status: 400 });
  }

  const configured = hasWhatsAppCredentials();

  return NextResponse.json({
    ok: true,
    mode: configured ? "ready_for_whatsapp_business" : whatsappStatus.mode,
    sent: configured ? false : true,
    code: configured ? undefined : demoOwner.otp,
    message: configured
      ? "مفاتيح واتساب موجودة. الإرسال الفعلي يحتاج قالب OTP معتمد في Meta قبل تشغيله."
      : `وضع demo مفعل. رمز التحقق هو ${demoOwner.otp}.`,
  });
}
