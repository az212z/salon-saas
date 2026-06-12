import type { Metadata } from "next";
import { StaffExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "بوابة الفريق | Saloni Pro",
  description: "صفحة موظفة الصالون للجدول والحضور وملاحظات المواعيد.",
};

export default function StaffPage() {
  return <StaffExperience />;
}
