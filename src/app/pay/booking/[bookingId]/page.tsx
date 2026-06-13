import { createBookingPaymentFormConfig, isMoyasarConfigured } from "@/lib/payments/moyasar";
import { MoyasarPaymentForm } from "./moyasar-payment-form";

type PageProps = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPaymentPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params;
  const query = await searchParams;
  const tenantId = readParam(query.tenant_id) ?? "";
  const customerId = readParam(query.customer_id);
  const amount = Number(readParam(query.amount) ?? 0);
  const paymentType = readParam(query.payment_type) === "booking" ? "booking" : "deposit";
  const description = readParam(query.description) ?? `عربون حجز ${bookingId}`;

  const canRenderForm = isMoyasarConfigured() && tenantId && amount >= 1;
  const config = canRenderForm
    ? createBookingPaymentFormConfig({
        tenantId,
        bookingId,
        customerId,
        amountSar: amount,
        paymentType,
        description,
      })
    : null;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f3ef] px-4 py-10 text-[#211d24]">
      <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.15.0/moyasar.css" />
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-xl border border-[#e8ded8] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#9a5b55]">دفع العربون</p>
          <h1 className="mt-3 text-3xl font-semibold">أكملي الدفع لتأكيد الحجز</h1>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[#fbf8f6] px-4 py-3">
              <span>رقم الحجز</span>
              <strong dir="ltr">{bookingId}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#fbf8f6] px-4 py-3">
              <span>المبلغ</span>
              <strong>{amount.toLocaleString("ar-SA")} ر.س</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#fbf8f6] px-4 py-3">
              <span>مزود الدفع</span>
              <strong>Moyasar</strong>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[#6f6571]">
            يتم التحقق من الدفع في الخادم بعد الرجوع من Moyasar. لا يتم اعتبار الحجز مدفوعا من مجرد الرجوع للصفحة.
          </p>
        </aside>

        <section className="rounded-xl border border-[#e8ded8] bg-white p-6 shadow-sm">
          {config ? (
            <MoyasarPaymentForm config={config} />
          ) : (
            <div className="rounded-lg border border-[#eadbc5] bg-[#fff9ef] p-5">
              <p className="font-semibold text-[#7d5a10]">بوابة الدفع غير مكتملة</p>
              <p className="mt-2 text-sm leading-7 text-[#846d3d]">
                أضف `MOYASAR_PUBLIC_KEY` و`MOYASAR_SECRET_KEY` في Vercel، وتأكد أن الرابط يحتوي tenant_id ومبلغ صالح.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
