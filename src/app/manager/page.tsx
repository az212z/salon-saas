import type { Metadata } from "next";

import { ManagerDashboard } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "صفحة المدير | سالوني",
  description: "لوحة تشغيل بريميوم للحجوزات، العملاء، الفريق، ورسائل واتساب.",
};

export default function ManagerPage() {
  return <ManagerDashboard />;
}
