import type { Metadata } from "next";

import { LoginExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "دخول علي | سالوني",
  description: "دخول تجريبي جاهز باسم علي لاختبار لوحة سالوني.",
};

export default function LoginPage() {
  return <LoginExperience />;
}
