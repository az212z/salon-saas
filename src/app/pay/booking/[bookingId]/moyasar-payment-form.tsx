"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import type { MoyasarFormConfig } from "@/lib/payments/moyasar";

declare global {
  interface Window {
    Moyasar?: {
      init: (config: MoyasarFormConfig) => void;
    };
  }
}

export function MoyasarPaymentForm({ config }: { config: MoyasarFormConfig }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) return;

    if (!window.Moyasar) {
      setError("تعذر تحميل نموذج Moyasar. تحقق من الاتصال وحاول مرة أخرى.");
      return;
    }

    try {
      window.Moyasar.init(config);
    } catch {
      setError("تعذر تهيئة نموذج الدفع. راجع مفاتيح Moyasar وإعدادات Apple Pay إن كانت مفعلة.");
    }
  }, [config, loaded]);

  return (
    <>
      <Script
        src="https://cdn.moyasar.com/mpf/1.15.0/moyasar.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        onError={() => setError("تعذر تحميل مكتبة Moyasar.")}
      />
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <div className="mysr-form min-h-[360px]" />
    </>
  );
}
