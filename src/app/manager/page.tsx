import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "صفحة المدير | Saloni Pro",
  description: "لوحة تشغيل للمدير تشمل الحجوزات، العملاء، الفريق، التقارير، وواتساب.",
};

export default function ManagerPage() {
  return <ManagerDashboard />;
}
