import { NextResponse } from "next/server";
import { demoOwner } from "@/lib/demo-platform";

function normalizeDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = normalizeDigits(String(body.code ?? body.otp ?? ""));

  if (code !== demoOwner.otp) {
    return NextResponse.json({ ok: false, error: `رمز التحقق التجريبي هو ${demoOwner.otp}` }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    mode: "demo",
    user: {
      id: "demo-ali-owner",
      name: demoOwner.name,
      email: demoOwner.email,
      role: "salon_owner",
    },
  });
}
