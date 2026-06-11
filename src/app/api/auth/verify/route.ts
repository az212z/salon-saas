import { NextResponse } from "next/server";

import { demoOwner } from "@/lib/demo-platform";

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone ?? "").trim();
  const code = normalizeDigits(String(body.code ?? ""));

  if (!phone || code !== demoOwner.otp) {
    return NextResponse.json(
      { ok: false, error: `رمز التحقق التجريبي هو ${demoOwner.otp}` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "demo",
    user: {
      id: "demo-ali-owner",
      name: demoOwner.name,
      phone,
      role: "salon_owner",
    },
  });
}
