import { NextResponse } from "next/server";
import { coupons } from "@/lib/demo-platform";

export async function GET() {
  return NextResponse.json({ coupons, mode: "demo" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(
    {
      coupon: {
        code: body.code ?? "DEMO10",
        title: body.title ?? "عرض تجريبي",
        audience: body.audience ?? "كل العملاء",
        discount: body.discount ?? "10%",
        used: 0,
        revenue: "0 ر.س",
        status: "مسودة",
      },
      mode: "demo",
    },
    { status: 201 },
  );
}
