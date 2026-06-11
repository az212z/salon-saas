import type { Metadata } from "next";

import { ClientExperience } from "@/components/premium-shell";
import { salon } from "@/lib/demo-platform";

export const metadata: Metadata = {
  title: `${salon.name} | حجز موعد`,
  description: "صفحة صالون جاهزة للعميلة مع خدمات، أوقات، وتحقيق رمز واتساب.",
};

export default function SalonPage() {
  return <ClientExperience />;
}
