import type { Metadata } from "next";

import { ClientExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "تجربة العميل | سالوني",
  description: "حجز صالون عربي واضح مع تحقق واتساب، عربون، وملف ولاء.",
};

export default function ClientPage() {
  return <ClientExperience />;
}
