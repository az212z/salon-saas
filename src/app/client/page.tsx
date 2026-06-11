import type { Metadata } from "next";

import { SalonSaasApp } from "@/components/salon-saas-app";

export const metadata: Metadata = {
  title: "صفحة العميلة | Luma SalonOS",
  description:
    "بوابة عميلة عربية لحجز خدمات الصالون، متابعة النقاط، واستعراض ملف الجمال.",
};

export default function ClientPage() {
  return <SalonSaasApp initialPortal="client" lockedPortal />;
}
