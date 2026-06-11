import type { Metadata } from "next";

import { RegisterExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "تسجيل صالون | سالوني",
  description: "تجربة تسجيل صالون جديدة مع إعداد الهوية والخطة.",
};

export default function RegisterPage() {
  return <RegisterExperience />;
}
