type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const status = readParam(query.status) ?? 'unknown';
  const paymentId = readParam(query.payment_id);
  const message = readParam(query.message);
  const paid = status === 'paid';

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f3ef] px-4 py-16 text-[#211d24]">
      <section className="mx-auto max-w-xl rounded-xl border border-[#e8ded8] bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${paid ? 'bg-[#eaf3e8]' : 'bg-[#fff2df]'}`}>
          {paid ? '✓' : '!'}
        </div>
        <h1 className="mt-5 text-3xl font-semibold">
          {paid ? 'تم تأكيد الدفع' : 'لم يكتمل الدفع'}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6f6571]">
          {paid
            ? 'تم التحقق من الدفع في الخادم، وسيتم تأكيد الحجز في النظام عند توفر Supabase.'
            : message || 'راجع حالة الدفع أو حاول مرة أخرى من رابط الحجز.'}
        </p>
        {paymentId && (
          <p className="mt-5 rounded-lg bg-[#fbf8f6] px-4 py-3 text-xs text-[#6f6571]" dir="ltr">
            {paymentId}
          </p>
        )}
        <a
          href="/client"
          className="mt-6 inline-flex rounded-lg bg-[#211d24] px-5 py-3 text-sm font-semibold text-white"
        >
          العودة لواجهة العميل
        </a>
      </section>
    </main>
  );
}
