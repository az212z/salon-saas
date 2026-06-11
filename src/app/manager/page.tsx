import type { Metadata } from "next";

import { SalonSaasApp } from "@/components/salon-saas-app";

export const metadata: Metadata = {
  title: "صفحة المدير | Luma SalonOS",
  description:
    "لوحة مدير عربية لإدارة حجوزات الصالون، العميلات، الإيرادات، والموظفات.",
};

export default function ManagerPage() {
  return <SalonSaasApp initialPortal="salon" lockedPortal />;
}
