import type { Metadata } from "next";

import { AdminExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "إدارة المنصة | سالوني",
  description: "لوحة إدارة الصالونات والاشتراكات وحالة الربط.",
};

export default function AdminPage() {
  return <AdminExperience />;
}
