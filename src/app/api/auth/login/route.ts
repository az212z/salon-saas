import { NextResponse } from "next/server";

import { demoOwner } from "@/lib/demo-platform";

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = normalizeDigits(String(body.password ?? ""));

  if (email === demoOwner.email && password === demoOwner.password) {
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

  return NextResponse.json(
    {
      ok: false,
      error: `بيانات الاختبار هي ${demoOwner.email} / ${demoOwner.password}`,
    },
    { status: 401 }
  );
}
