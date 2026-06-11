import type { Metadata } from "next";

import { StaffExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "صفحة الموظفة | سالوني",
  description: "جدول الموظفة اليومي وحالة الحجوزات.",
};

export default function StaffPortalPage() {
  return <StaffExperience />;
}
