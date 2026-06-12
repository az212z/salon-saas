import type { Metadata } from "next";
import { ClientExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "تجربة العميل | Saloni Pro",
  description: "حجز موعد، تحقق OTP، عربون، وحساب ولاء للعميل.",
};

export default function ClientPage() {
  return <ClientExperience />;
}
