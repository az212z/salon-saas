import { NextResponse } from "next/server";
import { customers } from "@/lib/demo-platform";

type CustomerRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: CustomerRouteContext) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id || item.phone.includes(id));
  if (!customer) {
    return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ customer, mode: "demo" });
}

export async function PATCH(request: Request, { params }: CustomerRouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const customer = customers.find((item) => item.id === id) ?? customers[0];
  return NextResponse.json({ customer: { ...customer, ...body }, mode: "demo" });
}

export async function DELETE(_request: Request, { params }: CustomerRouteContext) {
  const { id } = await params;
  return NextResponse.json({ ok: true, id, mode: "demo" });
}
