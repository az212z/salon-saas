import { NextResponse } from "next/server";
import { customers } from "@/lib/demo-platform";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const customer = customers.find((item) => item.id === params.id || item.phone.includes(params.id));
  if (!customer) {
    return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ customer, mode: "demo" });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const customer = customers.find((item) => item.id === params.id) ?? customers[0];
  return NextResponse.json({ customer: { ...customer, ...body }, mode: "demo" });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ ok: true, id: params.id, mode: "demo" });
}
