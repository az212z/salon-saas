import type { Metadata } from "next";

import { ClientProfileExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "ملف العميلة | سالوني",
  description: "ملف ولاء وجمال للعميلة داخل صالون سالوني.",
};

export default function ClientProfilePage() {
  return <ClientProfileExperience />;
}
